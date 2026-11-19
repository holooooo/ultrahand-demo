// 机制拆解 05 · 究极手 — 影片合成。renderFrame(t) 是 t 的纯函数：演示镜头在加载时用同一套物理逐帧录好，渲染时查表。
import * as THREE from 'three';
import { initPhysics } from './src/sim.js';
import { View } from './src/view.js';
import { record, FPS } from './src/director.js';
import { SHOTS } from './src/shots.js';
import { mergeStates } from './src/state.js';

const $ = id => document.getElementById(id);
const TL = window.TIMELINE;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const ramp = (t, a, d = 0.5) => ease((t - a) / d);
const win = (t, a, b, d = 0.4) => Math.min(ramp(t, a, d), 1 - ramp(t, b - d, d));
const SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));
const A = (id, i) => SC[id].lines[i].start, E = (id, i) => SC[id].lines[i].end;
const S = id => SC[id].start, END = id => SC[id].end;
const script = await fetch('./script.json').then(r => r.json());
const MAN = await fetch('./footage/manifest.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
const W = 1920, H = 1080;

await initPhysics();
const view = new View($('gl'), { width: W, height: H, dpr: 1 });
view.setHandStyle('orb');

// ---------------------------------------------------------------- 录制所有演示镜头
const REC = {};
for (const id of Object.keys(SHOTS)) REC[id] = record(SHOTS[id]);
const frameOf = (id, st) => { const r = REC[id]; return r.frames[clamp(Math.round(st * FPS), 0, r.frames.length - 1)]; };

import { buildSegs } from './film_segs.js';
const segs = buildSegs(TL, MAN);
const segAt = t => segs.find(s => t >= s.a && t < s.b) || segs[segs.length - 1];

// ---------------------------------------------------------------- 可信度标签（按台词）
const CRED = {
  'gdc:0': ['m', '来源：GDC 2024 讲座报道'], 'gdc:1': ['h', '官方 · GDC 2024'], 'gdc:2': ['h', '官方 · GDC 2024'],
  'gdc:3': ['h', '官方案例 · 画面是我的复刻'], 'gdc:4': ['h', '官方案例 · 画面是我的复刻'],
  'rotate:0': ['t', '45° 是我定的'],
  'glue:3': ['t', '我的推测'],
  'carry:3': ['l', '玩家实测'], 'carry:4': ['t', '我的推测'],
  'power:2': ['h', '官方 · GDC 2024'],
};
// 不放代码卡片和大段文字：画面只留短标签
const codeFor = () => null;

// ---------------------------------------------------------------- 卡片 / 大字（都很短）
function cardsFor(id, t) {
  const c = [];
  const raw = (html, o = 1) => o > 0.01 && c.push(`<div style="position:absolute;inset:0;opacity:${o.toFixed(3)}">${html}</div>`);
  if (id === 'hook') {
    raw(`<div class="titlecard"><div class="k">机制拆解 · 第 5 期</div><div class="t">如何在塞尔达<br>完成<em>载人航天</em></div></div>`, win(t, A('hook', 2) + 0.3, END('hook') - 0.1, 0.35));
  }
  if (id === 'repo') {
    raw(`<div class="free" style="position:absolute;left:150px;top:200px">
      <div class="site"><div class="bar">mechanics-breakdown.pages.dev/05-ultrahand/</div><img src="media/site.jpg"></div>
      <div class="repo"><div class="row"><i>👍</i><i>⭐</i><i>➕</i></div><div class="arrow">↓</div><div class="dm">私信发你地址</div></div></div>`, win(t, S('repo') + 0.1, END('repo') + 0.2, 0.4));
  }
  if (id === 'gdc') {
    raw(`<div class="tiny" style="left:760px;top:300px"><div class="eqn">重量 = <em>∞</em></div></div>`, win(t, A('gdc', 2) + 0.4, E('gdc', 2) + 0.2, 0.3));
  }
  if (id === 'glue') {
    raw(`<div class="tiny" style="left:120px;top:600px"><div class="dia"><div class="rb">A</div><div class="jt"></div><div class="rb">B</div></div><p>关节</p></div>
         <div class="tiny" style="left:1240px;top:600px"><div class="dia"><div class="one">A + B</div></div><p>焊死</p></div>`, win(t, A('glue', 1) + 0.3, E('glue', 1) + 0.2, 0.3));
  }
  if (id === 'carry' && t >= A('carry', 3) - 0.05 && t < A('carry', 4) - 0.05) {
    const ex = frameExtra(); const n = ex?.n ?? 1, bad = ex?.refused != null && segLocal() >= ex.refused - 0.05;
    raw(`<div class="tiny" style="left:1460px;top:180px"><div class="counter ${bad ? 'bad' : ''}">${bad ? '22' : n}<span style="font-size:60px">/21</span></div></div>`, win(t, A('carry', 3), A('carry', 4) - 0.05, 0.3));
  }
  if (id === 'outro') {
    raw(`<div class="free" style="position:absolute;left:150px;top:220px"><div class="site"><div class="bar">mechanics-breakdown.pages.dev/05-ultrahand/</div><img src="media/site.jpg"></div></div>`, win(t, A('outro', 0), E('outro', 0) + 0.25, 0.4));
    raw(`<div class="endcard"><img class="av" src="brand/avatar.png"><div class="id">粑粑柑（梭哈ai版）</div>
      <div class="btns">${['点赞', '收藏', '关注'].map((x, i) => `<div class="btn ${t > A('outro', 1) + 0.6 + i * 0.35 ? 'on' : ''}"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="${i === 1 ? 9 : 8}"/></svg>${x}</div>`).join('')}</div>
      </div>`, ramp(t, A('outro', 1) + 0.6, 0.5));
  }
  return c.join('');
}
function bigFor(id, t) {
  const B = (l1, o, top) => ({ html: `<div class="l1">${l1}</div>`, o, top });
    if (id === 'gdc' && t >= A('gdc', 1) && t < E('gdc', 1) + 0.2) return B('刚体 + <span class="acc">约束</span>', win(t, A('gdc', 1), E('gdc', 1) + 0.2, 0.3), 380);
  if (id === 'power' && t >= A('power', 2) + 2.7 && t < E('power', 2) + 0.2) return B('没有<span class="acc">车辆程序</span>', win(t, A('power', 2) + 2.7, E('power', 2) + 0.2, 0.3), 200);
  if (id === 'launch' && t >= A('launch', 4)) return B('任务<span class="acc">完成</span>', win(t, A('launch', 4), END('launch') + 0.1, 0.4), 330);
  return { html: '', o: 0 };
}

// ---------------------------------------------------------------- 世界坐标标签
const proj = (p) => { const v = new THREE.Vector3().fromArray(p).project(view.camera); return v.z < 1 ? [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H] : null; };
const wl = (p, html, cls = '', dy = -20) => { const s = proj(p); return s ? `<div class="wl ${cls}" style="left:${s[0].toFixed(0)}px;top:${(s[1] + dy).toFixed(0)}px">${html}</div>` : ''; };
let curSeg = null, curLocal = 0, curState = null;
const segLocal = () => curLocal;
const frameExtra = () => curState?.extra;
function labelsFor(seg, st, t) {
  const L = [];
  const top = (html, cls = '') => L.push(`<div class="wl ${cls}" style="left:960px;top:200px">${html}</div>`);
  if (seg.kind === 'demo') {
    if (seg.shot === 'grab_ray' && st.extra?.hit && !st.hold) L.push(wl(st.extra.hit, '打中点', 'bad'));
    if (seg.shot === 'grab_tele') top('瞬移 ✗', 'bad');
    if (seg.shot === 'grab_vel' && t >= S('grab')) top('给速度 ✓');
    if (seg.shot === 'rotate') top(`${(st.extra?.steps || 0) * 45}°`, 'mono');
    if (seg.shot === 'find' && st.extra?.pv) L.push(wl(st.extra.pv.mid, `${st.extra.pv.d.toFixed(2)} m`, 'warm mono', -40));
    if (seg.shot === 'gate_kin') top('动画闸门', 'bad');
    if (seg.shot === 'gate_phys') top('物理闸门');
    if (seg.shot === 'carry_drag') top('只拽一块', 'bad');
    if (seg.shot === 'carry_all' && t >= A('carry', 2) - 0.05) top('一起动');
    if (seg.shot === 'bridge_besiege') top('围攻模式', 'warm');
    if (seg.shot === 'fan' && st.parts[1]?.power) L.push(wl(st.overlay?.[0]?.to || st.parts[1].p, '推', 'warm', -10));
    if (seg.shot === 'launch_fail' && t >= A('launch', 1)) { const pl = st.parts.find(p => p.type === 'pilot'); if (pl) L.push(wl([pl.p[0], pl.p[1] + 0.6, pl.p[2]], '我没事', '', -10)); }
    if (seg.shot === 'launch_ok' && st.extra?.alt > 5) L.push(`<div class="wl mono" style="left:1620px;top:200px">${Math.round(st.extra.alt)} m</div>`);
  }
  return L.join('');
}

// ---------------------------------------------------------------- 主函数
const op = (el, v) => { el.style.opacity = Math.max(0, v).toFixed(3); };
const setHTML = (el, h) => { if (el.dataset.h !== h) { el.innerHTML = h; el.dataset.h = h; } };
function setImg(el, src) { if (el.dataset.src === src) return null; el.dataset.src = src; el.src = src; return el.decode().catch(() => {}); }
const sceneAt = t => { let s = TL.scenes[0]; for (const x of TL.scenes) if (t >= x.start) s = x; return s; };
const lineAt = (sc, t) => { let k = -1; sc.lines.forEach((l, i) => { if (t >= l.start - 0.05) k = i; }); return k; };
const railEl = $('rail');
railEl.innerHTML = TL.scenes.map(() => '<i></i>').join('') + '<em></em>';
const railBars = [...railEl.querySelectorAll('i')], railLabel = railEl.querySelector('em');
const footFrame = (slug, sec) => { const m = MAN[slug]; const idx = 1 + clamp(Math.floor(sec * 30), 0, m.count - 1); return `footage/frames/${slug}/f${String(idx).padStart(4, '0')}.jpg`; };

window.DURATION = TL.duration;
window.renderFrame = async function (t) {
  const waits = [];
  const sc = sceneAt(t), id = sc.id, si = TL.scenes.indexOf(sc), li = lineAt(sc, t);
  const seg = segAt(t); curSeg = seg;
  let dim = 0, code = 0, foot = 0, split = 0;
  // 本段内时间 → 镜头时间
  const local = t - seg.a;
  if (seg.kind !== 'pair') $('pair').classList.remove('on');
  const st0 = seg.to != null ? seg.from + local * (seg.to - seg.from) / Math.max(0.01, seg.b - seg.a) : seg.from + local;
  curLocal = st0;
  if (seg.kind === 'demo') {
    const st = frameOf(seg.shot, st0); curState = st;
    view.render(st, { time: t });
    let lh = labelsFor(seg, st, t); if (codeFor(id, t)) lh = lh.replace(/left:960px;top:200px/g, 'left:520px;top:220px');
    setHTML($('labels'), lh);
  } else if (seg.kind === 'pair') {
    // 左右分屏：两个世界各自渲染一遍，各取画面中间 960 像素拼起来
    const pc = $('pair').getContext('2d');
    const html = [];
    [[seg.sa, 0], [seg.sb, 1]].forEach(([shotId, k]) => {
      const st = { ...frameOf(shotId, st0) }; const c = st.cam, pull = seg.pull ?? 1.35;
      const look = new THREE.Vector3().fromArray(c.look), pos = new THREE.Vector3().fromArray(c.pos).sub(look).multiplyScalar(pull).add(look);
      st.cam = { ...c, pos: pos.toArray(), fov: c.fov };
      if (!st.hold) st.eye = null;
      st.hand = false;
      view.render(st, { time: t });
      pc.drawImage($('gl'), 480, 0, 960, 1080, k * 960, 0, 960, 1080);
      if (k === 0) curState = st;
    });
    pc.fillStyle = '#fff'; pc.fillRect(957, 0, 6, 1080);
    $('pair').classList.add('on');
    html.push(`<div class="wl" style="left:480px;top:190px">${seg.labels[0]}</div><div class="wl warm" style="left:1440px;top:190px">${seg.labels[1]}</div>`);
    setHTML($('labels'), html.join(''));
  } else if (seg.kind === 'foot') {
    foot = 1; setHTML($('labels'), '');
    waits.push(setImg($('foot'), footFrame(seg.slug, local + seg.from)));
    $('footlabel').textContent = MAN[seg.slug].credit;
    const [z0, z1, zx, zy] = seg.zoom, zk = ease(local / (seg.b - seg.a));
    $('foot').style.transformOrigin = `${zx}% ${zy}%`; $('foot').style.transform = `scale(${(z0 + (z1 - z0) * zk).toFixed(4)})`;
  } else if (seg.kind === 'xsplit') {
    split = 1; setHTML($('labels'), '');
    waits.push(setImg($('footA'), footFrame(seg.sa, local + seg.fa)), setImg($('footB'), footFrame(seg.sb, local + seg.fb)));
    setHTML($('labA'), seg.la); setHTML($('labB'), seg.lb);
    $('footlabel').textContent = `左：${MAN[seg.sa].credit}　右：${MAN[seg.sb].credit}`;
  }
  // 大字 / 卡片出现时压暗背景
  const cardDim = { repo: 0.72, outro: 0.45 + 0.4 * ramp(t, A('outro', 1) + 0.6, 0.5),
    hook: (t >= A('hook', 2) + 0.3 && t < END('hook') - 0.1) ? 0.35 : 0 };
  dim = cardDim[id] || 0;
  if (bigFor(id, t).o > 0) dim = Math.max(dim, segAt(t).kind === 'foot' ? 0.82 : 0.5);

  // 代码卡片
  const cf = codeFor(id, t);
  if (cf) { setHTML($('codefile'), cf[0]); setHTML($('codebody'), codeHTML(cf[1])); code = 1; }

  // 章节标题（每章开头 3.2 秒）
  const isStep = !['hook', 'repo', 'outro'].includes(id);
  const pin = isStep ? win(t, sc.start + 0.05, sc.start + 3.4, 0.35) : 0;
  setHTML($('kicker'), sc.kicker); setHTML($('title'), script.scenes[si].title); setHTML($('bullets'), '');
  op($('panel'), pin * (code ? 0 : 1)); $('panel').style.transform = `translateX(${(1 - ramp(t, sc.start + 0.05, 0.35)) * -30}px)`;
  op($('vignetteL'), pin * 0.9);

  // 可信度
  const cr = CRED[`${id}:${li}`];
  if (cr) { $('cred').className = cr[0]; setHTML($('cred'), cr[1]); }
  op($('cred'), cr ? win(t, A(id, li), E(id, li) + 0.2, 0.25) : 0);

  // 画面层
  op($('foot'), foot); op($('footlabel'), foot || split); op($('split'), split); op($('subbg'), foot || split ? 1 : 0.35);
  op($('code'), code * ramp(t, sc.start + 0.2, 0.3));
  railBars.forEach((b, k) => b.className = k < si ? 'done' : k === si ? 'on' : '');
  railLabel.textContent = sc.kicker;
  op($('dim'), dim);
  setHTML($('cards'), cardsFor(id, t));
  const b = bigFor(id, t);
  setHTML($('bigtext'), b.html); op($('bigtext'), b.o); $('bigtext').style.top = `${b.top ?? 380}px`;
  const sub = TL.subs.find(c => t >= c.start && t < c.end + 0.12);
  $('szh').textContent = sub?.zh || ''; $('sen').textContent = sub?.en || '';
  $('szh').style.visibility = $('sen').style.visibility = sub ? 'visible' : 'hidden';
  $('progress').firstElementChild.style.transform = `scaleX(${(t / TL.duration).toFixed(4)})`;
  op($('flash'), 0);
  await Promise.all(waits);
};
await document.fonts.ready;
window.READY = true;
