// 影片分段表：film.js 和 dev/make_cues.mjs（音效对齐）共用
export function buildSegs(TL, MAN) {
  const SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));
  const A = (id, i) => SC[id].lines[i].start;
  const S = id => SC[id].start, END = id => SC[id].end;
  // ---------------------------------------------------------------- 时间线：每段画面
  // D(shot, a, b, from, to?) —— 在 [a,b) 播放镜头 shot 的 [from, to]（给了 to 就变速塞满这段）
  // P(shotA, shotB, a, b, from, offset, labels) —— 两个世界并排
  // F(slug, a, b, from, zoom)  —— 实机/演讲画面
  // X(slugA, slugB, a, b, labA, labB) —— 实机左右分屏
  const segs = [];
  const D = (shot, a, b, from = 0, to = null, o = {}) => segs.push({ kind: 'demo', shot, a, b, from, to, ...o });
  const P = (sa, sb, a, b, from, offset, labels, o = {}) => segs.push({ kind: 'pair', sa, sb, a, b, from, offset, labels, ...o });
  const GZ = [1.14, 1.18, 50, 0];
  const F = (slug, a, b, from = 0, zoom = [1, 1.06, 50, 50]) => MAN[slug] ? segs.push({ kind: 'foot', slug, a, b, from, zoom }) : D('flyer', a, b, 2);
  const X = (sa, sb, a, b, la, lb, fa = 0, fb = 0) => segs.push({ kind: 'xsplit', sa, sb, a, b, la, lb, fa, fb });

  const E = (id, i) => SC[id].lines[i].end;
  const M = (id, i) => (A(id, i) + E(id, i)) / 2;
  // hook
  F('totk_builds_floatcannon', 0, 3.2, 8.0, [1.08, 1.0, 50, 50]);
  F('totk_builds_walker', 3.2, A('hook', 1) - 0.05, 5.2, [1.0, 1.08, 50, 50]);
  F('totk_trailer_pv2', A('hook', 1) - 0.05, A('hook', 2) - 0.05, 2.6, [1.0, 1.08, 50, 50]);
  D('hero', A('hook', 2) - 0.05, M('hook', 2), 0.3, 5.6);
  D('launch_ok', M('hook', 2), END('hook'), 3.0, 9.0);
  // repo
  D('hero', S('repo'), END('repo'), 16);
  // gdc
  F('gdc_everything_physics', S('gdc'), A('gdc', 2) - 0.05, 1.0, GZ);
  F('gdc_gate_constraint', A('gdc', 2) - 0.05, A('gdc', 3) - 0.05, 0.0, GZ);
  D('gate_kin', A('gdc', 3) - 0.05, A('gdc', 4) - 0.05, 2.6, 8.6);
  D('gate_phys', A('gdc', 4) - 0.05, A('gdc', 5) - 0.05, 3.2, 9);
  D('grab_vel', A('gdc', 5) - 0.05, END('gdc'), 0.0, 2.0);
  // grab
  D('grab_ray', S('grab'), A('grab', 1) - 0.05, 0.6, 6.5);
  D('grab_tele', A('grab', 1) - 0.05, A('grab', 2) - 0.05, 0.0, 7.4);
  D('grab_vel', A('grab', 2) - 0.05, END('grab'), 0.0, 7.4);
  // rotate / find
  D('rotate', S('rotate'), END('rotate'), 0.0, 8.8);
  D('find', S('find'), END('find'), 0.0, 10.8);
  // glue
  D('glue', S('glue'), A('glue', 1) - 0.05, 0.0, 5.0);
  D('glue', A('glue', 1) - 0.05, A('glue', 2) - 0.05, 5.0);
  P('bridge_joint', 'bridge_merge', A('glue', 2) - 0.05, A('glue', 3) - 0.05, 0.6, [0, 0, 0], ['关节 · 会晃', '焊死 · 不动'], { pull: 1.25 });
  F('totk_builds_walker', A('glue', 3) - 0.05, END('glue'), 0.0, [1.0, 1.06, 50, 50]);
  // carry
  D('carry_all', S('carry'), A('carry', 1) - 0.05, 0.0, 2.2);
  D('carry_drag', A('carry', 1) - 0.05, A('carry', 2) - 0.05, 0.4, 8);
  D('carry_all', A('carry', 2) - 0.05, A('carry', 3) - 0.05, 0.4, 8);
  D('limit', A('carry', 3) - 0.05, A('carry', 4) - 0.05, 0.3, 7.6);
  P('iter1', 'iter8', A('carry', 4) - 0.05, END('carry'), 0.0, [0, 0, 0], ['算 1 遍', '算 8 遍'], { pull: 1.0 });
  // power
  D('fan', S('power'), A('power', 1) - 0.05, 0.6);
  D('wheel', A('power', 1) - 0.05, A('power', 2) - 0.05, 0.6);
  F('gdc_vehicle', A('power', 2) - 0.05, A('power', 2) + 2.6, 0.0, GZ);
  D('hero', A('power', 2) + 2.6, END('power'), 10.2);
  // launch：点火正好落在“点火”“一”这两个字上
  const ign = (shotIgn, lineEnd, lead) => shotIgn - (lineEnd - lead);
  D('launch_fail', A('launch', 0) - 0.05, A('launch', 1) - 0.05, ign(1.6, E('launch', 0) - A('launch', 0), 0.25));
  D('launch_fail', A('launch', 1) - 0.05, A('launch', 2) - 0.05, 1.6 + (E('launch', 0) - A('launch', 0)) * 0 + 0.25 + (A('launch', 1) - E('launch', 0)), 9);
  D('launch_ok', A('launch', 2) - 0.05, A('launch', 3) - 0.05, ign(3.0, E('launch', 2) - A('launch', 2), 0.1));
  { const f0 = 3.0 + 0.1 + (A('launch', 3) - E('launch', 2)); D('launch_ok', A('launch', 3) - 0.05, END('launch'), f0, Math.min(22, f0 + 1.8 * (END('launch') - A('launch', 3)))); }
  // outro
  { const f0 = 3.0 + 0.1 + (A('launch', 3) - E('launch', 2)); const f1 = Math.min(22, f0 + 1.8 * (END('launch') - A('launch', 3))); D('launch_ok', S('outro'), END('outro') + 0.1, f1); }
  return segs;
}
