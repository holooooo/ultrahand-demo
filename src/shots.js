// 视频里的每一个演示镜头：初始摆放 + 时间轴上的操作 + 机位。全部确定性。
import * as THREE from 'three';
import { buildCar, buildFlyer, buildBridge, glueTo } from './presets.js';
import { orbit, smooth, lerpV } from './director.js';
import { PART_LIMIT } from './parts.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const qE = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'YXZ'));
const H = Math.PI / 2;

// ---- 操作小工具 ----------------------------------------------------------
// 盯着某点（平滑转头）
const aimAt = (ctx, target, k = 1) => { const want = target.clone().sub(ctx.eye).normalize(); ctx.fwd.lerp(want, k).normalize(); };
// 抓住零件上的某个本地点
function grabLocal(ctx, part, local = V()) {
  const ps = ctx.sim.pose(part);
  const wp = local.clone().applyQuaternion(ps.q).add(ps.p);
  ctx.fwd.copy(wp).sub(ctx.eye).normalize();
  return ctx.uh.grab(part, wp, ctx.eye.clone(), ctx.fwd.clone());
}
// 让手里的东西（抓点）沿着 path(t) 走：改视线方向和距离
function carryTo(ctx, P) {
  if (!ctx.uh.held) return;
  const d = P.clone().sub(ctx.eye); ctx.uh.held.dist = Math.max(1.2, d.length()); ctx.fwd.copy(d.normalize());
}
const keyPath = (keys) => (t) => { // keys: [[t, Vector3], ...] 平滑插值
  if (t <= keys[0][0]) return keys[0][1].clone();
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const k = smooth((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return lerpV(keys[i - 1][1], keys[i][1], k); }
  return keys[keys.length - 1][1].clone();
};
const fp = (ctx, extra = V(0, 0, 0)) => ({ pos: ctx.eye.clone().add(extra), look: ctx.eye.clone().add(extra).add(ctx.fwd), fov: 62 });
const camKeys = (keys) => (ctx, t) => {   // keys: [[t, pos, look, fov]]
  let i = 1; while (i < keys.length - 1 && t > keys[i][0]) i++;
  const [t0, p0, l0, f0] = keys[i - 1], [t1, p1, l1, f1] = keys[i];
  const k = smooth((t - t0) / Math.max(1e-6, t1 - t0));
  const L = (a, b) => typeof a === 'function' ? (typeof b === 'function' ? lerpV(a(ctx, t), b(ctx, t), k) : lerpV(a(ctx, t), b, k)) : typeof b === 'function' ? lerpV(a, b(ctx, t), k) : lerpV(a, b, k);
  return { pos: L(p0, p1), look: L(l0, l1), fov: (f0 || 50) + ((f1 || 50) - (f0 || 50)) * k };
};
const partPos = (name, add = V()) => (ctx) => ctx.sim.pose(ctx.data[name]).p.clone().add(add);

// ---- 镜头 -----------------------------------------------------------------
export const SHOTS = {};
const shot = s => (SHOTS[s.id] = s);

// 开场成品：一台没装风扇的小车 + 地上一块木板、一个风扇。抓木板→转 90°→放上车→粘；抓风扇→转→装车尾→粘；开动力→车开走。
shot({
  id: 'hero', dur: 26, hand: true,
  setup(ctx) {
    const { sim } = ctx;
    const car = buildCar(sim, V(0, 0, 0), 0, { fan: false });
    ctx.data.board = car.board; ctx.data.car = car;
    ctx.data.plank = sim.spawn('plank', [-1.2, 0.07, 3.0]);
    ctx.data.fan = sim.spawn('fan', [-3.2, 0.37, 1.8]);
    sim.spawn('crate', [4.5, 0.43, -3.5]); sim.spawn('log', [-4, 0.25, -3], qE(0, 0.4, H));
    ctx.eye.set(-3.8, 1.75, 6.2); aimAt(ctx, V(-1.2, 0.1, 3.0));
    const flyer = buildFlyer(sim, V(9, 0, -9), 0.6); ctx.data.flyer = flyer;
  },
  actions: [
    [0.6, ctx => { grabLocal(ctx, ctx.data.plank, V(0.3, 0.06, 0)); ctx.data.path = keyPath([[0.6, ctx.uh.held.anchor0 || ctx.sim.pose(ctx.data.plank).p.clone().add(V(0.3, 0.06, 0))], [1.6, V(-0.6, 1.6, 2.4)], [3.4, V(-0.2, 1.4, 1.2)], [4.6, V(0.15, 0.92, 0.1)]]); }],
    [1.9, ctx => ctx.uh.rotate('yaw', 1)], [2.5, ctx => ctx.uh.rotate('yaw', 1)],
    [5.0, ctx => { ctx.uh.release(); ctx.data.path = null; }],
    [6.0, ctx => { grabLocal(ctx, ctx.data.fan, V(0, 0.36, 0)); ctx.data.path = keyPath([[6.0, ctx.sim.pose(ctx.data.fan).p.clone().add(V(0, 0.36, 0))], [7.0, V(-2.4, 1.9, 1.2)], [8.8, V(-1.05, 1.36, 0.0)]]); }],
    [7.2, ctx => ctx.uh.rotate('yaw', 1)], [7.7, ctx => ctx.uh.rotate('yaw', 1)],
    [9.3, ctx => { ctx.uh.release(); ctx.data.path = null; }],
    [10.4, ctx => { ctx.sim.togglePower(ctx.data.board, true); }],
    [11.0, ctx => { ctx.sim.togglePower(ctx.data.flyer.board, true); }],
  ],
  step(ctx, t) {
    if (ctx.data.path && ctx.uh.held) carryTo(ctx, ctx.data.path(t));
    if (!ctx.uh.held && t > 5 && t < 6) aimAt(ctx, ctx.sim.pose(ctx.data.fan).p, 0.06);
    if (t > 9.3) aimAt(ctx, ctx.sim.pose(ctx.data.board).p, 0.05);
  },
  cam: camKeys([
    [0, ctx => ctx.eye.clone(), ctx => ctx.eye.clone().add(ctx.fwd), 62],
    [9.6, ctx => ctx.eye.clone(), ctx => ctx.eye.clone().add(ctx.fwd), 62],
    [10.6, ctx => ctx.sim.pose(ctx.data.board).p.clone().add(V(-5.5, 2.4, 4.2)), ctx => ctx.sim.pose(ctx.data.board).p.clone().add(V(1, 0.3, 0)), 50],
    [17, ctx => ctx.sim.pose(ctx.data.board).p.clone().add(V(-3.2, 1.5, 4.8)), ctx => ctx.sim.pose(ctx.data.board).p.clone().add(V(2, 0.3, 0)), 50],
    [26, ctx => ctx.sim.pose(ctx.data.board).p.clone().add(V(-8, 4.5, 6)), ctx => ctx.sim.pose(ctx.data.board).p.clone().add(V(4, 1.5, -3)), 46],
  ]),
});
// hand only while first-person
SHOTS.hero.handAt = t => t < 9.6;

// 气球飞板：结尾、动力章节用
shot({
  id: 'flyer', dur: 16,
  setup(ctx) { ctx.data.f = buildFlyer(ctx.sim, V(0, 0, 0), 0); buildCar(ctx.sim, V(-6, 0, 5), 0.4); },
  actions: [[2.0, ctx => ctx.sim.togglePower(ctx.data.f.board, true)]],
  cam: orbit((ctx) => ctx.sim.pose(ctx.data.f.board).p.clone().add(V(0, 0.4, 0)), 8.5, 1.8, 0.4, 1.6, 16, 48),
});

// 闸门：运动学（无穷质量）把冰压进地里 vs 物理闸门被冰顶住
for (const kin of [true, false]) shot({
  id: kin ? 'gate_kin' : 'gate_phys', dur: 9,
  setup(ctx) {
    const { sim } = ctx;
    sim.addStaticBox([-1.6, 1.6, 0], [0.35, 1.6, 0.8]); sim.addStaticBox([1.6, 1.6, 0], [0.35, 1.6, 0.8]);
    sim.addStaticBox([0, 3.4, 0], [1.95, 0.2, 0.8]);
    ctx.data.gate = sim.addGate([0, 2.2, 0], [1.15, 0.95, 0.3], kin);
    if (!kin) ctx.data.gate.body.setGravityScale(0, true);
    ctx.data.ice = sim.spawn('ice', [2.6, 0.46, 1.6]);
    ctx.eye.set(5.2, 1.6, 2.6); aimAt(ctx, V(2.6, 0.4, 1.6));
  },
  actions: [
    [0.5, ctx => grabLocal(ctx, ctx.data.ice, V(0, 0.45, 0))],
    [0.5, ctx => { ctx.data.path = keyPath([[0.5, ctx.sim.pose(ctx.data.ice).p.clone().add(V(0, 0.45, 0))], [1.6, V(1.0, 1.4, 1.2)], [2.8, V(0, 0.95, 0.05)]]); }],
    [3.1, ctx => { ctx.uh.release(false); ctx.data.path = null; }],
    [3.6, ctx => { ctx.data.drop = true; if (!kin) { ctx.data.gate.body.setGravityScale(1, true); ctx.data.gate.body.wakeUp(); } }],
  ],
  step(ctx, t) {
    if (ctx.data.path && ctx.uh.held) carryTo(ctx, ctx.data.path(t));
    if (kin && ctx.data.drop) { // 动画：匀速往下压到底，不管下面有什么
      const y = Math.max(0.95, 2.2 - (t - 3.6) * 1.1);
      ctx.data.gate.body.setNextKinematicTranslation({ x: 0, y, z: 0 });
    }
  },
  cam: camKeys([
    [0, V(3.2, 2.2, 7.2), V(1.6, 0.8, 0.6), 50],
    [3.3, V(2.4, 2.0, 6.0), V(0.4, 1.0, 0), 48],
    [9, V(1.8, 1.5, 4.2), V(0, 0.8, 0), 44],
  ]),
  extra: ctx => ({ ice: ctx.sim.pose(ctx.data.ice).p.toArray(), gateY: ctx.data.gate.body.translation().y }),
});

// 抓：射线 + 打中点
shot({
  id: 'grab_ray', dur: 7, hand: true,
  setup(ctx) {
    const { sim } = ctx;
    ctx.data.plank = sim.spawn('plank', [0, 0.07, 0], qE(0, 0.5, 0));
    sim.spawn('crate', [2.4, 0.43, -1]); sim.spawn('log', [-2.5, 0.25, -1.5], qE(0, -0.3, H)); sim.spawn('wheel', [1.5, 0.14, 1.8]);
    ctx.eye.set(0.8, 1.75, 5.2); ctx.fwd.set(-0.4, -0.1, -1).normalize();
  },
  actions: [[3.2, ctx => { grabLocal(ctx, ctx.data.plank, V(0.55, 0.06, 0)); ctx.data.path = keyPath([[3.2, ctx.sim.pose(ctx.data.plank).p.clone().add(V(0.4, 0.1, 0.2))], [5.0, V(0.2, 1.5, 1.2)], [7, V(-0.4, 1.6, 0.8)]]); }]],
  step(ctx, t) {
    const hitPt = () => { const ps = ctx.sim.pose(ctx.data.plank); return V(0.55, 0.06, 0).applyQuaternion(ps.q).add(ps.p); };
    if (t < 3.2) { aimAt(ctx, hitPt(), 0.04); }
    if (ctx.data.path && ctx.uh.held) carryTo(ctx, ctx.data.path(t));
    ctx.overlay.length = 0;
    if (t > 1.0 && t < 3.25) { const from = ctx.eye.clone().add(V(0.25, -0.3, 0)); const k = smooth((t - 1.0) / 0.6); ctx.overlay.push({ type: 'ray', from: from.toArray(), to: lerpV(from, hitPt(), k).toArray(), color: '#ff5b5b', width: 0.012 }); }
  },
  extra: ctx => { const ps = ctx.sim.pose(ctx.data.plank); return { hit: V(0.55, 0.06, 0).applyQuaternion(ps.q).add(ps.p).toArray() }; },
});

// 抓：瞬移（穿墙、挤飞） vs 速度驱动（被墙挡住）
for (const tele of [true, false]) shot({
  id: tele ? 'grab_tele' : 'grab_vel', dur: 7.5, hand: false, uh: { teleport: tele, preview: false },
  setup(ctx) {
    const { sim } = ctx;
    sim.addStaticBox([0, 1.1, -0.4], [2.2, 1.1, 0.15]);
    ctx.data.board = sim.spawn('board', [0.2, 0.08, 2.1]);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) sim.spawn('crate', [-1.0 + i * 0.86, 0.43 + j * 0.85, -1.5]);
    ctx.eye.set(1.2, 1.9, 6.2); aimAt(ctx, V(0.2, 0.1, 2.1));
  },
  actions: [[0.4, ctx => { grabLocal(ctx, ctx.data.board, V(0, 0.07, 0)); ctx.data.path = keyPath([[0.4, ctx.sim.pose(ctx.data.board).p.clone().add(V(0, 0.07, 0))], [1.6, V(0, 1.0, 1.6)], [4.6, V(-0.1, 1.0, -2.6)], [7.5, V(-0.1, 1.0, -2.8)]]); }]],
  step(ctx, t) { if (ctx.data.path && ctx.uh.held) carryTo(ctx, ctx.data.path(t)); },
  cam: camKeys([[0, V(4.6, 3.4, 4.6), V(0, 0.8, 0), 52], [7.5, V(5.4, 3.0, 2.0), V(-0.2, 0.9, -0.8), 50]]),
});

