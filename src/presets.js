// 预设：用代码“粘”出几台机器。网页的一键按钮和视频脚本都用它。
import * as THREE from 'three';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const qE = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'YXZ'));
const H = Math.PI / 2;

// 把 a 粘到 b 上（两者已经贴着/很近）
export function glueTo(sim, a, b, reach = 0.35) {
  sim.world.propagateModifiedBodyPositionsToColliders();
  const c = a.colliders[0].contactCollider(b.colliders[0], reach);
  if (!c) return null;
  return sim.glue(a, b, V(c.point1.x, c.point1.y, c.point1.z), V(c.point2.x, c.point2.y, c.point2.z));
}

const at = (o, yaw, x, y, z) => V(x, y, z).applyAxisAngle(V(0, 1, 0), yaw).add(o);

// 小车：大木板 + 4 个轮子（转动关节）+ 1 个风扇（可选）
export function buildCar(sim, o = V(), yaw = 0, { fan = true, glue = true } = {}) {
  const board = sim.spawn('board', at(o, yaw, 0, 0.55, 0).toArray(), qE(0, yaw, 0));
  const wheels = [[-0.95, 1.03], [0.95, 1.03], [-0.95, -1.03], [0.95, -1.03]].map(([x, z]) =>
    sim.spawn('wheel', at(o, yaw, x, 0.5, z).toArray(), qE(0, yaw, 0).multiply(qE(H, 0, 0))));
  const parts = { board, wheels };
  if (fan) parts.fan = sim.spawn('fan', at(o, yaw, -1.05, 0.62 + 0.36, 0).toArray(), qE(0, yaw + H, 0));
  if (glue) { wheels.forEach(w => glueTo(sim, w, board)); if (parts.fan) glueTo(sim, parts.fan, board); }
  return parts;
}

// 气球飞板：大木板 + 4 个气球 + 尾部风扇
export function buildFlyer(sim, o = V(), yaw = 0) {
  const board = sim.spawn('board', at(o, yaw, 0, 0.5, 0).toArray(), qE(0, yaw, 0));
  const balloons = [[-1.0, 0.55], [1.0, 0.55], [-1.0, -0.55], [1.0, -0.55]].map(([x, z]) =>
    sim.spawn('balloon', at(o, yaw, x, 0.57 + 0.62, z).toArray()));
  const fan = sim.spawn('fan', at(o, yaw, -1.4 - 0.22, 0.5, 0).toArray(), qE(0, yaw + H, 0));
  balloons.forEach(b => glueTo(sim, b, board));
  glueTo(sim, fan, board);
  return { board, balloons, fan };
}

// 桥：两个石墩之间用木板首尾粘一串
export function buildBridge(sim, o = V(), n = 6) {
  const span = n * 2.0;
  sim.addStaticBox([o.x - span / 2 - 0.5, o.y + 1.5, o.z], [1, 1.5, 1.2]);
  sim.addStaticBox([o.x + span / 2 + 0.5, o.y + 1.5, o.z], [1, 1.5, 1.2]);
  const planks = [];
  for (let i = 0; i < n; i++) planks.push(sim.spawn('plank', [o.x - span / 2 + 1 + i * 2.0, o.y + 3.06, o.z]));
  for (let i = 1; i < n; i++) glueTo(sim, planks[i], planks[i - 1], 0.05);
  return { planks };
}

// 一堆散件（游乐场开局）
export function scatter(sim, o = V()) {
  const list = [
    ['plank', 3, 0.1, -4], ['plank', 4.2, 0.1, -3.2], ['plank', 2.4, 0.1, -2.6], ['board', -3, 0.1, -4],
    ['log', -1, 0.3, -6], ['log', 1.5, 0.3, -7], ['crate', 5, 0.5, -6], ['crate', 5.3, 1.4, -6.2],
    ['wheel', -5, 0.15, -2], ['wheel', -5.6, 0.15, -3.4], ['wheel', -4.4, 0.15, -3.6], ['wheel', -6, 0.15, -1.2],
    ['fan', 0, 0.4, -9], ['fan', 1.2, 0.4, -9.6], ['rocket', -2.5, 0.2, -8.5], ['balloon', 3.5, 0.8, -9], ['balloon', 4.8, 0.8, -9.4],
    ['boulder', 7, 0.6, -3],
  ];
  return list.map(([t, x, y, z], i) => {
    let q = qE(0, i * 0.7, 0);
    if (t === 'log') q = qE(0, i * 0.7, H);
    if (t === 'rocket') q = qE(0, i, H);
    if (t === 'wheel') q = qE(0, 0, 0);
    return sim.spawn(t, [o.x + x, o.y + y + 0.3, o.z + z], q);
  });
}
