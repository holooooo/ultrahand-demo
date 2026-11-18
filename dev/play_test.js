(async () => {
  document.getElementById('start').classList.add('off');
  const sim = APP.sim(), uh = APP.uh(), P = APP.player;
  const plank = sim.parts.find(p => p.type === 'plank');
  const board = sim.parts.find(p => p.type === 'board');
  const look = (tp) => { const d = tp.clone().sub(P.pos); P.yaw = Math.atan2(-d.x, -d.z); P.pitch = Math.atan2(d.y, Math.hypot(d.x, d.z)); };
  const pp = sim.pose(plank).p.clone(); look(pp);
  await new Promise(r => setTimeout(r, 300));
  pp.copy(sim.pose(plank).p); look(pp); await new Promise(r => setTimeout(r, 100)); const cam = APP.view.camera.position.clone();
  const dir = pp.clone().sub(cam).normalize();
  const hit0 = sim.raycast(cam, dir, 30); const h = uh.tryGrab(cam, dir, 30);
  // 慢慢把视线转向大木板上方
  const bp = sim.pose(board).p.clone().add({x: 0.2, y: 0.5, z: 0.6});
  for (let i = 0; i < 40; i++) { look(pp.clone().lerp(bp, i / 40)); uh.held && (uh.held.dist = Math.max(2.5, P.pos.distanceTo(pp.clone().lerp(bp, i / 40)))); await new Promise(r => setTimeout(r, 30)); }
  return { hit0: hit0 && hit0.part && hit0.part.type, held: !!uh.held, grabbed: !!h, preview: uh.preview && uh.preview.b.type };
})()
