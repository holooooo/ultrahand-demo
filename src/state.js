// 把“当下这一帧”压成一份纯数据：网页实时渲染和视频逐帧渲染都只吃这份数据。
// 视频里先把整段物理跑一遍、每帧存一份，渲染时 renderFrame(t) 直接取，保证逐帧确定。
export function captureState(sim, uh, extra = {}) {
  const parts = sim.liveParts().map(p => {
    const ps = sim.pose(p);
    return { id: p.id, type: p.type, p: ps.p.toArray(), q: ps.q.toArray(), held: p.held, power: p.power, spin: p.spin,
      burn: p.burn, comp: p.comp, sleep: p.body.isSleeping() };
  });
  const edges = sim.edges.map(e => ({ id: e.id, kind: e.kind, a: e.a, b: e.b, born: e.born, stress: e.stress || 0,
    pts: sim.edgeWorld(e).map(v => v.toArray()) }));
  let hold = null;
  if (uh && uh.held) {
    const h = uh.held, ps = sim.pose(h.part);
    const grab = h.grabLocal.clone().applyQuaternion(ps.q).add(ps.p);
    hold = { part: h.part.id, grab: grab.toArray(), t0: h.t0 };
  }
  const pv = uh && uh.preview;
  const preview = pv ? { pa: pv.pa.toArray(), pb: pv.pb.toArray(), a: pv.a.id, b: pv.b.id, dist: pv.dist } : null;
  const gates = (sim.gates || []).map(g => { const t = g.body.translation(); return { p: [t.x, t.y, t.z], half: g.half, kinematic: g.kinematic }; });
  return { t: sim.time, gates, mode: sim.mode, parts, edges, hold, preview, events: sim.events.slice(-40), ...extra };
}

// 把两个世界的画面并排放（左右对比镜头用）：b 整体平移 offset，零件/关节 id 加 10000 避免撞号
export function mergeStates(a, b, offset) {
  const off = (v) => [v[0] + offset[0], v[1] + offset[1], v[2] + offset[2]];
  return {
    ...a,
    parts: [...a.parts, ...b.parts.map(p => ({ ...p, id: p.id + 10000, comp: p.comp + 100000, p: off(p.p) }))],
    edges: [...a.edges, ...b.edges.map(e => ({ ...e, id: e.id + 10000, pts: e.pts.map(off) }))],
    events: [...a.events, ...b.events.map(ev => ({ ...ev, pos: { x: ev.pos.x + offset[0], y: ev.pos.y + offset[1], z: ev.pos.z + offset[2] } }))],
    gates: [...(a.gates || []), ...(b.gates || []).map(g => ({ ...g, p: off(g.p) }))],
    statics: [...(a.statics || []), ...(b.statics || []).map(s => ({ ...s, p: off(s.p) }))],
    overlay: [...(a.overlay || []), ...(b.overlay || []).map(o => ({ ...o, from: o.from && off(o.from), to: o.to && off(o.to) }))],
    hold: a.hold, preview: a.preview,
    holdB: b.hold && { ...b.hold, grab: off(b.hold.grab) }, previewB: b.preview && { ...b.preview, pa: off(b.preview.pa), pb: off(b.preview.pb) },
    eyeB: b.eye && off(b.eye),
  };
}
