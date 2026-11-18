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

  // hook
  F('totk_builds_floatcannon', 0, 3.4, 8.0, [1.08, 1.0, 50, 45]);
  F('totk_builds_walker', 3.4, A('hook', 1) - 0.05, 5.2, [1.0, 1.08, 50, 50]);
  F('gdc_everything_physics', A('hook', 1) - 0.05, A('hook', 2) - 0.05, 0.0, GZ);
  D('hero', A('hook', 2) - 0.05, A('hook', 3) - 0.05, 0.3, 5.6);
  D('hero', A('hook', 3) - 0.05, A('hook', 4) - 0.05, 5.8, 15.5);
  D('flyer', A('hook', 4) - 0.05, END('hook'), 3.0);
  // repo
  D('hero', S('repo'), END('repo'), 15.5);
  // gdc
  F('gdc_everything_physics', S('gdc'), A('gdc', 3) - 0.05, 1.0, GZ);
  F('gdc_gate_constraint', A('gdc', 3) - 0.05, A('gdc', 4) - 0.05, 0.0, GZ);
  D('gate_kin', A('gdc', 4) - 0.05, A('gdc', 5) - 0.05, 0.3, 8.6);
  D('gate_phys', A('gdc', 5) - 0.05, A('gdc', 6) - 0.05, 2.6, 9);
  D('grab_vel', A('gdc', 6) - 0.05, END('gdc'), 0.0, 3.0);
  // grab
  D('grab_ray', S('grab'), A('grab', 1) - 0.05, 0.6, 6.5);
  D('grab_tele', A('grab', 1) - 0.05, A('grab', 3) - 0.05, 0.0, 7.4);
  D('grab_vel', A('grab', 3) - 0.05, A('grab', 5) - 0.05, 0.0, 7.4);
  D('grab_turn', A('grab', 5) - 0.05, END('grab'), 0.0, 6);
  // rotate
  D('rotate', S('rotate'), END('rotate'), 0.0, 8.8);
  // find
  D('find', S('find'), A('find', 3) - 0.05, 0.0, 10.8);
  F('totk_trailer_raft', A('find', 3) - 0.05, END('find'), 0.0, GZ);
  // glue
  D('glue', S('glue'), A('glue', 1) - 0.05, 0.0, 5.8);
  D('glue', A('glue', 1) - 0.05, A('glue', 3) - 0.05, 5.8);
  P('bridge_joint', 'bridge_merge', A('glue', 3) - 0.05, A('glue', 4) - 0.05, 0.6, [0, 0, 0], ['关节 · 会弯会晃', '合并 · 铁板一块'], { pull: 1.25 });
  F('totk_builds_walker', A('glue', 4) - 0.05, A('glue', 5) - 0.05, 0.0, [1.0, 1.06, 50, 50]);
  D('glue', A('glue', 5) - 0.05, END('glue'), 5.8);
  // carry
  D('carry_all', S('carry'), A('carry', 1) - 0.05, 0.0, 2.2);
  D('carry_drag', A('carry', 1) - 0.05, A('carry', 2) - 0.05, 0.4, 8);
  D('carry_all', A('carry', 2) - 0.05, A('carry', 3) - 0.05, 0.4, 8);
  D('limit', A('carry', 3) - 0.05, A('carry', 4) - 0.05, 0.3, 7.6);
  P('iter1', 'iter8', A('carry', 4) - 0.05, END('carry'), 0.0, [0, 0, 0], ['求解器迭代 1 次', '求解器迭代 8 次'], { pull: 1.0 });
  // power
  D('fan', S('power'), A('power', 1) - 0.05, 0.6);
  D('wheel', A('power', 1) - 0.05, A('power', 2) - 0.05, 0.6);
  F('gdc_vehicle', A('power', 2) - 0.05, A('power', 3) - 0.05, 0.0, GZ);
  D('hero', A('power', 3) - 0.05, A('power', 4) - 0.05, 10.2, 18);
  F('totk_trailer_pv2', A('power', 4) - 0.05, END('power'), 4.0, [1.0, 1.06, 50, 50]);
  // besiege
  F('besiege_build', S('besiege'), A('besiege', 1) - 0.05, 0.0, [1.0, 1.05, 50, 50]);
  F('besiege_crash', A('besiege', 1) - 0.05, A('besiege', 2) - 0.05, 1.2, GZ);
  D('bridge_besiege', A('besiege', 2) - 0.05, A('besiege', 3) - 0.05, 0.6);
  X('totk_trailer_fans', 'besiege_siege', A('besiege', 3) - 0.05, END('besiege'), '王国之泪 · 边玩边粘', '围攻 · 先造后跑', 0, 0);
  // outro
  D('flyer', S('outro'), END('outro') + 0.1, 1.0);

  return segs;
}
