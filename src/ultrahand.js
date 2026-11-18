// 究极手控制器：抓、举、转、找粘接点、粘、拆。与输入设备无关——网页、脚本、视频都调这一套。
//
// 分层开关（教学用，网页里可以一层层打开）：
//   teleport   L0 直接改坐标（会穿墙）；关掉 = 用速度把东西“拽”过去，碰到墙会被挡住
//   snapRotate L2 旋转按 45° 一格
//   preview    L3 举着的时候实时找最近的粘接点（绿线）
//   driveAll   L5 举起一坨时，每个零件都按同一个刚体变换去追目标；关掉 = 只拽被抓的那块，其余靠关节拖着
import * as THREE from 'three';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const YAW_AXIS = V(0, 1, 0);

export class Ultrahand {
  constructor(sim, opts = {}) {
    this.sim = sim;
    this.opt = { teleport: false, snapRotate: true, preview: true, driveAll: true, gain: 12, maxSpeed: 14, ...opts };
    this.held = null;   // { part, grabLocal, rel: [{part, dp, dq}], dist, qRel, target }
    this.preview = null;
    this.minDist = 2.5; this.maxDist = 22;
  }

  // 视线方向的水平朝向（只取偏航角）——举着的东西会跟着人转身
  static yawQuat(forward) {
    const f = V(forward.x, 0, forward.z); if (f.lengthSq() < 1e-6) f.set(0, 0, -1);
    return new THREE.Quaternion().setFromAxisAngle(YAW_AXIS, Math.atan2(-f.x, -f.z));
  }

  tryGrab(origin, dir, maxDist = 40) {
    if (this.held) return null;
    const hit = this.sim.raycast(origin, dir, maxDist);
    if (!hit || !hit.part) return null;
    return this.grab(hit.part, hit.point, origin, dir);
  }

  grab(part, worldPoint, camPos, camFwd) {
    const sim = this.sim;
    const ps = sim.pose(part);
    const grabLocal = worldPoint.clone().sub(ps.p).applyQuaternion(ps.q.clone().invert());
    const dist = Math.min(this.maxDist, Math.max(this.minDist, worldPoint.distanceTo(camPos)));
    const yaw = Ultrahand.yawQuat(camFwd);
    // 记住“相对于人的朝向”的姿态，转身时一起转
    const qRel = yaw.clone().invert().multiply(ps.q);
    // 记下整坨里每个零件相对被抓零件的位姿（刚体变换）
    const rel = sim.compParts(part).map(p => {
      const pp = sim.pose(p);
      const qi = ps.q.clone().invert();
      return { part: p, dp: pp.p.clone().sub(ps.p).applyQuaternion(qi), dq: qi.multiply(pp.q) };
    });
    for (const r of rel) r.part.held = true;
    // 只有被“追目标”的刚体关掉重力；只拽一块时，其余零件照常受重力（会往下坠）
    const driven = this.opt.driveAll ? sim.compBodies(part) : [part.body];
    for (const b of driven) { b.setGravityScale(0, true); b.wakeUp(); }
    this.held = { part, grabLocal, rel, dist, qRel, t0: sim.time };
    return this.held;
  }

  // 每帧：算目标位姿，把零件拽过去
  update(dt, camPos, camFwd) {
    const h = this.held; if (!h) { this.preview = null; return; }
    const sim = this.sim;
    // 有零件在举的过程中被别的逻辑拆走/断开了：刷新整坨名单
    const comp = sim.compParts(h.part);
    if (comp.length !== h.rel.length) this._refreshRel();
    const yaw = Ultrahand.yawQuat(camFwd);
    const qT = yaw.clone().multiply(h.qRel);
    const anchor = camPos.clone().addScaledVector(camFwd.clone().normalize(), h.dist);
    const pT = anchor.clone().sub(h.grabLocal.clone().applyQuaternion(qT)); // 被抓零件中心的目标位置
    h.target = { p: pT, q: qT, anchor };
    const drive = this.opt.driveAll ? h.rel : h.rel.filter(r => r.part === h.part);
    const doneBodies = new Set();
    for (const r of drive) {
      const body = r.part.body; if (doneBodies.has(body)) continue; doneBodies.add(body);
      // 由零件的目标位姿反推刚体的目标位姿
      const qPart = qT.clone().multiply(r.dq);
      const pPart = pT.clone().add(r.dp.clone().applyQuaternion(qT));
      const qBody = qPart.clone().multiply(r.part.local.q.clone().invert());
      const pBody = pPart.clone().sub(r.part.local.p.clone().applyQuaternion(qBody));
      if (this.opt.teleport) {
        body.setTranslation(pBody, true); body.setRotation(qBody, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true); body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        continue;
      }
      // 速度驱动：v = (目标 - 当前) × 增益，限速 —— 碰到墙就会被物理挡住
      const t = body.translation(), q = body.rotation();
      const v = pBody.clone().sub(V(t.x, t.y, t.z)).multiplyScalar(this.opt.gain);
      if (v.length() > this.opt.maxSpeed) v.setLength(this.opt.maxSpeed);
      const qc = new THREE.Quaternion(q.x, q.y, q.z, q.w);
      const dq = qBody.clone().multiply(qc.clone().invert());
      if (dq.w < 0) { dq.x *= -1; dq.y *= -1; dq.z *= -1; dq.w *= -1; }
      const ang = 2 * Math.acos(Math.min(1, dq.w));
      const s = Math.sqrt(Math.max(1e-9, 1 - dq.w * dq.w));
      const w = ang < 1e-4 ? V() : V(dq.x / s, dq.y / s, dq.z / s).multiplyScalar(ang * this.opt.gain * 0.8);
      if (w.length() > 9) w.setLength(9);
      body.setLinvel(v, true); body.setAngvel(w, true);
    }
    this.preview = this.opt.preview ? sim.closestGlue(h.part) : null;
  }

