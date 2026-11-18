import { initPhysics } from '../src/sim.js';
import { record } from '../src/director.js';
import { SHOTS } from '../src/shots.js';
await initPhysics();
for (const id of ['launch_fail','launch_ok']) { const r = record(SHOTS[id]); console.log(id, [2,3,4,6,8,10,14,18,21].filter(t=>t*30<r.frames.length).map(t => { const f = r.frames[t*30]; const b=f.parts.find(p=>p.type==='board'), pl=f.parts.find(p=>p.type==='pilot'); return `${t}s:b${b.p[1].toFixed(1)}/p${pl.p[1].toFixed(1)} e${f.edges.length}`; }).join(' ')); }
