// 从影片分段 + 录好的物理镜头里，自动生成音效时间点（粘、断、抓、开动力、切镜头），写到 sfx_cues.json。
// 用法：node dev/make_cues.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { initPhysics } from '../src/sim.js';
import { record, FPS } from '../src/director.js';
import { SHOTS } from '../src/shots.js';
import { buildSegs } from '../film_segs.js';

const TL = JSON.parse(readFileSync('build/timeline.json', 'utf8'));
const MAN = JSON.parse(readFileSync('footage/manifest.json', 'utf8'));
await initPhysics();
const segs = buildSegs(TL, MAN);
const REC = {};
const rec = id => (REC[id] ||= record(SHOTS[id]));
const sceneAt = t => { let s = TL.scenes[0]; for (const x of TL.scenes) if (t >= x.start) s = x; return s; };
const cues = [];
const cue = (t, type, extra = {}) => { const s = sceneAt(t); cues.push({ scene: s.id, line: null, offset: +(t - s.start).toFixed(3), type, ...extra }); };

for (const seg of segs) {
  const rate = seg.to != null ? (seg.to - seg.from) / (seg.b - seg.a) : 1;
  const toFilm = st => seg.a + (st - seg.from) / rate;
  const inSeg = ft => ft >= seg.a - 1e-3 && ft < seg.b;
  if (seg.kind === 'foot' || seg.kind === 'xsplit') { if (seg.a > 0.5) cue(seg.a, 'whoosh', { gain: 0.35 }); continue; }
  const ids = seg.kind === 'pair' ? [seg.sa, seg.sb] : [seg.shot];
  ids.forEach((id, k) => {
    const r = rec(id); const pan = seg.kind === 'pair' ? (k ? 0.5 : -0.5) : 0;
    const last = r.frames[r.frames.length - 1];
    const seen = new Set();
    for (const f of r.frames) for (const ev of f.events) {
      const key = ev.type + ev.t.toFixed(3); if (seen.has(key)) continue; seen.add(key);
      const ft = toFilm(ev.t); if (!inSeg(ft)) continue;
      if (ev.type === 'glue') cue(ft, 'glue', { pan, gain: 0.7 });
      if (ev.type === 'break') cue(ft, 'crack', { pan, gain: 0.8 });
    }
    // 抓起 / 松手 / 开动力：看相邻帧状态变化
    for (let i = 1; i < r.frames.length; i++) {
      const a = r.frames[i - 1], b = r.frames[i], ft = toFilm(i / FPS);
      if (!inSeg(ft)) continue;
      if (!a.hold && b.hold) cue(ft, 'grab', { pan, gain: 0.5 });
      if (a.hold && !b.hold && !b.events.some(e => e.type === 'glue' && Math.abs(e.t - i / FPS) < 0.1)) cue(ft, 'drop', { pan, gain: 0.4 });
      const pa = a.parts.some(p => p.power), pb = b.parts.some(p => p.power);
      if (!pa && pb) cue(ft, 'power_on', { pan, gain: 0.5 });
    }
    void last;
  });
  if (seg.kind === 'demo' && seg.shot === 'gate_kin') cue(seg.a + 1.0, 'stone', { dur: Math.min(5, seg.b - seg.a - 1), gain: 0.6 });
  if (seg.kind === 'demo' && (seg.shot === 'hero' && seg.from >= 9) || seg.shot === 'fan') cue(seg.a, 'wind', { dur: Math.min(8, seg.b - seg.a), gain: 0.25 });
}
// 章节开头的小提示音、两处大字的重音
for (const s of TL.scenes.slice(1)) cue(s.start + 0.05, 'ui_tick', { gain: 0.5 });
const L = (id, i) => TL.scenes.find(s => s.id === id).lines[i];
cue(L('hook', 1).start + 1.55, 'slam', { gain: 0.55 });
cue(L('hook', 2).start + 0.15, 'whoosh', { gain: 0.6 });
cue(L('gdc', 2).start, 'slam', { gain: 0.45 });
cue(L('hook', 4).start, 'chime', { gain: 0.5 });
cue(L('outro', 1).start + 0.6, 'chime', { gain: 0.5 });
cues.sort((a, b) => TL.scenes.findIndex(s => s.id === a.scene) - TL.scenes.findIndex(s => s.id === b.scene) || a.offset - b.offset);
writeFileSync('sfx_cues.json', JSON.stringify(cues, null, 1));
const count = {}; cues.forEach(c => count[c.type] = (count[c.type] || 0) + 1);
console.log('cues', cues.length, JSON.stringify(count));