// 抓：转身，东西跟着转
shot({
  id: 'grab_turn', dur: 6, hand: false,
  setup(ctx) { ctx.data.log = ctx.sim.spawn('log', [0, 0.25, -3], qE(0, 0, H)); ctx.sim.spawn('crate', [3, 0.43, 0]); ctx.sim.spawn('wheel', [-3, 0.14, 1]); ctx.eye.set(0, 1.75, 0); aimAt(ctx, V(0, 0.3, -3)); },
  actions: [[0.3, ctx => { grabLocal(ctx, ctx.data.log, V(0, 0.24, 0)); ctx.uh.held.dist = 3.6; }]],
  step(ctx, t) { if (t > 0.6) { const a = smooth((t - 0.8) / 4.4) * Math.PI * 1.1; ctx.fwd.set(-Math.sin(a), -0.15, -Math.cos(a)).normalize(); ctx.uh.held && (ctx.uh.held.dist = 3.6); } },
  cam: (ctx, t) => ({ pos: V(0, 9.5, 0.01), look: V(0, 0, 0), fov: 50 }),
  extra: ctx => ({ eyeTop: true }),
});

// 转：45° 一格
shot({
  id: 'rotate', dur: 9, hand: true,
  setup(ctx) { ctx.data.plank = ctx.sim.spawn('plank', [0, 0.07, -1.0]); ctx.eye.set(0, 1.7, 1.6); aimAt(ctx, V(0, 0.1, -1.0)); },
  actions: [
    [0.2, ctx => { grabLocal(ctx, ctx.data.plank, V(0, 0, 0)); ctx.data.path = keyPath([[0.2, ctx.sim.pose(ctx.data.plank).p.clone()], [1.2, V(0, 1.5, -0.9)]]); }],
    ...[1.8, 2.6, 3.4, 4.2].map(t => [t, ctx => { ctx.uh.rotate('yaw', 1); ctx.data.steps = (ctx.data.steps || 0) + 1; }]),
    ...[5.4, 6.2].map(t => [t, ctx => { ctx.uh.rotate('pitch', 1); ctx.data.steps = (ctx.data.steps || 0) + 1; }]),
    [7.2, ctx => { ctx.uh.rotate('roll', 1); ctx.data.steps = (ctx.data.steps || 0) + 1; }],
  ],
  step(ctx, t) { if (ctx.data.path && ctx.uh.held) carryTo(ctx, ctx.data.path(t)); },
  extra: ctx => ({ steps: ctx.data.steps || 0 }),
});

