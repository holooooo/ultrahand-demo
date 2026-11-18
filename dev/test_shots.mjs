import { initPhysics } from '../src/sim.js';
import { record } from '../src/director.js';
import { SHOTS } from '../src/shots.js';
await initPhysics();
const only = process.argv[2];
for (const [id, s] of Object.entries(SHOTS)) {
  if (only && !only.split(',').includes(id)) continue;
  const t0 = Date.now(); const r = record(s); const f = r.frames, last = f[f.length - 1];
  const glue = last.events.filter(e => e.type === 'glue').length, brk = last.events.filter(e => e.type === 'break').length;
  const ext = JSON.stringify(last.extra || {}).slice(0, 120);
  const maxY = Math.max(...last.parts.map(p => p.p[1])).toFixed(2), minY = Math.min(...last.parts.map(p => p.p[1])).toFixed(2);
  const maxStress = Math.max(0, ...f.flatMap(x => x.edges.map(e => e.stress || 0))).toFixed(2); const prevFrames = f.filter(x => x.preview).length;
  console.log(id.padEnd(14), `${f.length}f ${Date.now() - t0}ms parts=${last.parts.length} edges=${last.edges.length} glue=${glue} break=${brk} held@end=${!!last.hold} prevFrames=${prevFrames} stress=${maxStress} y[${minY},${maxY}] ${ext}`);
}
