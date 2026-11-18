// 物理世界：Rapier 刚体 + 粘合图（glue graph）。
// 设计：粘合关系先记在“图”里（零件=点，粘合=边），再按模式“实现”成物理：
//   joint  —— 每个零件一个刚体，每条边一个固定关节（摇晃、会弯）
//   merge  —— 一整坨零件合成一个刚体（铁板一块，最稳）
//   besiege —— 关节模式 + 受力过大就断
// 轮子永远是转动关节（两个球关节串成合页 + 电机扭矩），因为合并以后就转不动了。
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { PARTS, PART_LIMIT, halfExtents } from './parts.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const Q = () => new THREE.Quaternion();
const r2v = v => V(v.x, v.y, v.z);
const r2q = q => new THREE.Quaternion(q.x, q.y, q.z, q.w);
const plain = v => ({ x: v.x, y: v.y, z: v.z });
const plainQ = q => ({ x: q.x, y: q.y, z: q.z, w: q.w });

export async function initPhysics() { await RAPIER.init(); }

export class Sim {
  constructor({ mode = 'joint', iterations = 4, breakForce = 6000 } = {}) {
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    this.world.timestep = 1 / 60;
    this.setIterations(iterations);
    this.mode = mode;            // joint | merge | besiege
    this.breakForce = breakForce; // besiege 模式下关节允许的最大误差力（经验值）
    this.parts = [];             // 下标 = id
    this.edges = [];             // { id, a, b, kind:'fixed'|'hinge', pa, pb, fa, fb, joints:[], born }
    this.bodyParts = new Map();  // body.handle -> [part]
    this.colliderPart = new Map(); // collider.handle -> part
    this.time = 0; this.edgeSeq = 0;
    this.events = [];            // { t, type:'glue'|'break'|'unglue', pos }
    this.statics = [];
    const self = this;
    this.hooks = {
      filterContactPair(c1, c2, b1, b2) {
        const p1 = self.colliderPart.get(c1), p2 = self.colliderPart.get(c2);
        if (p1 && p2 && p1.comp === p2.comp) return RAPIER.SolverFlags.EMPTY; // 同一坨零件之间不互相碰
        return RAPIER.SolverFlags.COMPUTE_IMPULSE;
      },
      filterIntersectionPair() { return true; },
    };
  }
  setIterations(n) { this.iterations = n; this.world.integrationParameters.numSolverIterations = n; }