// 找点：举着木板在大木板、木箱、圆木旁边扫，预览线跳来跳去
shot({
  id: 'find', dur: 11, hand: true,
  setup(ctx) {
    const { sim } = ctx;
    ctx.data.board = sim.spawn('board', [0, 0.08, -1]);
    ctx.data.crate = sim.spawn('crate', [2.6, 0.43, -1.4]);
    ctx.data.log = sim.spawn('log', [-2.6, 0.25, -1.2], qE(0, 0, H));
    ctx.data.plank = sim.spawn('plank', [0.6, 0.07, 1.6], qE(0, H, 0));
    ctx.eye.set(0.4, 2.6, 4.6); aimAt(ctx, V(0.6, 0.1, 1.6));
  },
  actions: [[0.3, ctx => { grabLocal(ctx, ctx.data.plank, V(0, 0.06, 0)); ctx.uh.rotate('yaw', 2); ctx.data.path = keyPath([[0.3, ctx.sim.pose(ctx.data.plank).p.clone()], [1.4, V(0.2, 1.4, 0.6)], [3.2, V(0.2, 0.55, -0.4)], [5.0, V(1.9, 1.0, -0.6)], [6.8, V(-1.6, 0.85, -0.5)], [8.6, V(-0.1, 0.75, -0.5)], [11, V(-0.1, 0.62, -0.7)]]); }]],
  step(ctx, t) { if (ctx.data.path && ctx.uh.held) carryTo(ctx, ctx.data.path(t)); },
  extra: ctx => ({ pv: ctx.uh.preview ? { d: ctx.uh.preview.dist, mid: ctx.uh.preview.pa.clone().lerp(ctx.uh.preview.pb, 0.5).toArray(), b: ctx.uh.preview.b.def.label } : null }),
});

