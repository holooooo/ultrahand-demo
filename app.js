// 可玩页面：第一人称 + 究极手。物理 60Hz 固定步长，渲染跟随显示器。
import * as THREE from 'three';
import { initPhysics, Sim } from './src/sim.js';
import { Ultrahand } from './src/ultrahand.js';
import { View } from './src/view.js';
import { captureState } from './src/state.js';
import { PARTS, PART_LIMIT } from './src/parts.js';
import { buildCar, buildFlyer, buildBridge, scatter } from './src/presets.js';

const $ = id => document.getElementById(id);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- tabs
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.id === 'tab-' + b.dataset.tab));
  if (b.dataset.tab === 'method') loadDoc();
});
let docLoaded = false;
async function loadDoc() {
  if (docLoaded) return; docLoaded = true;
  $('doc').innerHTML = await fetch('./method.html').then(r => r.ok ? r.text() : '实现方法整理中…').catch(() => '实现方法整理中…');
}

await initPhysics();
const canvas = $('cv'), stage = $('stage');
const view = new View(canvas, { width: stage.clientWidth, height: stage.clientHeight, dpr: Math.min(2, devicePixelRatio) });
new ResizeObserver(() => view.setSize(stage.clientWidth, stage.clientHeight, Math.min(2, devicePixelRatio))).observe(stage);

const MODES = {
  joint: '每个零件仍是独立刚体，粘合处是一个<b>固定关节</b>。好处：随时能拆、能单独受力；代价：零件多了会软、会晃，物理引擎要多解很多约束。',
  merge: '粘上那一刻把整坨零件<b>合成一个刚体</b>（多个碰撞体挂在同一个刚体上）。铁板一块、最稳也最省；但拆的时候要重新拆分，而且合进去的零件不能各自转动——所以轮子仍然用转动关节。',
  besiege: '和「关节」一样，但每帧检查关节两端被拉开了多远，<b>超载就断</b>。《围攻》的机器会散架就是这个味道：结构设计本身成了玩法。',
};
let sim, uh;
function reset() {
  sim = new Sim({ mode: sim?.mode || 'joint', iterations: +$('it').value });
  sim.addGround();
  sim.addStaticBox([10, 0.6, -12], [3, 0.6, 2.5]);
  sim.addStaticBox([10, 1.4, -6.6], [3, 0.12, 3.2], 0, 0.42);
  scatter(sim, V(0, 0, 0));
  view.setStatics(sim.statics);
  uh = new Ultrahand(sim, uh?.opt);
}
reset();
const setMode = m => {
  sim.setMode(m);
  document.querySelectorAll('#modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  $('modedesc').innerHTML = MODES[m]; $('h-mode').textContent = { joint: '关节', merge: '合并', besiege: '围攻式' }[m];
};
document.querySelectorAll('#modes button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
setMode('joint');
document.querySelectorAll('#layers button').forEach(b => b.onclick = () => {
  const k = b.dataset.k; uh.opt[k] = !uh.opt[k]; b.classList.toggle('lit', uh.opt[k]);
  toast({ teleport: uh.opt.teleport ? 'L0 瞬移：直接改坐标，拿着东西能穿墙' : '速度驱动：碰到墙会被挡住',
    snapRotate: uh.opt.snapRotate ? '旋转按 45° 一格吸附' : '自由旋转（15° 一格）',
    preview: uh.opt.preview ? '实时找最近的粘接点' : '不找粘接点：松手就掉',
    driveAll: uh.opt.driveAll ? '整坨每个零件一起追目标' : '只拽被抓的那块，其余靠关节拖着' }[k]);
});
$('it').oninput = e => { sim.setIterations(+e.target.value); $('itout').textContent = e.target.value; };

// ---------------------------------------------------------------- 玩家
const player = { pos: V(0, 1.7, 6), yaw: 0, pitch: -0.12, vy: 0 };
const keys = new Set();
const fwd = () => V(-Math.sin(player.yaw) * Math.cos(player.pitch), Math.sin(player.pitch), -Math.cos(player.yaw) * Math.cos(player.pitch));
let locked = false;
$('start').onclick = () => canvas.requestPointerLock();
canvas.onclick = () => { if (!locked) canvas.requestPointerLock(); };
document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; $('start').classList.toggle('off', locked); });
document.addEventListener('mousemove', e => {
  if (!locked) return;
  player.yaw -= e.movementX * 0.0022; player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch - e.movementY * 0.0022));
});
canvas.addEventListener('mousedown', e => {
  if (!locked) return;
  if (e.button === 0) uh.held ? doRelease(true) : doGrab();
  if (e.button === 2) doRelease(false);
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('wheel', e => { if (uh.held) { uh.push(-Math.sign(e.deltaY) * 0.8); e.preventDefault(); } }, { passive: false });

const SPAWN_KEYS = ['plank', 'board', 'log', 'crate', 'wheel', 'fan', 'rocket', 'balloon', 'boulder'];
$('spawns').innerHTML = SPAWN_KEYS.map((t, i) => `<button data-t="${t}"><kbd>${i + 1}</kbd>${PARTS[t].label}</button>`).join('');
document.querySelectorAll('#spawns button').forEach(b => b.onclick = () => spawnAhead(b.dataset.t));
function spawnAhead(type) {
  const f = fwd(); f.y = 0; f.normalize();
  const p = player.pos.clone().addScaledVector(f, 4); p.y = 1.6;
  sim.spawn(type, p.toArray(), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), player.yaw));
}
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys.add(e.code);
  if (!locked) return;
  if (e.code === 'KeyQ') uh.rotate('yaw', 1); if (e.code === 'KeyE') uh.rotate('yaw', -1);
  if (e.code === 'KeyR') uh.rotate('pitch', 1); if (e.code === 'KeyF') uh.rotate('pitch', -1);
  if (e.code === 'KeyX' && uh.held) { const n = uh.unglue(); toast(n ? `拆下 ${n} 个粘合点` : '它本来就没粘'); }
  if (e.code === 'KeyV') power();
  if (e.code === 'Space' && player.pos.y <= 1.71) player.vy = 5.2;
  const d = +e.key; if (d >= 1 && d <= 9) spawnAhead(SPAWN_KEYS[d - 1]);
});
addEventListener('keyup', e => keys.delete(e.code));

