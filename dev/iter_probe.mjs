import { initPhysics } from '../src/sim.js';
import { record } from '../src/director.js';
import { SHOTS } from '../src/shots.js';
await initPhysics();
for (const id of ['iter1','iter8','carry_drag','carry_all','bridge_joint','bridge_merge','bridge_besiege']) {
  const r = record(SHOTS[id]);
  const row = [1,2,3,4,5,6,7,8,9].map(s => { const f = r.frames[Math.min(r.frames.length-1, s*30)]; const ys = f.parts.filter(p=>p.type==='plank').map(p=>p.p[1]); return ys.length? (Math.min(...ys).toFixed(1)+'/'+Math.max(...ys).toFixed(1)) : '-'; });
  console.log(id.padEnd(15), row.join('  '));
}