// 粘：松手、吸过去、出胶水
shot({
  id: 'glue', dur: 6, hand: false,
  setup(ctx) {
    const { sim } = ctx;
    ctx.data.board = sim.spawn('board', [0, 0.08, 0]);
    ctx.data.plank = sim.spawn('plank', [3, 0.07, 2.4]);
    ctx.eye.set(3.5, 2.6, 4.2); aimAt(ctx, V(3, 0.1, 2.4));
  },
  actions: [
    [0.1, ctx => { grabLocal(ctx, ctx.data.plank, V(0, 0.06, 0)); ctx.uh.rotate('yaw', 2); ctx.data.path = keyPath([[0.1, ctx.sim.pose(ctx.data.plank).p.clone().add(V(0, 0.06, 0))], [1.6, V(1.6, 1.4, 1.0)], [3.0, V(0.4, 0.33, 0.1)]]); }],
    [3.4, ctx => { ctx.uh.release(); ctx.data.path = null; }],
  ],
  step(ctx, t) { if (ctx.data.path && ctx.uh.held) carryTo(ctx, ctx.data.path(t)); },
  cam: camKeys([[0, V(-3.2, 2.2, 3.6), V(0.4, 0.8, 0.2), 44], [6, V(-2.6, 1.6, 2.8), V(0.5, 0.7, 0), 40]]),
});

