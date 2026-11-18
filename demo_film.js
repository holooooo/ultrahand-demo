// 可玩演示短片：只放网页里同一套物理的实机画面 + 操作提示，无旁白。
import * as THREE from 'three';
import { initPhysics } from './src/sim.js';
import { View } from './src/view.js';
import { record, FPS } from './src/director.js';
import { SHOTS } from './src/shots.js';

const $ = id => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const win = (t, a, b, d = 0.35) => Math.min(ease((t - a) / d), 1 - ease((t - b + d) / d));
await initPhysics();
const view = new View($('gl'), { width: 1920, height: 1080, dpr: 1 });
view.setHandStyle('orb');
const REC = {};
const rec = id => (REC[id] ||= record(SHOTS[id]));
// [a, b, shot | [shotA, shotB], from, to?, caption]
const SEQ = [
  [0, 4.6, 'hero', 0.3, 4.9, '<div><kbd>左键</kbd>抓起木板</div><div><kbd>Q</kbd>转 45°</div>'],
  [4.6, 9.4, 'hero', 4.9, 9.7, '<div>靠近 → 绿线预览</div><div><kbd>左键</kbd>松手 = 粘上</div>'],
  [9.4, 17, 'hero', 9.7, 17.3, '<div><kbd>V</kbd>开动力</div><div>没有一行“车辆程序”</div>'],
  [17, 25, 'flyer', 1.5, 9.5, '<div>热气球 + 风扇 = 飞板</div>'],
  [25, 32, ['bridge_joint', 'bridge_merge'], 0.6, 7.6, '<div>同一座桥：关节 vs 合并</div>'],
  [32, 40, 'bridge_besiege', 0.6, 8.6, '<div>围攻模式：关节超载就断</div>'],
  [40, 46, ['iter1', 'iter8'], 0, 6, '<div>求解器迭代 1 次 vs 8 次</div>'],
  [46, 52, 'carry_all', 0.4, 6.4, '<div>网页里亲手试试 ↗</div>'],
];
window.DURATION = 52;
if (location.search.includes('clean')) document.body.classList.add('clean');
const QS = new URLSearchParams(location.search);
window.renderFrame = async t => {
  if (QS.get('shot')) { const r = rec(QS.get('shot')); view.render(r.frames[Math.round(t * FPS)], { time: t }); return; }
  const s = SEQ.find(x => t >= x[0] && t < x[1]) || SEQ[SEQ.length - 1];
  const [a, b, shot, from, to, cap] = s;
  const st0 = from + (t - a) * (to - from) / (b - a);
  const pc = $('pair');
  if (Array.isArray(shot)) {
    const ctx = pc.getContext('2d');
    shot.forEach((id, k) => {
      const r = rec(id); const f = { ...r.frames[clamp(Math.round(st0 * FPS), 0, r.frames.length - 1)] };
      const c = f.cam, look = new THREE.Vector3().fromArray(c.look), pos = new THREE.Vector3().fromArray(c.pos).sub(look).multiplyScalar(id.startsWith('bridge') ? 1.25 : 1).add(look);
      f.cam = { ...c, pos: pos.toArray() }; f.eye = null; f.hand = false;
      view.render(f, { time: t });
      ctx.drawImage($('gl'), 480, 0, 960, 1080, k * 960, 0, 960, 1080);
    });
    ctx.fillStyle = '#fff'; ctx.fillRect(957, 0, 6, 1080);
    pc.classList.add('on');
    const L = shot[0].startsWith('bridge') ? ['关节 · 会弯会晃', '合并 · 铁板一块'] : ['迭代 1 次', '迭代 8 次'];
    $('labels').innerHTML = `<div class="wl" style="left:480px;top:190px">${L[0]}</div><div class="wl warm" style="left:1440px;top:190px">${L[1]}</div>`;
  } else {
    pc.classList.remove('on');
    const r = rec(shot); view.render(r.frames[clamp(Math.round(st0 * FPS), 0, r.frames.length - 1)], { time: t });
    $('labels').innerHTML = '';
  }
  $('capbox').innerHTML = `<div class="cap" style="opacity:${win(t, a, b).toFixed(3)}">${cap}</div>`;
  const endO = ease((t - 47) / 0.6);
  $('dim').style.opacity = (0.55 * endO).toFixed(3);
  $('cards').innerHTML = endO > 0.01 ? `<div class="titlecard" style="top:330px;opacity:${endO.toFixed(3)}"><div class="k">机制拆解 · 第 5 期</div><div class="t">我用代码复刻了<em>究极手</em></div><div class="k" style="margin-top:22px">网页可玩 · mechanics-breakdown.pages.dev/05-ultrahand/</div></div>` : '';
};
await document.fonts.ready;
window.READY = true;
