import RAPIER from '@dimforge/rapier3d-compat';
import { initPhysics, Sim } from '../src/sim.js';
import { glueTo } from '../src/presets.js';
await initPhysics();
for (const it of [1, 2, 4, 8, 16]) for (const n of [6]) {
  const s = new Sim({ mode: 'joint', iterations: it }); s.addGround();
  const ps = []; for (let i = 0; i < n; i++) ps.push(s.spawn('plank', [i * 2.0, 4, 0]));
  for (let i = 1; i < n; i++) glueTo(s, ps[i], ps[i - 1], 0.05);
  ps[0].body.setBodyType(RAPIER.RigidBodyType.Fixed, true);
  const out = [];
  for (let f = 0; f < 300; f++) { s.step(); if (f % 60 === 59) out.push(s.pose(ps[n - 1]).p.y.toFixed(2)); }
  console.log('iter', it, 'n', n, 'tip y over 5s:', out.join(' '));
}