// 木板桥 + 巨石：两个世界并排（关节 / 合并），或者围攻模式单独一个
const bridgeShot = (id, mode, dur = 9) => shot({
  id, dur, mode, breakForce: 2400,
  setup(ctx) { buildBridge(ctx.sim, V(0, 0, 0), 6); ctx.eye.set(0, 9, 4); },
  actions: [[1.2, ctx => { ctx.data.rock = ctx.sim.spawn('boulder', [0.6, 7.5, 0]); }], [4.5, ctx => { ctx.sim.spawn('boulder', [-3.0, 7.5, 0.1]); }]],
  cam: camKeys([[0, V(0, 7.0, 12.0), V(0, 2.4, 0), 52], [dur, V(2.5, 6.0, 10.5), V(0, 2.2, 0), 50]]),
});
bridgeShot('bridge_joint', 'joint'); bridgeShot('bridge_merge', 'merge'); bridgeShot('bridge_besiege', 'besiege', 10);

// 整坨搬：五块木板粘成长杆，抓一端甩。driveAll 关 / 开
for (const all of [false, true]) shot({
  id: all ? 'carry_all' : 'carry_drag', dur: 8, uh: { driveAll: all, preview: false }, iterations: 4,
  setup(ctx) {
    const { sim } = ctx; const ps = [];
    for (let i = 0; i < 5; i++) ps.push(sim.spawn('plank', [i * 2.0, 0.07, 0]));
    for (let i = 1; i < 5; i++) glueTo(sim, ps[i], ps[i - 1], 0.05);
    ctx.data.p0 = ps[0]; ctx.eye.set(-3, 1.8, 5);
  },
  actions: [[0.3, ctx => { grabLocal(ctx, ctx.data.p0, V(-0.8, 0.06, 0)); ctx.data.path = keyPath([[0.3, ctx.sim.pose(ctx.data.p0).p.clone().add(V(-0.8, 0.06, 0))], [1.8, V(-1.5, 2.8, 1)], [3.4, V(-1.0, 3.2, -2.5)], [4.8, V(-2.2, 2.4, 2.6)], [6.2, V(-0.8, 3.2, -1.5)], [8, V(-1.4, 2.9, 0.5)]]); }]],
  step(ctx, t) { if (ctx.data.path && ctx.uh.held) carryTo(ctx, ctx.data.path(t)); },
  cam: camKeys([[0, V(3.0, 8.0, 9.5), V(2.5, 1.6, 0), 52], [8, V(3.8, 7.6, 9.0), V(2.5, 1.8, 0), 52]]),
});