function doGrab() {
  const h = uh.tryGrab(view.camera.position.clone(), fwd(), 30);
  if (h) toast(`抓起「${h.part.def.label}」${h.rel.length > 1 ? `（连带 ${h.rel.length - 1} 个零件）` : ''}`);
}
function doRelease(glue) {
  const r = uh.release(glue);
  if (r?.refused === 'limit') toast(`超过 ${PART_LIMIT} 个零件，粘不上了`);
  else if (r?.kind === 'hinge') toast('轮子：用转动关节装上');
  else if (r?.kind === 'fixed') toast(sim.mode === 'merge' ? '粘上了 → 合并成一个刚体' : '粘上了 → 新建一个固定关节');
}
function power() {
  const target = uh.held?.part || aimed();
  if (!target) return toast('先看着一台机器');
  const n = sim.togglePower(target);
  toast(n ? '动力 开 / 关' : '这一坨上没有动力零件');
}
$('b-power').onclick = power;
$('b-reset').onclick = () => { reset(); setMode(sim.mode); };
const presetAhead = fn => { const f = fwd(); f.y = 0; f.normalize(); const o = player.pos.clone().addScaledVector(f, 7); o.y = 0; fn(o, Math.atan2(-f.x, -f.z)); };
$('p-car').onclick = () => presetAhead((o, y) => buildCar(sim, o, y + Math.PI / 2));
$('p-fly').onclick = () => presetAhead((o, y) => buildFlyer(sim, o, y + Math.PI / 2));
$('p-bridge').onclick = () => presetAhead(o => { const b = buildBridge(sim, o, 6); view.setStatics(sim.statics); sim.spawn('boulder', [o.x, 7, o.z]); return b; });

function aimed() {
  const hit = sim.raycast(view.camera.position.clone(), fwd(), 30);
  return hit?.part || null;
}

let toastT = 0;
function toast(msg) { $('toast').textContent = msg; $('toast').classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => $('toast').classList.remove('on'), 1600); }

// ---------------------------------------------------------------- 主循环
let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  // 走路
  const f = V(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)), r = V(-f.z, 0, f.x);
  const mv = V();
  if (keys.has('KeyW')) mv.add(f); if (keys.has('KeyS')) mv.sub(f);
  if (keys.has('KeyD')) mv.add(r); if (keys.has('KeyA')) mv.sub(r);
  if (mv.lengthSq()) player.pos.addScaledVector(mv.normalize(), dt * (keys.has('ShiftLeft') ? 9 : 5));
  player.vy -= 14 * dt; player.pos.y += player.vy * dt;
  if (player.pos.y < 1.7) { player.pos.y = 1.7; player.vy = 0; }
  view.camera.position.copy(player.pos);
  view.camera.lookAt(player.pos.clone().add(fwd()));
  // 物理：固定 60Hz
  acc += dt;
  while (acc >= 1 / 60) { uh.update(1 / 60, view.camera.position.clone(), fwd()); sim.step(1 / 60); acc -= 1 / 60; }
  view.follow(player.pos);
  const a = uh.held ? null : aimed();
  const st = captureState(sim, uh);
  view.render(st, { hover: a?.comp, time: sim.time });
  // HUD
  const focus = uh.held?.part || a;
  $('h-n').textContent = focus ? sim.compSize(focus) : 0;
  $('h-j').textContent = sim.edges.length;
  $('h-aim').textContent = uh.held ? `举着：${uh.held.part.def.label}${uh.preview ? ' · 可粘到「' + uh.preview.b.def.label + '」' : ''}` : a ? `看着：${a.def.label}` : '—';
  $('cross').className = 'cross' + (uh.held ? ' hold' : a ? ' aim' : '');
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// 测试 / 录屏接口
window.APP = { sim: () => sim, uh: () => uh, view, player, setMode, reset, toast, power, buildCar: () => $('p-car').onclick(), stats: () => ({ parts: sim.liveParts().length, edges: sim.edges.length, mode: sim.mode }) };
window.READY = true;