  _refreshRel() {
    const h = this.held, sim = this.sim;
    for (const r of h.rel) r.part.held = false;
    const ps = sim.pose(h.part); const qi = ps.q.clone().invert();
    h.rel = sim.compParts(h.part).map(p => { const pp = sim.pose(p); return { part: p, dp: pp.p.clone().sub(ps.p).applyQuaternion(qi), dq: qi.clone().multiply(pp.q) }; });
    for (const r of h.rel) r.part.held = true;
    // 掉队的零件恢复重力
    for (const p of sim.liveParts()) if (!p.held) p.body.setGravityScale(1, true);
    for (const b of (this.opt.driveAll ? sim.compBodies(h.part) : [h.part.body])) b.setGravityScale(0, true);
  }

  // 旋转：axis = 'yaw' 绕世界竖直轴；'pitch' 绕“人的右手方向”取整到最近的水平世界轴
  rotate(axis, steps = 1, camFwd = V(0, 0, -1)) {
    const h = this.held; if (!h) return;
    const step = this.opt.snapRotate ? Math.PI / 4 : Math.PI / 12;
    let ax;
    if (axis === 'yaw') ax = V(0, 1, 0);
    else {
      // 在“人的坐标系”里：右手方向就是局部 X
      ax = V(1, 0, 0);
      if (axis === 'roll') ax = V(0, 0, 1);
    }
    const r = new THREE.Quaternion().setFromAxisAngle(ax, step * steps);
    h.qRel.premultiply(r);
    if (this.opt.snapRotate) snapQuat(h.qRel);
  }
  push(delta) { if (this.held) this.held.dist = Math.min(this.maxDist, Math.max(this.minDist, this.held.dist + delta)); }

  // 松手：有预览就先“吸”过去贴紧，再粘
  release(glue = true) {
    const h = this.held; if (!h) return null;
    const sim = this.sim;
    let result = null;
    const pv = glue && this.opt.preview ? sim.closestGlue(h.part) : null;
    if (pv) {
      // 整坨平移 gap，让两点贴上
      const gap = pv.pb.clone().sub(pv.pa);
      for (const b of sim.compBodies(h.part)) { const t = b.translation(); b.setTranslation({ x: t.x + gap.x, y: t.y + gap.y, z: t.z + gap.z }, true); }
      const wa = pv.pa.clone().add(gap);
      result = sim.glue(pv.a, pv.b, wa, pv.pb);
    }
    for (const p of sim.liveParts()) if (p.held) p.held = false;
    for (const b of sim.compBodies(h.part)) {
      b.setGravityScale(1, true);
      const v = b.linvel(); b.setLinvel({ x: v.x * 0.3, y: v.y * 0.3, z: v.z * 0.3 }, true);
      const w = b.angvel(); b.setAngvel({ x: w.x * 0.3, y: w.y * 0.3, z: w.z * 0.3 }, true);
    }
    for (const r of h.rel) if (!r.part.body) continue; else r.part.body.setGravityScale(1, true);
    this.held = null; this.preview = null;
    return result || { released: true };
  }
  // 摇一摇：把被抓的这块从整坨里拆下来
  unglue() {
    const h = this.held; if (!h) return 0;
    const n = this.sim.unglue(h.part);
    this._refreshRel();
    return n;
  }
}

// 把四元数吸附到最近的 45° 网格（让方块对齐）
function snapQuat(q) {
  const e = new THREE.Euler().setFromQuaternion(q, 'YXZ');
  const s = Math.PI / 4;
  e.set(Math.round(e.x / s) * s, Math.round(e.y / s) * s, Math.round(e.z / s) * s, 'YXZ');
  q.setFromEuler(e);
}
