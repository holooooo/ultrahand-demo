import * as THREE from 'three';
import { initPhysics, Sim } from '../src/sim.js';
import { glueTo } from '../src/presets.js';
await initPhysics();
for (const mode of ['joint','merge']) {
  const s = new Sim({ mode, iterations: 8 }); s.addGround();
  const a = s.spawn('plank', [0, 3, 0]), b = s.spawn('plank', [2.0, 3, 0]);
  const e = glueTo(s, b, a, 0.05);
  console.log(mode, 'edge', e && e.kind, 'joints', e && e.joints.length, 'pa', e && e.pa[0].toArray().map(v=>v.toFixed(2)), 'pb', e && e.pb[0].toArray().map(v=>v.toFixed(2)));
  a.body.setBodyType(2 /*kinematicPosition?*/, true);
  for (let i = 0; i < 120; i++) s.step();
  console.log(' b pos', s.pose(b).p.toArray().map(v=>v.toFixed(2)), 'a', s.pose(a).p.toArray().map(v=>v.toFixed(2)));
}