// 求解器迭代次数：同一根悬臂（根部固定在石柱上），1 次 vs 8 次
for (const it of [1, 8]) shot({
  id: 'iter' + it, dur: 8, iterations: it,
  setup(ctx) {
    const { sim } = ctx; const ps = [];
    sim.addStaticBox([-0.6, 1.97, 0], [0.7, 1.97, 0.7]);
    for (let i = 0; i < 6; i++) ps.push(sim.spawn('plank', [i * 2.0, 4.0, 0]));
    for (let i = 1; i < 6; i++) glueTo(sim, ps[i], ps[i - 1], 0.05);
    ps[0].body.setBodyType(1, true); // Fixed：根部钉死
    ctx.data.ps = ps;
  },
  cam: camKeys([[0, V(5.0, 6.5, 12.5), V(4.6, 2.6, 0), 52], [8, V(5.4, 6.2, 12.0), V(4.6, 2.6, 0), 52]]),
});

// 21 个零件上限：圆木一根接一根粘，第 22 根粘不上
shot({
  id: 'limit', dur: 8,
  setup(ctx) {
    const { sim } = ctx; ctx.data.logs = [];
    for (let i = 0; i < 22; i++) {
      ctx.data.logs.push(sim.spawn('log', [-5.25 + i * 0.5, 0.25, 0], qE(H, 0, 0)));
    }
    ctx.data.n = 1;
  },
  actions: Array.from({ length: 21 }, (_, i) => [0.6 + i * 0.26, ctx => {
    const L = ctx.data.logs; const r = glueTo(ctx.sim, L[i + 1], L[i], 0.6);
    if (r && r.refused) ctx.data.refused = ctx.sim.time; else if (r) ctx.data.n = ctx.sim.compSize(L[0]);
  }]),
  step(ctx) { },
  cam: camKeys([[0, V(0, 9, 9), V(0, 0, 0), 50], [8, V(1, 8, 8), V(0, 0, 0), 48]]),
  extra: ctx => ({ n: ctx.data.n, refused: ctx.data.refused ?? null }),
});

// 风扇：一个木箱 + 风扇，开动力，显示推力箭头
shot({
  id: 'fan', dur: 7,
  setup(ctx) {
    const { sim } = ctx;
    ctx.data.board = sim.spawn('board', [0, 0.08, 0]);
    ctx.data.fan = sim.spawn('fan', [-1.05, 0.08 + 0.07 + 0.36, 0], qE(0, H, 0));
    glueTo(sim, ctx.data.fan, ctx.data.board);
  },
  actions: [[1.0, ctx => ctx.sim.togglePower(ctx.data.board, true)]],
  step(ctx) {
    ctx.overlay.length = 0;
    const f = ctx.data.fan; if (!f.power) return;
    const ps = ctx.sim.pose(f); const dir = V(0, 0, 1).applyQuaternion(ps.q);
    ctx.overlay.push({ type: 'arrow', from: ps.p.toArray(), to: ps.p.clone().addScaledVector(dir, 2.2).toArray(), color: '#ffcf73', width: 0.06, head: 0.45 });
  },
  cam: (ctx, t) => { const c = ctx.sim.pose(ctx.data.board).p; return { pos: c.clone().add(V(-1.5, 3.2, 6.5)), look: c.clone().add(V(1.2, 0.4, 0)), fov: 46 }; },
});

// 轮子：转动关节 + 马达扭矩
shot({
  id: 'wheel', dur: 7,
  setup(ctx) { ctx.data.car = buildCar(ctx.sim, V(0, 0, 0), 0, { fan: false }); },
  actions: [[1.0, ctx => ctx.sim.togglePower(ctx.data.car.board, true)]],
  step(ctx) {
    ctx.overlay.length = 0;
    const w = ctx.data.car.wheels[0]; const ps = ctx.sim.pose(w); const ax = V(0, 1, 0).applyQuaternion(ps.q);
    ctx.overlay.push({ type: 'ray', from: ps.p.clone().addScaledVector(ax, -0.7).toArray(), to: ps.p.clone().addScaledVector(ax, 0.9).toArray(), color: '#7dffb0', width: 0.025 });
  },
  cam: (ctx, t) => { const c = ctx.sim.pose(ctx.data.car.wheels[0]).p; return { pos: c.clone().add(V(-1.6, 0.9, 3.4)), look: c.clone().add(V(0.6, 0, 0)), fov: 42 }; },
});

export const PART_CAP = PART_LIMIT;

// 封面用：同一段开场操作，第三人称近景（光束 + 预览线 + 车）
shot({ ...SHOTS.hero, id: 'hero_cover', hand: false, handAt: undefined,
  cam: (ctx, t) => ({ pos: V(-3.9, 2.0, 3.4), look: V(-0.6, 0.8, 0.2), fov: 44 }) });
