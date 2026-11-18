import * as THREE from 'three';
import { initPhysics, Sim } from '../src/sim.js';
import { Ultrahand } from '../src/ultrahand.js';
await initPhysics();
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
for (const mode of ['joint','merge','besiege']) {
  const s = new Sim({mode}); s.addGround();
  const board = s.spawn('board', [0,0.47,0]);
  const w = [[-1.1,0.5,0.95],[1.1,0.5,0.95],[-1.1,0.5,-0.95],[1.1,0.5,-0.95]].map(p=>s.spawn('wheel',p,new THREE.Quaternion().setFromAxisAngle(V(1,0,0),Math.PI/2)));
  const fan = s.spawn('fan',[0,1.5,3]);
    // glue wheels directly (they rest beside board)
  const uh = new Ultrahand(s);
  let glued=0;
  for (const wh of w){ const c = s.closestGlue(wh, 1.0); if(c && c.b===board){ s.glue(c.a,c.b,c.pa,c.pb); glued++; } else console.log('no glue for wheel', c && c.b.type, c&&c.dist); }
  // grab fan and bring it onto the board back
  const cam=V(0,1.7,6), fwd=V(0,-0.3,-1).normalize();
  const h = uh.tryGrab(cam, s.pose(fan).p.clone().sub(cam).normalize());
  console.log(mode,'grabbed', h&&h.part.type); for(let i=0;i<30;i++) s.step();
  for(let i=0;i<120;i++){ const tgt=s.pose(board).p.clone().add(V(-0.9,0.45,0)); const f = tgt.clone().sub(cam); uh.held.dist=f.length(); f.normalize(); uh.update(1/60,cam,f); s.step(); }
  console.log('preview', uh.preview && uh.preview.b.type, uh.preview && uh.preview.dist.toFixed(3));
  const r = uh.release(); console.log('release', r && (r.kind||JSON.stringify(r)));
  console.log('comp size', s.compSize(board), 'edges', s.edges.length, 'bodies', new Set(s.liveParts().map(p=>p.body.handle)).size);
  s.togglePower(board, true);
  const p0 = s.pose(board).p.clone();
  for(let i=0;i<240;i++) s.step();
  const p1 = s.pose(board).p;
  console.log(mode,'moved', p1.clone().sub(p0).toArray().map(v=>v.toFixed(2)).join(','), 'events', s.events.map(e=>e.type).join(' '));
}
