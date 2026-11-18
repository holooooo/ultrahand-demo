// 渲染层：只读 captureState() 产出的纯数据。画风：明亮的手绘感草原 + 发光的“究极手”绿色。
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PARTS } from './parts.js';

const GLOW = new THREE.Color('#5dffa6');       // 究极手主色
const GLOW_HOT = new THREE.Color('#c8ffd9');
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- 程序化贴图
function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
  return t;
}
function woodTex(base = '#b98a55', dark = '#7a5530', planks = 3) {
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const y = hash(i) * h, a = 0.05 + hash(i + 9) * 0.12;
      g.strokeStyle = `rgba(70,40,15,${a})`; g.lineWidth = 1 + hash(i + 3) * 2.5;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3 * hash(i + 5));
      g.stroke();
    }
    g.fillStyle = dark;
    for (let k = 1; k < planks; k++) g.fillRect(0, (k * h) / planks - 2, w, 4);
    for (let i = 0; i < 6; i++) { // 木节
      const x = hash(i + 40) * w, y = hash(i + 50) * h;
      g.fillStyle = 'rgba(90,55,25,.55)'; g.beginPath(); g.ellipse(x, y, 10, 5, 0, 0, 7); g.fill();
    }
  });
}
function barkTex() {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#6e4a2c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = hash(i) * w; g.strokeStyle = `rgba(30,18,8,${0.25 + hash(i + 2) * 0.4})`; g.lineWidth = 2 + hash(i + 7) * 5;
      g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 24) g.lineTo(x + Math.sin(y * 0.03 + i) * 6, y);
      g.stroke();
    }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,120,80,${0.15 * hash(i)})`; g.fillRect(hash(i + 1) * w, hash(i + 3) * h, 18, 4); }
  });
}
function ringTex() {
  return canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#d9b07a'; g.fillRect(0, 0, w, w);
    for (let r = 8; r < w / 2; r += 9 + hash(r) * 6) { g.strokeStyle = 'rgba(120,75,35,.45)'; g.lineWidth = 2; g.beginPath(); g.arc(w / 2, w / 2, r, 0, 7); g.stroke(); }
    g.strokeStyle = '#6e4a2c'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 7, 0, 7); g.stroke();
  });
}
function crateTex() {
  return canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#c99a5f'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(110,70,30,.35)'; g.fillRect(0, i * w / 5, w, 3); }
    g.strokeStyle = '#7c5228'; g.lineWidth = 26; g.strokeRect(13, 13, w - 26, w - 26);
    g.beginPath(); g.moveTo(20, 20); g.lineTo(w - 20, w - 20); g.stroke();
    g.fillStyle = '#3d3d40'; [[22, 22], [w - 22, 22], [22, w - 22], [w - 22, w - 22]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); });
  });
}
function balloonTex() {
  return canvasTex(512, 256, (g, w, h) => {
    const cols = ['#ff6b5e', '#ffe4c4'];
    for (let i = 0; i < 8; i++) { g.fillStyle = cols[i % 2]; g.fillRect((i * w) / 8, 0, w / 8 + 1, h); }
  });
}

// ---------------------------------------------------------------- 外壳：被抓/悬停时的菲涅尔绿光
const auraMat = () => new THREE.ShaderMaterial({
  uniforms: { uColor: { value: GLOW.clone() }, uAmt: { value: 0 }, uTime: { value: 0 } },
  vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vW;
    void main(){ vec4 w = modelMatrix * vec4(position + normal*0.035, 1.0); vW = w.xyz;
      vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz);
      gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform vec3 uColor; uniform float uAmt; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec3 vW;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), vV)), 2.2);
      float scan = 0.55 + 0.45*sin(vW.y*9.0 - uTime*6.0);
      float a = uAmt * (0.12 + f*1.1) * (0.75 + 0.25*scan);
      gl_FragColor = vec4(uColor * (1.4 + f*2.0), a); }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});

// ---------------------------------------------------------------- 零件网格
function buildPartMesh(type, mats) {
  const def = PARTS[type], s = def.shape;
  const g = new THREE.Group();
  const add = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; g.add(m); return m; };
  const shells = [];
  if (type === 'plank' || type === 'board') {
    const geo = new THREE.BoxGeometry(s[1] * 2, s[2] * 2, s[3] * 2, 1, 1, 1);
    add(geo, type === 'board' ? mats.board : mats.plank); shells.push(geo);
  } else if (type === 'ice') {
    const geo = new THREE.BoxGeometry(s[1] * 2, s[2] * 2, s[3] * 2); add(geo, mats.ice); shells.push(geo);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: '#e8fbff', transparent: true, opacity: 0.8 })); g.add(edges);
  } else if (type === 'crate') {
    const geo = new THREE.BoxGeometry(s[1] * 2, s[2] * 2, s[3] * 2); add(geo, mats.crate); shells.push(geo);
  } else if (type === 'log') {
    const geo = new THREE.CylinderGeometry(s[2], s[2], s[1] * 2, 20, 1, true); add(geo, mats.bark);
    const cap = new THREE.CircleGeometry(s[2], 20);
    const c1 = add(cap, mats.rings); c1.rotation.x = -Math.PI / 2; c1.position.y = s[1];
    const c2 = add(cap, mats.rings); c2.rotation.x = Math.PI / 2; c2.position.y = -s[1];
    shells.push(new THREE.CylinderGeometry(s[2], s[2], s[1] * 2, 20));
  } else if (type === 'boulder') {
    const geo = new THREE.IcosahedronGeometry(s[1], 2); const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(pos, i); v.multiplyScalar(0.9 + 0.16 * hash(Math.round(v.x * 40) * 7 + Math.round(v.y * 40) * 13 + Math.round(v.z * 40))); pos.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals(); add(geo, mats.stone); shells.push(geo);
  } else if (type === 'wheel') {
    const r = s[2], hh = s[1];
    const tire = add(new THREE.TorusGeometry(r - 0.11, 0.12, 12, 28), mats.rubber); tire.rotation.x = Math.PI / 2;
    const hub = add(new THREE.CylinderGeometry(r - 0.16, r - 0.16, hh * 1.6, 24), mats.bronze);
    for (let i = 0; i < 6; i++) { const sp = add(new THREE.BoxGeometry(0.05, hh * 2, r * 1.5), mats.bronzeDark); sp.rotation.y = (i / 6) * Math.PI; }
    const cap = add(new THREE.CylinderGeometry(0.11, 0.11, hh * 2.3, 14), mats.glowTeal, false);
    g.userData.spinner = null; g.userData.glow = [cap];
    shells.push(new THREE.CylinderGeometry(r, r, hh * 2, 24));
    void hub;
  } else if (type === 'fan') {
    const [hx, hy, hz] = [s[1], s[2], s[3]];
    const ring = add(new THREE.TorusGeometry(hx * 0.92, 0.07, 10, 28), mats.bronze); ring.position.z = hz * 0.2;
    const back = add(new THREE.BoxGeometry(hx * 2, hy * 2, hz * 0.6), mats.stoneTeal); back.position.z = -hz * 0.6;
    const rotor = new THREE.Group(); rotor.position.z = hz * 0.25; g.add(rotor);
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, hx * 0.8, 0.02), mats.bronzeDark); b.position.y = hx * 0.4; const pv = new THREE.Group(); pv.rotation.z = (i / 4) * Math.PI * 2; b.rotation.y = 0.5; pv.add(b); rotor.add(pv); b.castShadow = true; }
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), mats.glowTeal); rotor.add(core);
    g.userData.spinner = rotor; g.userData.glow = [core];
    shells.push(new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2));
  } else if (type === 'rocket') {
    const r = s[2], hh = s[1];
    add(new THREE.CylinderGeometry(r, r, hh * 1.4, 18), mats.rocket);
    const nose = add(new THREE.ConeGeometry(r, hh * 0.6, 18), mats.bronze); nose.position.y = hh * 1.0;
    const noz = add(new THREE.CylinderGeometry(r * 0.7, r * 1.05, hh * 0.3, 18), mats.bronzeDark); noz.position.y = -hh * 0.85;
    for (let i = 0; i < 3; i++) { const f = add(new THREE.BoxGeometry(0.03, 0.3, 0.22), mats.bronzeDark); const a = (i / 3) * Math.PI * 2; f.position.set(Math.cos(a) * r, -hh * 0.6, Math.sin(a) * r); f.rotation.y = -a; }
    const band = add(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.07, 18), mats.glowTeal, false); band.position.y = hh * 0.3;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(r * 1.1, 2.4, 16, 1, true), mats.flame);
    flame.rotation.x = Math.PI; flame.position.y = -hh - 1.25; g.add(flame);
    g.userData.flame = flame; g.userData.glow = [band];
    shells.push(new THREE.CylinderGeometry(r, r, hh * 2, 18));
  } else if (type === 'pilot') {
    // 乘客：一只橘子宇航员（原创造型）
    const r = s[1];
    const body = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), mats.orange); body.castShadow = true; g.add(body); shells.push(body.geometry);
    for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), mats.eye); e.position.set(sx * 0.11, 0.06, r * 0.93); g.add(e); }
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 6, 16, Math.PI), mats.eye); smile.position.set(0, -0.04, r * 0.95); smile.rotation.z = Math.PI; g.add(smile);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), mats.leaf); leaf.scale.set(1.4, 0.35, 0.7); leaf.position.set(0.06, r + 0.02, 0); leaf.rotation.z = 0.4; g.add(leaf);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(r * 1.22, 28, 20), mats.glass); g.add(helmet);
  } else if (type === 'balloon') {
    const r = s[1];
    const geo = new THREE.SphereGeometry(r, 28, 20); add(geo, mats.balloon); shells.push(geo);
    const knot = add(new THREE.CylinderGeometry(0.05, 0.12, 0.18, 10), mats.bronzeDark); knot.position.y = -r - 0.05;
  }
  // 合成一个外壳用来发光（取最外层几何）
  const aura = new THREE.Mesh(shells[0], auraMat()); aura.renderOrder = 5; aura.visible = false;
  if (type === 'log' || type === 'wheel' || type === 'rocket') { /* 圆柱：几何沿 Y */ }
  g.add(aura); g.userData.aura = aura;
  return g;
}

// ---------------------------------------------------------------- 主类
export class View {
  constructor(canvas, { width = 1280, height = 720, dpr = 1, quality = 'high' } = {}) {
    this.canvas = canvas;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    r.setPixelRatio(dpr); r.setSize(width, height, false);
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(62, width / height, 0.05, 900);
    scene.fog = new THREE.Fog('#d3e5ea', 90, 460);
    this._sky(); this._lights(); this._terrain();
    this.mats = this._materials();
    this.partMeshes = new Map();
    this.glueMeshes = new Map();
    this._fx();
    this._hand();
    scene.add(this.camera);
    this.composer = new EffectComposer(r);
    this.composer.addPass(new RenderPass(scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.38, 0.45, 0.93);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.setSize(width, height, dpr);
    this.showHand = true;
  }
  setSize(w, h, dpr = this.renderer.getPixelRatio()) {
    this.renderer.setPixelRatio(dpr); this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(dpr); this.composer.setSize(w, h);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  _sky() {
    const geo = new THREE.SphereGeometry(800, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uSun: { value: new THREE.Vector3(0.45, 0.55, -0.7).normalize() }, uAlt: { value: 0 } },
      vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
      fragmentShader: `uniform vec3 uSun; uniform float uAlt; varying vec3 vD;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        void main(){ float y = vD.y;
          vec3 top = vec3(0.23,0.47,0.82), mid = vec3(0.55,0.75,0.93), hor = vec3(0.86,0.91,0.88);
          vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, y)); c = mix(c, top, smoothstep(0.18, 0.75, y));
          if (y < 0.0) c = mix(hor, vec3(0.62,0.72,0.62), smoothstep(0.0, -0.2, y));
          float s = max(dot(vD, uSun), 0.0);
          c += vec3(1.0,0.86,0.6) * (pow(s, 600.0)*6.0 + pow(s, 12.0)*0.25);
          vec2 uv = vD.xz / (vD.y + 0.18) * 1.6;
          float cl = n(uv*1.3) * 0.6 + n(uv*3.1) * 0.3 + n(uv*7.0)*0.1;
          cl = smoothstep(0.52, 0.8, cl) * smoothstep(0.02, 0.25, y);
          c = mix(c, vec3(1.0,0.99,0.97), cl*0.85*(1.0-uAlt));
          // 越飞越高：天空变暗、出星星
          vec3 space = mix(vec3(0.01,0.02,0.06), vec3(0.08,0.2,0.45), smoothstep(-0.05, 0.25, -y + 0.15));
          float st = step(0.9975, h(floor(vD.xz / (abs(vD.y)+0.3) * 380.0) + floor(vD.y*380.0))) * smoothstep(0.0, 0.3, y);
          space += vec3(st);
          space += vec3(1.0,0.86,0.6) * pow(s, 600.0)*6.0;
          c = mix(c, space, uAlt);
          gl_FragColor = vec4(c, 1.0); }`,
    });
    this.sky = mat; this.skyMesh = new THREE.Mesh(geo, mat); this.scene.add(this.skyMesh);
  }
  _lights() {
    const hemi = new THREE.HemisphereLight('#dcefff', '#5b7a3a', 0.95); this.scene.add(hemi);
    const sun = this.sun = new THREE.DirectionalLight('#fff0d0', 3.0);
    sun.position.set(28, 40, -32); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
    const c = sun.shadow.camera; c.left = -26; c.right = 26; c.top = 26; c.bottom = -26; c.near = 1; c.far = 140;
    this.scene.add(sun); this.scene.add(sun.target);
  }
  _terrain() {
    const geo = new THREE.PlaneGeometry(900, 900, 1, 1); geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: '#7fae4f', roughness: 1 });
    mat.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix*vec4(transformed,1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vWP;
        float gh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float gn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(gh(i),gh(i+vec2(1,0)),f.x), mix(gh(i+vec2(0,1)),gh(i+vec2(1,1)),f.x), f.y); }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float g1 = gn(vWP.xz*0.08), g2 = gn(vWP.xz*0.5), g3 = gn(vWP.xz*3.0);
          vec3 lush = vec3(0.30,0.55,0.17), dry = vec3(0.58,0.62,0.26), deep = vec3(0.19,0.40,0.13);
          vec3 gc = mix(lush, dry, smoothstep(0.45, 0.8, g1));
          gc = mix(gc, deep, smoothstep(0.55, 0.9, g2)*0.5);
          gc *= 0.86 + 0.22*g3;
          float path = smoothstep(2.2, 1.2, abs(vWP.x - 3.0*sin(vWP.z*0.06)) ) * step(vWP.z, 30.0) * step(-60.0, vWP.z);
          gc = mix(gc, vec3(0.60,0.50,0.35), path*0.7);
          diffuseColor.rgb = gc;`);
    };
    const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; this.scene.add(m);
    // 草丛（实例化）
    // 草丛：每丛三片弯曲的草叶（三角形），顶点色从根部深到叶尖浅
    const blade = (() => {
      const pos = [], colr = [];
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + 0.3, w = 0.045, h = 0.32 + 0.1 * k, lean = 0.12;
        const cx = Math.cos(a), sz = Math.sin(a);
        const px = -sz * w, pz = cx * w;
        pos.push(px, 0, pz, -px, 0, -pz, cx * lean, h, sz * lean);
        colr.push(0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 1.25, 1.25, 1.1);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
      g.computeVertexNormals();
      return g;
    })();
    const gmat = new THREE.MeshStandardMaterial({ color: '#5e9a36', roughness: 1, side: THREE.DoubleSide, vertexColors: true });
    const N = 16000, inst = new THREE.InstancedMesh(blade, gmat, N);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const a = hash(i) * Math.PI * 2, rr = 3 + Math.sqrt(hash(i + 0.5)) * 75;
      const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      e.set((hash(i + 2) - 0.5) * 0.3, hash(i + 3) * 6, (hash(i + 4) - 0.5) * 0.3); q.setFromEuler(e);
      const s = 0.7 + hash(i + 5) * 1.1;
      M.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(s, s * (0.7 + hash(i + 6) * 0.8), s)); inst.setMatrixAt(i, M);
      inst.setColorAt(i, col.setHSL(0.25 + hash(i + 7) * 0.05, 0.55, 0.36 + hash(i + 8) * 0.1));
    }
    inst.receiveShadow = true; this.scene.add(inst);
    // 远处的树和山
    const trunk = new THREE.CylinderGeometry(0.25, 0.35, 3, 7); trunk.translate(0, 1.5, 0);
    const crown = new THREE.IcosahedronGeometry(2.2, 1); crown.translate(0, 4.3, 0);
    const tmT = new THREE.MeshStandardMaterial({ color: '#6b4a2f', roughness: 1 });
    const tmC = new THREE.MeshStandardMaterial({ color: '#4f8a3a', roughness: 1, flatShading: true });
    const TN = 90, iT = new THREE.InstancedMesh(trunk, tmT, TN), iC = new THREE.InstancedMesh(crown, tmC, TN);
    for (let i = 0; i < TN; i++) {
      const a = hash(i + 100) * Math.PI * 2, rr = 34 + hash(i + 101) * 110; const s = 0.8 + hash(i + 102) * 0.9;
      M.compose(new THREE.Vector3(Math.cos(a) * rr, 0, Math.sin(a) * rr), q.identity(), new THREE.Vector3(s, s, s));
      iT.setMatrixAt(i, M); iC.setMatrixAt(i, M); iC.setColorAt(i, col.setHSL(0.27 + hash(i + 3) * 0.05, 0.45, 0.3 + hash(i + 9) * 0.1));
    }
    iT.castShadow = iC.castShadow = true; this.scene.add(iT, iC);
    // 远山：两圈山脊（开口圆柱，顶边按噪声起伏），不吃雾，按远近调成“空气透视”的蓝灰
    const ridge = (R, H, amp, seed, c0, c1) => {
      const seg = 256, geo = new THREE.CylinderGeometry(R, R, 1, seg, 1, true), pos = geo.attributes.position, colr = [];
      const cA = new THREE.Color(c0), cB = new THREE.Color(c1);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), top = pos.getY(i) > 0, a = Math.atan2(z, x);
        let h = 0; for (let o = 1; o <= 5; o++) h += Math.sin(a * (o * 3 + seed) + seed * o * 1.7) * amp / (o * 1.3) + Math.sin(a * (o * 7 + 2) + seed) * amp * 0.12 / o;
        pos.setY(i, top ? H + h : -4);
        const c = top ? cB.clone().lerp(new THREE.Color('#ffffff'), Math.max(0, (h - amp * 0.6) / amp) * 0.6) : cA;
        colr.push(c.r, c.g, c.b);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3)); geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.BackSide }));
      this.scene.add(m); return m;
    };
    ridge(560, 70, 42, 3, '#b9cdd6', '#9fb6c4');
    ridge(470, 34, 22, 7, '#9cb39a', '#7f9d8c');
    this.staticGroup = new THREE.Group(); this.scene.add(this.staticGroup);
  }
  setStatics(statics) {
    this.staticGroup.clear();
    const mat = new THREE.MeshStandardMaterial({ color: '#a39b8b', roughness: 0.95 });
    for (const s of statics) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(s.half[0] * 2, s.half[1] * 2, s.half[2] * 2), mat);
      m.position.set(...s.p); m.quaternion.copy(s.q); m.castShadow = m.receiveShadow = true; this.staticGroup.add(m);
    }
  }
  _materials() {
    const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.8, ...o });
    return {
      plank: std({ map: woodTex('#c49a63', '#80562f', 2) }),
      board: std({ map: woodTex('#b78b57', '#6f4a27', 4) }),
      bark: std({ map: barkTex(), roughness: 0.95 }),
      rings: std({ map: ringTex() }),
      crate: std({ map: crateTex() }),
      stone: std({ color: '#9c968b', roughness: 0.95, flatShading: true }),
      rubber: std({ color: '#2c2a2a', roughness: 0.9 }),
      bronze: std({ color: '#c98d4a', metalness: 0.7, roughness: 0.38 }),
      bronzeDark: std({ color: '#8a5a2c', metalness: 0.6, roughness: 0.5 }),
      stoneTeal: std({ color: '#6f8f86', roughness: 0.75, flatShading: true }),
      rocket: std({ color: '#e8e1d0', roughness: 0.55 }),
      orange: std({ color: '#ff9f1c', roughness: 0.55 }),
      eye: new THREE.MeshBasicMaterial({ color: '#1b1208' }),
      leaf: std({ color: '#3f9a2e', roughness: 0.6 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#dff6ff', roughness: 0.05, transmission: 0.9, transparent: true, opacity: 0.35, depthWrite: false }),
      ice: new THREE.MeshPhysicalMaterial({ color: '#bfeaff', roughness: 0.08, metalness: 0, transmission: 0.55, thickness: 0.6, transparent: true, opacity: 0.88, emissive: new THREE.Color('#3aa8d8'), emissiveIntensity: 0.25 }),
      gate: std({ color: '#7d786c', roughness: 0.85, flatShading: true }),
      gateTrim: new THREE.MeshStandardMaterial({ color: '#111', emissive: new THREE.Color('#ffb347'), emissiveIntensity: 1.4 }),
      balloon: std({ map: balloonTex(), roughness: 0.45 }),
      glowTeal: new THREE.MeshStandardMaterial({ color: '#244', emissive: new THREE.Color('#ffb347'), emissiveIntensity: 0.4 }),
      flame: new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uAmt: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        vertexShader: 'varying vec2 vUv; uniform float uTime; void main(){ vUv=uv; vec3 p=position; p.xz *= 1.0 + 0.15*sin(uTime*40.0+uv.y*10.0); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);} ',
        fragmentShader: 'varying vec2 vUv; uniform float uAmt; void main(){ float k = 1.0 - vUv.y; float a = pow(k, 1.3) * uAmt; vec3 c = mix(vec3(1.0,0.22,0.02), vec3(1.0,0.92,0.55), pow(k, 2.5)); gl_FragColor = vec4(c*2.6, a); }',
      }),
      glue: new THREE.MeshStandardMaterial({ color: '#2a6', emissive: GLOW.clone(), emissiveIntensity: 1.6, roughness: 0.3, transparent: true, opacity: 0.92 }),
      glueHinge: new THREE.MeshStandardMaterial({ color: '#2a6', emissive: new THREE.Color('#9dffcf'), emissiveIntensity: 1.8, roughness: 0.3 }),
    };
  }
  _fx() {
    // 预览线 / 光束：每帧重建的管子（顶点少，开销可以忽略）
    this.beamMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: GLOW.clone() }, uAmt: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
      fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform float uAmt; varying vec2 vUv;
        void main(){ float core = pow(1.0 - abs(vUv.y*2.0-1.0), 2.0);
          float flow = 0.55 + 0.45*sin(vUv.x*60.0 - uTime*18.0);
          gl_FragColor = vec4(uColor * (1.6 + core*2.0), (0.25 + 0.75*core) * flow * uAmt); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.beam = new THREE.Mesh(new THREE.BufferGeometry(), this.beamMat); this.beam.frustumCulled = false; this.scene.add(this.beam);
    this.prevMat = this.beamMat.clone(); this.prevMat.uniforms.uColor.value = new THREE.Color('#f6ff7a');
    this.prev = new THREE.Mesh(new THREE.BufferGeometry(), this.prevMat); this.prev.frustumCulled = false; this.scene.add(this.prev);
    const ringGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 24);
    this.prevRings = [0, 1].map(() => { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#f6ff7a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); this.scene.add(m); return m; });
    this.grabDot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: GLOW_HOT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.scene.add(this.grabDot);
    // 第三人称镜头里，用一颗发光的“手”球代表玩家的手
    this.orbs = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), new THREE.MeshStandardMaterial({ color: '#000', emissive: GLOW_HOT.clone(), emissiveIntensity: 3 })); m.visible = false; this.scene.add(m); return m; });
    this.beamB = new THREE.Mesh(new THREE.BufferGeometry(), this.beamMat); this.beamB.frustumCulled = false; this.scene.add(this.beamB);
    this.prevB = new THREE.Mesh(new THREE.BufferGeometry(), this.prevMat); this.prevB.frustumCulled = false; this.scene.add(this.prevB);
    this.grabDotB = this.grabDot.clone(); this.scene.add(this.grabDotB);
    this.arrows = []; this.gateMeshes = []; this._staticsKey = '';
    // 粒子：事件（粘、断、拆）的爆发，纯函数于时间，所以视频逐帧确定
    const PN = 3200;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PN * 3), 3));
    pg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(PN * 3), 3));
    pg.setAttribute('size', new THREE.BufferAttribute(new Float32Array(PN), 1));
    this.pts = new THREE.Points(pg, new THREE.ShaderMaterial({
      vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute float size; varying vec3 vC; void main(){ vC = color; vec4 mv = modelViewMatrix*vec4(position,1.0); gl_PointSize = size * 300.0 / -mv.z; gl_Position = projectionMatrix*mv; }',
      fragmentShader: 'varying vec3 vC; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(vC*(1.0-d*1.6), 1.0-d*2.0); }',
    }));
    this.pts.frustumCulled = false; this.scene.add(this.pts); this.PN = PN;
    const SN = 900, sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SN * 3), 3));
    sg.setAttribute('size', new THREE.BufferAttribute(new Float32Array(SN), 1));
    sg.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(SN), 1));
    this.smoke = new THREE.Points(sg, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      vertexShader: 'attribute float size; attribute float alpha; varying float vA; void main(){ vA = alpha; vec4 mv = modelViewMatrix*vec4(position,1.0); gl_PointSize = size * 300.0 / -mv.z; gl_Position = projectionMatrix*mv; }',
      fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; float a = vA * smoothstep(0.5, 0.15, d); gl_FragColor = vec4(vec3(0.93,0.93,0.95) - d*0.25, a); }',
    }));
    this.smoke.frustumCulled = false; this.scene.add(this.smoke); this.SN = SN;
  }
  _hand() {
    // 第一人称的手（原创造型：铜色护臂 + 发光掌心）
    const g = this.hand = new THREE.Group();
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.5, 6, 12), new THREE.MeshStandardMaterial({ color: '#d9b48a', roughness: 0.7 }));
    arm.rotation.x = Math.PI / 2; arm.position.z = 0.25; g.add(arm);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.1, 0.22, 16), new THREE.MeshStandardMaterial({ color: '#3a4a46', metalness: 0.5, roughness: 0.4 }));
    cuff.rotation.x = Math.PI / 2; cuff.position.z = 0.18; g.add(cuff);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 24), new THREE.MeshStandardMaterial({ color: '#000', emissive: GLOW.clone(), emissiveIntensity: 2 }));
    band.position.z = 0.1; g.add(band);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshStandardMaterial({ color: '#000', emissive: GLOW_HOT.clone(), emissiveIntensity: 2.5 }));
    palm.position.z = -0.04; g.add(palm);
    g.userData = { band, palm, arm, cuff };
    g.position.set(0.36, -0.36, -0.78); g.rotation.set(0.12, -0.28, 0); g.scale.setScalar(0.85);
    this.camera.add(g);
  }

  // 'orb'：只留一颗发光的掌心球（视频里更干净）
  setHandStyle(style) {
    const u = this.hand.userData, orb = style === 'orb';
    u.arm.visible = u.cuff.visible = u.band.visible = !orb;
    if (orb) { u.palm.scale.setScalar(1.6); this.hand.position.set(0.5, -0.36, -0.95); }
  }
  // 被抓零件的世界坐标手心位置（光束起点）
  handTip() { return new THREE.Vector3(0, 0, -0.04).applyMatrix4(this.hand.userData.palm.matrixWorld); }

  _tube(mesh, pts, radius) {
    const curve = new THREE.CatmullRomCurve3(pts);
    mesh.geometry.dispose();
    mesh.geometry = new THREE.TubeGeometry(curve, 40, radius, 6, false);
  }

  _ensurePart(p) {
    let m = this.partMeshes.get(p.id);
    if (!m || m.userData.type !== p.type) {
      if (m) this.scene.remove(m);
      m = buildPartMesh(p.type, this.mats); m.userData.type = p.type; this.scene.add(m); this.partMeshes.set(p.id, m);
    }
    return m;
  }

  // state: captureState() 的结果；opts: { hover, time }
  render(state, opts = {}) {
    const time = opts.time ?? state.t;
    if (state.cam) {
      const c = state.cam; this.camera.position.fromArray(c.pos); this.camera.up.set(Math.sin(c.roll || 0), Math.cos(c.roll || 0), 0);
      this.camera.lookAt(new THREE.Vector3().fromArray(c.look));
      if (this.camera.fov !== c.fov) { this.camera.fov = c.fov; this.camera.updateProjectionMatrix(); }
      this.follow(new THREE.Vector3().fromArray(c.look));
    }
    this.skyMesh.position.copy(this.camera.position);
    { const alt = this.camera.position.y, k = Math.min(1, Math.max(0, (alt - 40) / 320)); this.sky.uniforms.uAlt.value = k * k * (3 - 2 * k);
      this.scene.fog.near = 90 + alt * 2; this.scene.fog.far = 460 + alt * 4; }
    if (state.statics) { const key = JSON.stringify(state.statics.map(s => [s.p, s.half])); if (key !== this._staticsKey) { this._staticsKey = key; this.setStatics(state.statics); } }
    this._gates(state.gates || []);
    this._overlay(state.overlay || []);
    if (state.hand != null) this.showHand = state.hand;
    const seen = new Set();
    for (const p of state.parts) {
      const m = this._ensurePart(p); seen.add(p.id);
      m.position.fromArray(p.p); m.quaternion.fromArray(p.q);
      if (m.userData.spinner) m.userData.spinner.rotation.z = p.spin;
      const powered = p.power;
      if (m.userData.glow) for (const gm of m.userData.glow) gm.material = powered && p.type !== 'balloon' ? this._hotMat() : this.mats.glowTeal;
      if (m.userData.flame) { m.userData.flame.visible = p.power && p.burn > 0; this.mats.flame.uniforms.uAmt.value = 1; this.mats.flame.uniforms.uTime.value = time; }
      const aura = m.userData.aura;
      const held = state.hold && p.comp === state.parts.find(q => q.id === state.hold.part)?.comp;
      const hover = !state.hold && opts.hover != null && p.comp === opts.hover;
      const amt = held ? 1 : hover ? 0.45 : 0;
      aura.visible = amt > 0; aura.material.uniforms.uAmt.value = amt; aura.material.uniforms.uTime.value = time;
    }
    for (const [id, m] of this.partMeshes) if (!seen.has(id)) { this.scene.remove(m); this.partMeshes.delete(id); }

    // 胶水团：粘上的瞬间“拉丝”长出来，然后留下一个发光小团
    const gseen = new Set();
    for (const e of state.edges) {
      gseen.add(e.id);
      let g = this.glueMeshes.get(e.id);
      if (!g) { g = this._glueBlob(e); this.glueMeshes.set(e.id, g); this.scene.add(g); }
      const age = time - e.born;
      const k = Math.min(1, age / 0.35); const pop = 1 + Math.sin(Math.min(1, age / 0.5) * Math.PI) * 0.6;
      g.position.fromArray(e.pts[0]);
      g.scale.setScalar(Math.max(0.001, k * pop));
      if (e.kind === 'hinge') { const a = new THREE.Vector3().fromArray(e.pts[1]).sub(g.position).normalize(); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a); }
      const stress = Math.min(1, e.stress || 0);
      g.children.forEach(c => { if (c.material.emissive) c.material.emissive.copy(GLOW).lerp(new THREE.Color('#ff4a3a'), stress); });
    }
    for (const [id, g] of this.glueMeshes) if (!gseen.has(id)) { this.scene.remove(g); this.glueMeshes.delete(id); }

    // 光束：手心 -> 抓点，弯一点
    this.hand.visible = this.showHand;
    const holding = !!state.hold;
    this.hand.userData.palm.material.emissiveIntensity = holding ? 3 + Math.sin(time * 20) * 0.5 : 0.5;
    this.hand.userData.band.material.emissiveIntensity = holding ? 2.6 : 0.7;
    this.camera.updateMatrixWorld(true);
    const beamTo = (mesh, dot, hold, eye) => {
      if (!hold) { mesh.visible = false; dot.visible = false; return; }
      const a = eye ? new THREE.Vector3().fromArray(eye) : this.showHand ? this.handTip() : new THREE.Vector3(0.5, -0.6, -1).applyMatrix4(this.camera.matrixWorld);
      const b = new THREE.Vector3().fromArray(hold.grab);
      const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 0.25 + a.distanceTo(b) * 0.05, 0));
      const pts = [a, a.clone().lerp(mid, 0.5), mid, mid.clone().lerp(b, 0.5), b];
      pts.forEach((p, i) => { if (i > 0 && i < 4) p.y += Math.sin(time * 9 + i * 2) * 0.03; });
      this._tube(mesh, pts, eye ? 0.04 : 0.028);
      mesh.visible = true; this.beamMat.uniforms.uTime.value = time;
      dot.visible = true; dot.position.copy(b); dot.scale.setScalar(1 + Math.sin(time * 14) * 0.25);
    };
    const third = !this.showHand && state.eye;
    beamTo(this.beam, this.grabDot, state.hold, third ? state.eye : null);
    beamTo(this.beamB, this.grabDotB, state.holdB, state.eyeB);
    this.orbs[0].visible = !!(third && state.showEye !== false); if (third) this.orbs[0].position.fromArray(state.eye);
    this.orbs[1].visible = !!state.eyeB; if (state.eyeB) this.orbs[1].position.fromArray(state.eyeB);
    this.orbs.forEach(o => o.scale.setScalar(1 + 0.12 * Math.sin(time * 6)));

    // 预览：最近的一对点之间的黄绿线 + 两个小圈
    const prevLine = (mesh, pv, rings) => {
      if (!pv) { mesh.visible = false; if (rings) rings.forEach(r => (r.visible = false)); return; }
      const a = new THREE.Vector3().fromArray(pv.pa), b = new THREE.Vector3().fromArray(pv.pb);
      if (a.distanceTo(b) < 0.02) b.add(new THREE.Vector3(0, 0.02, 0));
      this._tube(mesh, [a, a.clone().lerp(b, 0.5), b], 0.035);
      mesh.visible = true; this.prevMat.uniforms.uTime.value = time;
      if (rings) rings.forEach((r, i) => { r.visible = true; r.position.copy(i ? b : a); r.lookAt(this.camera.position); r.scale.setScalar(1 + 0.25 * Math.sin(time * 10 + i)); });
    };
    prevLine(this.prev, state.preview, this.prevRings);
    prevLine(this.prevB, state.previewB, null);

    this._particles(state, time);
    this.renderer.toneMappingExposure = 0.98;
    this.composer.render();
  }
  _gates(list) {
    while (this.gateMeshes.length < list.length) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.mats.gate); body.castShadow = body.receiveShadow = true; g.add(body);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.06, 1.02), this.mats.gateTrim); g.add(trim);
      g.userData = { body, trim }; this.scene.add(g); this.gateMeshes.push(g);
    }
    this.gateMeshes.forEach((g, i) => {
      const it = list[i]; g.visible = !!it; if (!it) return;
      g.position.fromArray(it.p); g.userData.body.scale.set(it.half[0] * 2, it.half[1] * 2, it.half[2] * 2);
      g.userData.trim.scale.set(it.half[0] * 2, 1, it.half[2] * 2); g.userData.trim.position.y = -it.half[1] + 0.08;
      g.userData.trim.material = it.kinematic ? this.mats.gateTrim : this._hotMat();
    });
  }
  // 叠加标注：箭头（力、速度）、射线
  _overlay(list) {
    const mk = () => {
      const g = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, depthTest: false });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10), mat); shaft.position.y = 0.5; g.add(shaft);
      const head = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 14), mat); g.add(head);
      g.renderOrder = 20; shaft.renderOrder = 20; head.renderOrder = 20;
      g.userData = { shaft, head, mat }; this.scene.add(g); return g;
    };
    while (this.arrows.length < list.length) this.arrows.push(mk());
    const up = new THREE.Vector3(0, 1, 0);
    this.arrows.forEach((g, i) => {
      const o = list[i]; g.visible = !!o; if (!o) return;
      const a = new THREE.Vector3().fromArray(o.from), b = new THREE.Vector3().fromArray(o.to), d = b.clone().sub(a), L = d.length();
      if (L < 1e-4) { g.visible = false; return; }
      const w = o.width || 0.035, hl = o.type === 'ray' ? 0 : Math.min(L * 0.35, (o.head || 0.22));
      g.position.copy(a); g.quaternion.setFromUnitVectors(up, d.normalize());
      g.userData.shaft.scale.set(w, L - hl, w); g.userData.shaft.position.y = (L - hl) / 2;
      g.userData.head.visible = hl > 0; g.userData.head.scale.set(w * 3.2, hl, w * 3.2); g.userData.head.position.y = L - hl / 2;
      g.userData.mat.color.set(o.color || '#ffcf73'); g.userData.mat.opacity = o.alpha ?? 1;
    });
  }
  _hotMat() {
    if (!this._hot) this._hot = new THREE.MeshStandardMaterial({ color: '#000', emissive: new THREE.Color('#ffcf73'), emissiveIntensity: 3.2 });
    return this._hot;
  }
  _glueBlob(e) {
    const g = new THREE.Group();
    const mat = e.kind === 'hinge' ? this.mats.glueHinge.clone() : this.mats.glue.clone();
    if (e.kind === 'hinge') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 10, 24), mat); ring.rotation.x = Math.PI / 2; g.add(ring);
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12), mat); g.add(pin);
    } else {
      for (let i = 0; i < 5; i++) {
        const r = 0.06 + hash(e.id * 7 + i) * 0.07;
        const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
        s.position.set((hash(e.id + i * 3) - 0.5) * 0.18, (hash(e.id + i * 5) - 0.5) * 0.18, (hash(e.id + i * 11) - 0.5) * 0.18);
        g.add(s);
      }
    }
    return g;
  }
  _particles(state, time) {
    const pos = this.pts.geometry.attributes.position.array, col = this.pts.geometry.attributes.color.array, size = this.pts.geometry.attributes.size.array;
    let n = 0;
    const put = (x, y, z, r, g, b, s) => { if (n >= this.PN) return; pos[n * 3] = x; pos[n * 3 + 1] = y; pos[n * 3 + 2] = z; col[n * 3] = r; col[n * 3 + 1] = g; col[n * 3 + 2] = b; size[n] = s; n++; };
    state.events.forEach((ev, k) => {
      const age = time - ev.t; if (age < 0 || age > 1.4) return;
      const seed = Math.round(ev.t * 997) + k * 31;
      const cnt = ev.type === 'glue' ? 46 : ev.type === 'break' ? 70 : 30;
      for (let i = 0; i < cnt; i++) {
        const h1 = hash(seed + i * 1.7), h2 = hash(seed + i * 3.1), h3 = hash(seed + i * 5.3);
        const th = h1 * Math.PI * 2, ph = Math.acos(2 * h2 - 1), sp = (ev.type === 'break' ? 4 : 2.4) * (0.4 + h3);
        const vx = Math.sin(ph) * Math.cos(th) * sp, vy = Math.abs(Math.cos(ph)) * sp + 1.2, vz = Math.sin(ph) * Math.sin(th) * sp;
        const g = ev.type === 'break' ? 9.8 : 2.5;
        const life = 1 - age / 1.4;
        const x = ev.pos.x + vx * age, y = ev.pos.y + vy * age - 0.5 * g * age * age, z = ev.pos.z + vz * age;
        if (ev.type === 'glue') put(x, y, z, 0.45 * life + 0.3, 1.0 * life + 0.2, 0.6 * life + 0.15, 0.05 * life + 0.01);
        else if (ev.type === 'break') { if (i % 3) put(x, y, z, 0.55 * life, 0.35 * life, 0.18 * life, 0.07 * life); else put(x, y, z, 1.2 * life, 0.6 * life, 0.25 * life, 0.04 * life); }
        else put(x, y, z, 0.6 * life, 0.9 * life, 0.7 * life, 0.04 * life);
      }
    });
    // 风扇的风、火箭的火星
    for (const p of state.parts) {
      if (!p.power) continue;
      const q = new THREE.Quaternion().fromArray(p.q), o = new THREE.Vector3().fromArray(p.p);
      if (p.type === 'fan') for (let i = 0; i < 26; i++) {
        const ph = (time * 2.2 + hash(p.id * 13 + i)) % 1; const r = 0.12 + hash(i * 7 + p.id) * 0.25, a = hash(i * 3 + p.id) * 6.28 + ph * 3;
        const v = new THREE.Vector3(Math.cos(a) * r * (1 + ph), Math.sin(a) * r * (1 + ph), -0.2 - ph * 2.6).applyQuaternion(q).add(o);
        put(v.x, v.y, v.z, 0.7 * (1 - ph), 0.9 * (1 - ph), 1.0 * (1 - ph), 0.03);
      }
      if (p.type === 'rocket' && p.burn > 0) for (let i = 0; i < 40; i++) {
        const ph = (time * 3 + hash(p.id * 11 + i)) % 1; const a = hash(i * 5) * 6.28, r = 0.05 + ph * 0.45 * hash(i + 3);
        const v = new THREE.Vector3(Math.cos(a) * r, -0.6 - ph * 2.5, Math.sin(a) * r).applyQuaternion(q).add(o);
        put(v.x, v.y, v.z, 1.4 * (1 - ph), 0.7 * (1 - ph * 0.8), 0.2 * (1 - ph), 0.09 * (1 - ph) + 0.02);
      }
    }
    // 火箭尾烟：director 记下的历史位置（普通混合的灰白烟团）
    { const sp = this.smoke.geometry.attributes.position.array, ss = this.smoke.geometry.attributes.size.array, sa = this.smoke.geometry.attributes.alpha.array;
      let m = 0; const trail = state.extra?.trail || [];
      trail.forEach(([x, y, z, age], i) => { for (let k = 0; k < 3 && m < this.SN; k++, m++) {
        const j = i * 3 + k, spread = 0.3 + age * 1.4;
        sp[m * 3] = x + (hash(j * 1.3) - 0.5) * spread; sp[m * 3 + 1] = y + (hash(j * 3.9) - 0.5) * 0.8 - age * 0.3; sp[m * 3 + 2] = z + (hash(j * 2.7) - 0.5) * spread;
        ss[m] = 1.4 + age * 2.2; sa[m] = Math.max(0, 1 - age / 4.5) * 0.55; } });
      for (let i = m; i < this.SN; i++) { ss[i] = 0; sa[i] = 0; }
      this.smoke.geometry.attributes.position.needsUpdate = this.smoke.geometry.attributes.size.needsUpdate = this.smoke.geometry.attributes.alpha.needsUpdate = true; }
    for (let i = n; i < this.PN; i++) size[i] = 0;
    this.pts.geometry.attributes.position.needsUpdate = true; this.pts.geometry.attributes.color.needsUpdate = true; this.pts.geometry.attributes.size.needsUpdate = true;
    this.pts.geometry.setDrawRange(0, Math.max(1, n));
  }
  // 阴影跟着镜头走
  follow(target) { this.sun.position.set(target.x + 28, 40, target.z - 32); this.sun.target.position.copy(target); this.sun.target.updateMatrixWorld(); }
}
