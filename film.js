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
  'hook:1': ['m', '媒体转述 · GDC 2024 讲座'],
  'gdc:1': ['m', '媒体转述 · 法米通 GDC 2024 讲座报道'], 'gdc:2': ['h', '官方 · GDC 2024 讲座'], 'gdc:3': ['h', '官方 · GDC 2024 讲座'],
  'gdc:4': ['h', '官方 · GDC 2024 讲座（下面是我的复刻）'], 'gdc:5': ['h', '官方 · GDC 2024 讲座（下面是我的复刻）'],
  'rotate:1': ['t', '游戏内做法未公开 · 我的选择'],
  'find:3': ['m', '媒体报道的专利 · 待核实'],
  'glue:4': ['t', '我的推测 · 任天堂未公开'],
  'carry:3': ['l', '玩家实测 · 非官方数字'],
  'power:2': ['h', '官方 · GDC 2024 讲座'], 'power:3': ['h', '官方 · GDC 2024 讲座'], 'power:4': ['h', '官方 · 开发者原话'],
  'besiege:0': ['l', '社区 Wiki · 待核实'], 'besiege:1': ['l', 'Unity 关节通用机制 / 社区 Mod'],
};

// ---------------------------------------------------------------- 代码卡片
const CODE = {
  tele: ['// ✗ 运动学：直接改坐标', 'body.setTranslation(target);', '// 穿墙、把别人挤飞'],
  vel: ['// ✓ 物理驱动：给速度', 'v = (target - pos) * 12;', 'v = clampLength(v, 14);', 'body.setLinvel(v);'],
  find: ['// 每帧：我这坨 vs 每个别的零件', 'c = a.contactCollider(b, 0.9);', 'if (c && c.distance < best)', '  best = { a, b, c.point1, c.point2 };'],
  joint: ['// 关节：两个刚体 + 一个固定关节', 'JointData.fixed(anchorA, frameA,', '               anchorB, frameB);'],
  merge: ['// 合并：一个刚体挂多个碰撞体', 'body = createRigidBody(dynamic);', 'for (p of parts) createCollider(p, body);'],
  nocol: ['// 同一坨零件之间不算碰撞', 'filterContactPair(c1, c2) {', '  if (comp(c1) === comp(c2)) return NONE;', '}'],
  fan: ['// 风扇：在它的位置、沿它的朝向推', 'f = forward(fan) * thrust;', 'body.addForceAtPoint(f, fan.pos);'],
  wheel: ['// 轮子：转动关节 + 马达', 'hinge(wheel, board, axle);', 'torque = (speed - ω) * k;', 'wheel.addTorque(+torque);', 'board.addTorque(-torque);'],
  besiege: ['// 围攻模式：关节超载就断', 'stress = drift(joint) * mass * k;', 'if (stress > limit) over++;', 'if (over >= 4) breakJoint();'],
};
const codeHTML = lines => lines.map(l => `<span class="ln">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/(\/\/.*)$/, '<span class="cm">$1</span>').replace(/\b(\d+(\.\d+)?)\b/g, '<span class="num">$1</span>').replace(/\b(if|for|return|of)\b/g, '<span class="kw">$1</span>')}</span>`).join('');
function codeFor(id, t) {
  const at = (i) => t >= A(id, i) - 0.05 && t < E(id, i) + 0.2;
  if (id === 'grab' && t >= A('grab', 1) && t < A('grab', 3) - 0.05) return ['src/ultrahand.js', CODE.tele];
  if (id === 'grab' && t >= A('grab', 3) - 0.05 && t < A('grab', 5) - 0.05) return ['src/ultrahand.js', CODE.vel];
  if (id === 'find' && (at(1) || at(2))) return ['src/sim.js · closestGlue', CODE.find];
  if (id === 'glue' && at(1)) return ['src/sim.js · 关节', CODE.joint];
  if (id === 'glue' && at(2)) return ['src/sim.js · 合并', CODE.merge];
  if (id === 'glue' && at(5)) return ['src/sim.js · hooks', CODE.nocol];
  if (id === 'power' && at(0)) return ['src/sim.js · 风扇', CODE.fan];
  if (id === 'power' && at(1)) return ['src/sim.js · 轮子', CODE.wheel];
  if (id === 'besiege' && at(2)) return ['src/sim.js · 围攻模式', CODE.besiege];
  return null;
}