  // ------------------------------------------------------------ 地形
  addGround(size = 400) {
    const b = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(size, 0.5, size).setTranslation(0, -0.5, 0).setFriction(0.9), b);
    this.ground = b;
    return b;
  }
  addStaticBox(p, half, rotY = 0, tilt = 0) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, rotY, 0, 'YXZ'));
    const b = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(p[0], p[1], p[2]).setRotation(plainQ(q)));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(...half).setFriction(0.9), b);
    this.statics.push({ p, half, q, kind: 'box' });
    return b;
  }

  // 闸门：kinematic=按动画硬推（质量无穷大）；dynamic=物理驱动（只能上下滑，会被挡住）
  addGate(p, half, kinematic) {
    const desc = kinematic ? RAPIER.RigidBodyDesc.kinematicPositionBased() : RAPIER.RigidBodyDesc.dynamic().setLinearDamping(0.5);
    const b = this.world.createRigidBody(desc.setTranslation(p[0], p[1], p[2]));
    if (!kinematic) { b.setEnabledTranslations(false, true, false, true); b.lockRotations(true, true); }
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(...half).setDensity(kinematic ? 1 : 2400).setFriction(0.6), b);
    const g = { body: b, half, kinematic };
    (this.gates ||= []).push(g);
    return g;
  }
  // ------------------------------------------------------------ 零件
  spawn(type, pos, quat = Q()) {
    const def = PARTS[type];
    const part = { id: this.parts.length, type, def, body: null, colliders: [], local: { p: V(), q: Q() }, comp: 0,
      power: false, burn: 0, spin: 0, held: false };
    part.comp = part.id + 1;
    this.parts.push(part);
    this._makeBody([part], [{ p: V(...pos), q: quat.clone() }], V(), V());
    return part;
  }
  _colliderDesc(part) {
    const s = part.def.shape;
    const d = s[0] === 'box' ? RAPIER.ColliderDesc.cuboid(s[1], s[2], s[3])
      : s[0] === 'cyl' ? RAPIER.ColliderDesc.cylinder(s[1], s[2]) : RAPIER.ColliderDesc.ball(s[1]);
    return d.setDensity(part.def.density).setFriction(part.def.friction).setActiveHooks(RAPIER.ActiveHooks.FILTER_CONTACT_PAIRS);
  }
  // 把一组零件（已知世界位姿）做成一个刚体
  _makeBody(parts, poses, lin, ang) {
    const p0 = poses[0].p.clone();
    if (parts.length > 1) { p0.set(0, 0, 0); poses.forEach(ps => p0.add(ps.p)); p0.multiplyScalar(1 / poses.length); }
    const q0 = poses[0].q.clone();
    const desc = RAPIER.RigidBodyDesc.dynamic().setTranslation(p0.x, p0.y, p0.z).setRotation(plainQ(q0))
      .setLinearDamping(0.05).setAngularDamping(0.15).setCcdEnabled(true).setCanSleep(true);
    const body = this.world.createRigidBody(desc);
    const qi = q0.clone().invert();
    parts.forEach((part, i) => {
      part.body = body;
      part.local.p.copy(poses[i].p).sub(p0).applyQuaternion(qi);
      part.local.q.copy(qi).multiply(poses[i].q);
      const c = this.world.createCollider(this._colliderDesc(part).setTranslation(part.local.p.x, part.local.p.y, part.local.p.z)
        .setRotation(plainQ(part.local.q)), body);
      part.colliders = [c];
      this.colliderPart.set(c.handle, part);
    });
    body.setLinvel(plain(lin), true); body.setAngvel(plain(ang), true);
    this.bodyParts.set(body.handle, parts.slice());
    return body;
  }
  pose(part, outP = V(), outQ = Q()) {
    const t = part.body.translation(), r = part.body.rotation();
    const bq = r2q(r);
    outP.copy(part.local.p).applyQuaternion(bq).add(r2v(t));
    outQ.copy(bq).multiply(part.local.q);
    return { p: outP, q: outQ };
  }
  partVel(part) {
    const b = part.body, p = this.pose(part).p;
    const c = r2v(b.translation()); const w = r2v(b.angvel());
    return { lin: r2v(b.linvel()).add(w.clone().cross(p.sub(c))), ang: w };
  }
  bodyOf(part) { return part.body; }
  partsOfBody(body) { return this.bodyParts.get(body.handle) || []; }
  compParts(part) { return this.parts.filter(p => p.comp === part.comp && !p.dead); }
  compBodies(part) { return [...new Set(this.compParts(part).map(p => p.body))]; }

  // ------------------------------------------------------------ 粘合图
  edgesOf(part) { return this.edges.filter(e => e.a === part.id || e.b === part.id); }
  _recomputeComps(seedParts) {
    // 从 seedParts 出发沿边做 BFS，重新编号连通块
    const seen = new Set();
    for (const s of seedParts) {
      if (seen.has(s.id)) continue;
      const comp = ++this._compSeq || (this._compSeq = 1000);
      const stack = [s];
      while (stack.length) {
        const p = stack.pop(); if (seen.has(p.id)) continue;
        seen.add(p.id); p.comp = comp;
        for (const e of this.edgesOf(p)) { const o = this.parts[e.a === p.id ? e.b : e.a]; if (!seen.has(o.id)) stack.push(o); }
      }
    }
  }
  compSize(part) { return this.compParts(part).length; }

  // 粘：partA 上的世界点 wa 与 partB 上的世界点 wb 已经贴在一起（调用方负责先把东西挪过去）
  glue(partA, partB, wa, wb) {
    if (partA.comp === partB.comp) return null;
    if (this.compSize(partA) + this.compSize(partB) > PART_LIMIT) return { refused: 'limit' };
    const pa = this.pose(partA), pb = this.pose(partB);
    const hinge = partA.type === 'wheel' || partB.type === 'wheel';
    let e;
    if (hinge && !(partA.type === 'wheel' && partB.type === 'wheel')) {
      const [wheel, other, ww] = partA.type === 'wheel' ? [partA, partB, wa] : [partB, partA, wb];
      const wp = this.pose(wheel);
      // 轮毂：靠近接触点的那个端面中心
      const hh = PARTS.wheel.shape[1];
      const axis = V(0, 1, 0).applyQuaternion(wp.q);
      const side = Math.sign(ww.clone().sub(wp.p).dot(axis)) || 1;
      const hub = wp.p.clone().addScaledVector(axis, side * hh);
      const inner = wp.p.clone().addScaledVector(axis, -side * hh);
      const op = this.pose(other);
      const toLocal = (P, ps) => P.clone().sub(ps.p).applyQuaternion(ps.q.clone().invert());
      e = { kind: 'hinge', a: wheel.id, b: other.id,
        pa: [toLocal(hub, wp), toLocal(inner, wp)], pb: [toLocal(hub, op), toLocal(inner, op)], side };
    } else {
      const mid = wa.clone().add(wb).multiplyScalar(0.5);
      const toLocal = (P, ps) => P.clone().sub(ps.p).applyQuaternion(ps.q.clone().invert());
      e = { kind: 'fixed', a: partA.id, b: partB.id, pa: [toLocal(mid, pa)], pb: [toLocal(mid, pb)],
        fa: pa.q.clone().invert(), fb: pb.q.clone().invert() };
    }
    e.id = ++this.edgeSeq; e.born = this.time; e.joints = [];
    this.edges.push(e);
    const affected = [...this.compParts(partA), ...this.compParts(partB)];
    this._recomputeComps([partA]);
    this._realize(affected);
    this.events.push({ t: this.time, type: 'glue', pos: plain(e.kind === 'hinge' ? this._edgeWorld(e)[0] : wa.clone().add(wb).multiplyScalar(0.5)) });
    return e;
  }
  unglue(part) {
    const es = this.edgesOf(part); if (!es.length) return 0;
    const affected = this.compParts(part);
    for (const e of es) this._dropEdge(e, 'unglue');
    this._recomputeComps(affected);
    this._realize(affected);
    return es.length;
  }
  _dropEdge(e, why) {
    for (const j of e.joints) if (this.world.getImpulseJoint(j.handle)) this.world.removeImpulseJoint(j, true);
    e.joints = [];
    this.edges.splice(this.edges.indexOf(e), 1);
    const w = this._edgeWorld(e)[0];
    this.events.push({ t: this.time, type: why, pos: plain(w) });
  }
  _edgeWorld(e) {
    const ps = this.pose(this.parts[e.a]);
    return e.pa.map(p => p.clone().applyQuaternion(ps.q).add(ps.p));
  }
  edgeWorld(e) { return this._edgeWorld(e); }

  setMode(mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    const all = this.parts.filter(p => !p.dead);
    this._realize(all);
  }

  // 按当前模式把一批零件重新“实现”成刚体 + 关节（保持它们当下的位姿和速度）
  _realize(parts) {
    const ids = new Set(parts.map(p => p.id));
    const snap = new Map(parts.map(p => { const ps = this.pose(p); const v = this.partVel(p); return [p.id, { p: ps.p.clone(), q: ps.q.clone(), lin: v.lin, ang: v.ang }]; }));
    const held = new Map(parts.map(p => [p.id, p.held]));
    // 先拆关节、刚体
    for (const e of this.edges) if (ids.has(e.a)) { for (const j of e.joints) if (this.world.getImpulseJoint(j.handle)) this.world.removeImpulseJoint(j, true); e.joints = []; }
    const bodies = new Set(parts.map(p => p.body));
    for (const b of bodies) {
      for (const p of this.bodyParts.get(b.handle) || []) for (const c of p.colliders) this.colliderPart.delete(c.handle);
      this.bodyParts.delete(b.handle);
      this.world.removeRigidBody(b);
    }
    // 分簇：merge 模式下用固定边连起来的零件合成一簇；其他模式一件一簇
    const cluster = new Map(parts.map(p => [p.id, p.id]));
    const find = i => { while (cluster.get(i) !== i) i = cluster.get(i); return i; };
    if (this.mode === 'merge') for (const e of this.edges) if (ids.has(e.a) && e.kind === 'fixed') cluster.set(find(e.a), find(e.b));
    const groups = new Map();
    for (const p of parts) { const r = find(p.id); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(p); }
    for (const g of groups.values()) {
      const lin = V(), ang = V();
      g.forEach(p => { lin.add(snap.get(p.id).lin); ang.add(snap.get(p.id).ang); });
      lin.multiplyScalar(1 / g.length); ang.multiplyScalar(1 / g.length);
      const body = this._makeBody(g, g.map(p => snap.get(p.id)), lin, ang);
      if (g.some(p => held.get(p.id))) body.setGravityScale(0, true);
    }
    // 再连关节
    for (const e of this.edges) if (ids.has(e.a)) this._makeJoints(e);
  }
  _makeJoints(e) {
    const A = this.parts[e.a], B = this.parts[e.b];
    if (A.body === B.body) return;
    const toBody = (part, p) => p.clone().applyQuaternion(part.local.q).add(part.local.p);
    if (e.kind === 'fixed') {
      const fa = part2bodyFrame(A, e.fa), fb = part2bodyFrame(B, e.fb);
      const jd = RAPIER.JointData.fixed(plain(toBody(A, e.pa[0])), plainQ(fa), plain(toBody(B, e.pb[0])), plainQ(fb));
      e.joints = [this.world.createImpulseJoint(jd, A.body, B.body, true)];
    } else {
      e.joints = e.pa.map((pa, i) => this.world.createImpulseJoint(
        RAPIER.JointData.spherical(plain(toBody(A, pa)), plain(toBody(B, e.pb[i]))), A.body, B.body, true));
    }
    for (const j of e.joints) j.setContactsEnabled(false);
  }

  // ------------------------------------------------------------ 动力
  togglePower(part, on) {
    const ps = this.compParts(part).filter(p => p.def.device);
    const want = on ?? !ps.some(p => p.power);
    for (const p of ps) { p.power = want; if (want && p.type === 'rocket') p.burn = p.def.power.burn; }
    return ps.length;
  }
  _devices(dt) {
    for (const p of this.parts) {
      if (p.dead || !p.def.device) continue;
      const ps = this.pose(p);
      const pw = p.def.power;
      if (!p.power) { p.spin *= 0.97; continue; }
      if (p.type === 'balloon') { // 热气球：开了才有浮力；上升越快浮力越小（限一个温和的爬升速度）
        const vy = this.partVel(p).lin.y;
        p.body.addForceAtPoint({ x: 0, y: pw.lift * Math.max(0.6, Math.min(1.1, 1 - 0.06 * vy)), z: 0 }, plain(ps.p), true);
        continue;
      }
      if (p.type === 'fan') {
        const f = V(0, 0, 1).applyQuaternion(ps.q).multiplyScalar(pw.thrust);
        p.body.addForceAtPoint(plain(f), plain(ps.p), true);
        p.spin += dt * 40;
      } else if (p.type === 'rocket') {
        if (p.burn <= 0) { p.power = false; continue; }
        p.burn -= dt;
        const f = V(0, 1, 0).applyQuaternion(ps.q).multiplyScalar(pw.thrust);
        p.body.addForceAtPoint(plain(f), plain(ps.p), true);
      } else if (p.type === 'wheel') {
        const e = this.edges.find(e => e.kind === 'hinge' && e.a === p.id);
        if (!e) continue;
        const other = this.parts[e.b];
        const axis = V(0, 1, 0).applyQuaternion(ps.q).multiplyScalar(-e.side); // 让所有轮子“向前”转的方向一致
        const rel = r2v(p.body.angvel()).sub(r2v(other.body.angvel())).dot(axis);
        const tq = Math.max(-pw.torque, Math.min(pw.torque, (pw.speed * (p.dir || 1) - rel) * 260));
        p.body.addTorque(plain(axis.clone().multiplyScalar(tq)), true);
        other.body.addTorque(plain(axis.clone().multiplyScalar(-tq)), true);
      }
    }
  }

  // ------------------------------------------------------------ Besiege：关节会断
  _breakCheck(dt) {
    if (this.mode !== 'besiege') return;
    for (const e of [...this.edges]) {
      if (!e.joints.length) continue;
      // 用“关节两端漂开了多远”估计关节在扛多大的力：误差 × 等效刚度 × 质量
      const A = this.parts[e.a], B = this.parts[e.b];
      const pa = this.pose(A), pb = this.pose(B);
      const wa = e.pa[0].clone().applyQuaternion(pa.q).add(pa.p);
      const wb = e.pb[0].clone().applyQuaternion(pb.q).add(pb.p);
      const err = wa.distanceTo(wb);
      const m = Math.min(A.body.mass(), B.body.mass());
      const f = err * m * 3600;
      e.stress = f / this.breakForce;
      e.over = f > this.breakForce ? (e.over || 0) + 1 : 0;
      if (e.over >= 4) { // 连续 4 帧超载才断，避免一帧的数值抖动

        const affected = [...this.compParts(A)];
        this._dropEdge(e, 'break');
        this._recomputeComps(affected);
        this._realize(affected);
      }
    }
  }

  step(dt = 1 / 60) {
    this._devices(dt);
    this.world.step(undefined, this.hooks);
    for (const p of this.parts) if (!p.dead) p.body.resetForces(false), p.body.resetTorques(false);
    this._breakCheck(dt);
    this.time += dt;
  }

  // ------------------------------------------------------------ 查询
  syncQueries() { this.world.propagateModifiedBodyPositionsToColliders(); this.world.updateSceneQueries(); }
  raycast(origin, dir, maxDist = 40) {
    this.syncQueries();
    const hit = this.world.castRay(new RAPIER.Ray(plain(origin), plain(dir)), maxDist, true);
    if (!hit) return null;
    const part = this.colliderPart.get(hit.collider.handle);
    const toi = hit.timeOfImpact ?? hit.toi;
    return { part, dist: toi, point: origin.clone().addScaledVector(dir, toi) };
  }
  // 找“被举着的这一坨”离别的零件最近的一对点（就是游戏里那根绿色的预览线）
  closestGlue(heldPart, reach = 0.9) {
    this.world.propagateModifiedBodyPositionsToColliders();
    const mine = this.compParts(heldPart);
    let best = null;
    const tmp = V();
    for (const a of mine) {
      const pa = this.pose(a).p.clone();
      for (const b of this.parts) {
        if (b.dead || b.comp === a.comp || b.held) continue;
        if (tmp.copy(this.pose(b).p).distanceTo(pa) > reachR(a) + reachR(b) + reach) continue;
        const c = a.colliders[0].contactCollider(b.colliders[0], reach);
        if (!c) continue;
        if (!best || c.distance < best.dist) best = { a, b, dist: c.distance, pa: r2v(c.point1), pb: r2v(c.point2), n: r2v(c.normal1) };
      }
    }
    return best;
  }
  liveParts() { return this.parts.filter(p => !p.dead); }
}

const reachR = p => Math.hypot(...halfExtents(p.type));
function part2bodyFrame(part, frame) { return part.local.q.clone().multiply(frame); }
