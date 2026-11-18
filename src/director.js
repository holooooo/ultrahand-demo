// 导演：把一段“脚本化的操作”在物理世界里确定性地跑一遍，逐帧存下画面状态和机位。
// 视频渲染时 renderFrame(t) 只是查表——多个渲染进程各跑一遍也得到完全相同的结果。
import * as THREE from 'three';
import { Sim } from './sim.js';
import { Ultrahand } from './ultrahand.js';
import { captureState } from './state.js';

export const FPS = 30, SUB = 2; // 每帧 2 个 60Hz 物理步

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// shot: { id, dur, mode, iterations, setup(ctx), actions: [[t, fn(ctx)]], step(ctx, t), cam(ctx, t) -> {pos, look, fov}, opts }
// ctx: { sim, uh, data, cam: {pos, fwd}, look(target), at(t) }
export function record(shot) {
  const sim = new Sim({ mode: shot.mode || 'joint', iterations: shot.iterations || 4, breakForce: shot.breakForce || 6000 });
  sim.addGround();
  const uh = new Ultrahand(sim, shot.uh || {});
  const ctx = { sim, uh, data: {}, eye: V(0, 1.7, 6), fwd: V(0, 0, -1), overlay: [] };
  ctx.lookAt = (target) => { ctx.fwd.copy(target).sub(ctx.eye).normalize(); };
  shot.setup?.(ctx);
  const frames = [];
  const acts = (shot.actions || []).slice().sort((a, b) => a[0] - b[0]);
  let ai = 0;
  const N = Math.ceil(shot.dur * FPS) + 1;
  for (let f = 0; f < N; f++) {
    const t = f / FPS;
    for (let s = 0; s < SUB; s++) {
      const ts = t + s / (FPS * SUB);
      while (ai < acts.length && acts[ai][0] <= ts + 1e-9) { acts[ai][1](ctx, ts); ai++; }
      shot.step?.(ctx, ts);
      uh.update(1 / 60, ctx.eye.clone(), ctx.fwd.clone());
      sim.step(1 / 60);
    }
    const cam = shot.cam ? shot.cam(ctx, t) : { pos: ctx.eye.clone(), look: ctx.eye.clone().add(ctx.fwd), fov: 62 };
    const st = captureState(sim, uh, { overlay: ctx.overlay.map(o => ({ ...o })), hand: shot.handAt ? shot.handAt(t) : !!shot.hand, statics: sim.statics });
    st.cam = { pos: cam.pos.toArray(), look: cam.look.toArray(), fov: cam.fov || 55, roll: cam.roll || 0 };
    st.eye = ctx.eye.toArray();
    st.extra = shot.extra ? shot.extra(ctx, t) : null;
    frames.push(st);
  }
  return { id: shot.id, dur: shot.dur, frames, statics: sim.statics };
}

// 相机小工具
export const orbit = (center, radius, height, a0, a1, dur, fov = 50) => (ctx, t) => {
  const k = Math.min(1, t / dur), a = a0 + (a1 - a0) * (k * k * (3 - 2 * k));
  const c = typeof center === 'function' ? center(ctx, t) : center;
  return { pos: V(c.x + Math.cos(a) * radius, c.y + height, c.z + Math.sin(a) * radius), look: c.clone(), fov };
};
export const lerpV = (a, b, k) => a.clone().lerp(b, Math.max(0, Math.min(1, k)));
export const smooth = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