// ---------------------------------------------------------------- 卡片 / 大字
function cardsFor(id, t) {
  const c = [];
  const at = (html, x, y, o = 1, extra = '') => o > 0.01 && c.push(`<div class="card" style="left:${x}px;top:${y}px;opacity:${o.toFixed(3)};${extra}">${html}</div>`);
  const raw = (html, o = 1) => o > 0.01 && c.push(`<div style="position:absolute;inset:0;opacity:${o.toFixed(3)}">${html}</div>`);
  if (id === 'hook') {
    const o = win(t, A('hook', 2) + 0.2, A('hook', 2) + 4.6, 0.35);
    raw(`<div class="titlecard"><div class="k">机制拆解 · 第 5 期</div><div class="t">我用代码复刻了<em>究极手</em></div></div>`, o);
    const o2 = win(t, A('hook', 4) + 1.2, END('hook') + 0.1, 0.4);
    const names = ['抓', '转', '找点', '粘', '整坨搬', '动力'];
    raw(`<div style="position:absolute;left:0;right:0;top:700px" class="steps6">${names.map((n, i) => `<div style="opacity:${ramp(t, A('hook', 4) + 1.4 + i * 0.25, 0.2).toFixed(2)}"><b>0${i + 1}</b>${n}</div>`).join('')}</div>`, o2);
  }
  if (id === 'repo') {
    const o = win(t, S('repo') + 0.1, END('repo') + 0.2, 0.4);
    const k = t > A('repo', 1) + 0.6;
    raw(`<div class="free" style="position:absolute;left:150px;top:200px">
      <div class="site"><div class="bar">mechanics-breakdown.pages.dev/05-ultrahand/</div><img src="media/site.jpg"></div>
      <div class="repo" style="opacity:${(0.35 + 0.65 * ramp(t, A('repo', 1), 0.4)).toFixed(2)}"><h4>完整源码 · 单独仓库</h4>
        ${['点赞', '投币', '收藏'].map((s, i) => `<div class="row" style="opacity:${k || t > A('repo', 1) + 0.3 * i ? 1 : 0.3}"><i>${['👍', '🪙', '⭐'][i]}</i>${s}</div>`).join('')}
        <div class="arrow">↓ 评论区留言</div><div class="dm">私信发你源码</div></div></div>`, o);
  }
  if (id === 'gdc') {
    const o1 = win(t, A('gdc', 1), E('gdc', 1) + 0.2, 0.4);
    raw(`<div style="position:absolute;left:510px;top:250px" class="layers3">
      <div class="l3" style="opacity:${ramp(t, A('gdc', 1) + 3.2, 0.3)}">王国之泪专用<small>轮子、链条、水的阻力…</small></div>
      <div class="l2" style="opacity:${ramp(t, A('gdc', 1) + 1.8, 0.3)}">任天堂自研物理库<small>社内物理ライブラリ</small></div>
      <div class="l1" style="opacity:${ramp(t, A('gdc', 1) + 0.3, 0.3)}">Havok<small>物理中间件</small></div></div>`, o1);
    const o3 = win(t, A('gdc', 3), E('gdc', 3) + 0.2, 0.4);
    at(`<h3>运动学物体（按动画硬推）</h3><div class="eqn">质量 = <em>∞</em></div><p style="margin-top:12px;text-align:center">它推谁，谁就得让开——哪怕被压进地里</p>`, 560, 330, o3, 'width:800px');
  }
  if (id === 'carry') {
    if (t >= A('carry', 3) - 0.05 && t < A('carry', 4) - 0.05) {
      const ex = frameExtra(t); const n = ex?.n ?? 1, bad = ex?.refused != null && segLocal(t) >= ex.refused - 0.05;
      at(`<div class="counter ${bad ? 'bad' : ''}">${bad ? '22' : n}<span style="font-size:60px">/21</span><small>${bad ? '粘不上了' : '一坨里的零件数'}</small></div>`, 1460, 180, win(t, A('carry', 3), A('carry', 4) - 0.05, 0.3));
    }
  }
  if (id === 'glue') {
    const o1 = win(t, A('glue', 1) + 0.2, E('glue', 1) + 0.2, 0.35), o2 = win(t, A('glue', 2), E('glue', 2) + 0.2, 0.35);
    at(`<h3>做法一 · 关节</h3><div class="dia"><div class="rb">刚体 A</div><div class="jt"></div><div class="rb">刚体 B</div></div><p>两个刚体，中间一个固定关节</p>`, 130, 560, o1, 'width:640px');
    at(`<h3>做法二 · 合并</h3><div class="dia"><div class="one">一个刚体 · 两个碰撞体</div></div><p>从此就是一个物体</p>`, 130, 560, o2, 'width:640px');
  }
  if (id === 'besiege') {
    const o = win(t, A('besiege', 3) + 0.4, END('besiege') + 0.2, 0.4);
    raw(`<div class="versus" style="position:absolute;left:310px;top:600px"><div class="on"><h4>王国之泪</h4><p>边玩边粘 · 世界不能崩<br>一切都是刚体 + 约束</p></div><div><h4>围攻</h4><p>先造后跑 · 关节会断<br>设计一个扛得住的结构</p></div></div>`, o);
  }
  if (id === 'outro') {
    const o = win(t, A('outro', 0), E('outro', 0) + 0.25, 0.4);
    raw(`<div class="free" style="position:absolute;left:150px;top:220px">
      <div class="site"><div class="bar">mechanics-breakdown.pages.dev/05-ultrahand/</div><img src="media/site.jpg"></div>
      <div class="repo"><h4>源码 · 三连 + 评论</h4><div class="dm">私信发你</div></div></div>`, o);
    const o2 = ramp(t, A('outro', 1) - 0.1, 0.5);
    raw(`<div class="endcard"><img class="av" src="brand/avatar.png"><div class="id">粑粑柑（梭哈ai版）</div><div class="sub">机制拆解 · 每期拆一个游戏机制</div>
      <div class="btns">${['点赞', '投币', '收藏'].map((s, i) => `<div class="btn ${t > A('outro', 1) + 0.6 + i * 0.35 ? 'on' : ''}"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="${i === 1 ? 9 : 8}"/></svg>${s}</div>`).join('')}</div>
      <div class="follow">+ 关注</div></div>`, o2);
  }
  return c.join('');
}
function bigFor(id, t) {
  const B = (l1, l2, o, top) => ({ html: `<div class="l1">${l1}</div>${l2 ? `<div class="l2">${l2}</div>` : ''}`, o, top });
  if (id === 'hook') {
    if (t >= A('hook', 1) + 1.6 && t < E('hook', 1) + 0.1) return B('“坏了！”“飞走了！”', '開発中の報告：壊れました！飛んでいきました！', win(t, A('hook', 1) + 1.6, E('hook', 1) + 0.1, 0.25), 360);
    if (t >= A('hook', 4) && t < END('hook') + 0.1) return B('究极手，到底怎么<span class="acc">粘住</span>的？', '', win(t, A('hook', 4), END('hook') + 0.1, 0.35), 330);
  }
  if (id === 'gdc' && t >= A('gdc', 2) && t < E('gdc', 2) + 0.2) return B('一切 = 动力学刚体 + <span class="acc">约束</span>', '无一例外 · without exception', win(t, A('gdc', 2), E('gdc', 2) + 0.2, 0.3), 380);
  if (id === 'gdc' && t >= A('gdc', 6)) return B('规则 1：手里的东西，<span class="acc">也不例外</span>', '', win(t, A('gdc', 6), END('gdc') + 0.1, 0.3), 380);
  if (id === 'power' && t >= A('power', 4)) return B('不做有趣的东西，做<span class="acc">让有趣发生的系统</span>', '堂田卓宏 · GDC 2024', win(t, A('power', 4), END('power') + 0.1, 0.35), 380);
  if (id === 'glue' && t >= A('glue', 4) && t < E('glue', 4) + 0.1) return B('关节，还是<span class="acc">合体</span>？', '任天堂没说 · 车会晃、会被扯开 → 更像关节（推测）', win(t, A('glue', 4) + 0.3, E('glue', 4) + 0.1, 0.3), 160);
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
  if (seg.kind === 'demo') {
    if (seg.shot === 'grab_ray' && st.extra?.hit && !st.hold) L.push(wl(st.extra.hit, '打中点', 'bad'));
    if (seg.shot === 'grab_tele') L.push(`<div class="wl bad" style="left:960px;top:200px">瞬移：改坐标<small>穿墙 · 把木箱挤飞</small></div>`);
    if (seg.shot === 'grab_vel' && SC.grab && t >= S('grab')) L.push(`<div class="wl" style="left:960px;top:200px">速度驱动<small>被墙挡住 · 只能推</small></div>`);
    if (seg.shot === 'rotate') L.push(`<div class="wl mono" style="left:960px;top:200px">${(st.extra?.steps || 0) * 45}°<small>每次 45° · 再吸附到网格</small></div>`);
    if (seg.shot === 'find' && st.extra?.pv) L.push(wl(st.extra.pv.mid, `d = ${st.extra.pv.d.toFixed(2)} m<small>→ ${st.extra.pv.b}</small>`, 'warm mono', -40));
    if (seg.shot === 'gate_kin') L.push(`<div class="wl bad" style="left:960px;top:200px">运动学闸门<small>质量无穷大 · 按动画往下压</small></div>`);
    if (seg.shot === 'gate_phys') L.push(`<div class="wl" style="left:960px;top:200px">物理闸门<small>有质量 · 被冰块顶住</small></div>`);
    if (seg.shot === 'carry_drag') L.push(`<div class="wl bad" style="left:960px;top:200px">只拽被抓的那块</div>`);
    if (seg.shot === 'carry_all' && t >= A('carry', 2) - 0.05) L.push(`<div class="wl" style="left:960px;top:200px">整坨一起追目标</div>`);
    if (seg.shot === 'bridge_besiege') L.push(`<div class="wl warm" style="left:960px;top:200px">围攻模式<small>关节超载就断</small></div>`);
    if (seg.shot === 'fan' && st.parts[1]?.power) L.push(wl(st.overlay?.[0]?.to || st.parts[1].p, '推力', 'warm', -10));
  }
  if (seg.kind === 'pair' && seg.labels) {
    L.push(`<div class="wl" style="left:${seg.labelX?.[0] ?? 560}px;top:190px">${seg.labels[0]}</div><div class="wl warm" style="left:${seg.labelX?.[1] ?? 1360}px;top:190px">${seg.labels[1]}</div>`);
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
  // 卡片出现时压暗背景
  const cardDim = { hook: t >= A('hook', 1) + 1.6 && t < E('hook', 1) + 0.1 ? 0.88 : t >= A('hook', 4) ? 0.55 : 0, repo: 0.72,
    gdc: (t >= A('gdc', 1) && t < E('gdc', 3) + 0.2) ? 0.85 : t >= A('gdc', 6) ? 0.55 : 0, power: t >= A('power', 4) ? 0.6 : 0,
    glue: t >= A('glue', 4) && t < E('glue', 4) ? 0.35 : 0, outro: 0.6 + 0.25 * ramp(t, A('outro', 1) - 0.2, 0.5) };
  dim = cardDim[id] || 0;
  if (id === 'gdc' && t >= A('gdc', 4) - 0.05 && t < A('gdc', 6) - 0.05) dim = 0;

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
