// 零件表：形状、密度、动力。所有尺寸单位为米，质量由 Rapier 按密度×体积算。
// 形状 shape: ['box', hx,hy,hz] | ['cyl', halfHeight, radius] (沿本地 Y 轴) | ['ball', r]
// 动力 device: fan 沿本地 +Z 推；rocket 沿本地 +Y 推一阵；wheel 沿本地 Y 轴转（必须是转动关节）；balloon 持续向上浮力。
export const PARTS = {
  plank:   { label: '木板',   shape: ['box', 1.0, 0.06, 0.25], density: 500,  friction: 0.8 },
  board:   { label: '大木板', shape: ['box', 1.4, 0.07, 0.9],  density: 220,  friction: 0.8 },
  log:     { label: '圆木',   shape: ['cyl', 1.3, 0.24],       density: 600,  friction: 0.8 },
  crate:   { label: '木箱',   shape: ['box', 0.42, 0.42, 0.42], density: 220, friction: 0.7 },
  ice:     { label: '冰块',   shape: ['box', 0.45, 0.45, 0.45], density: 900, friction: 0.15 },
  boulder: { label: '巨石',   shape: ['ball', 0.6],            density: 2400, friction: 0.9 },
  wheel:   { label: '轮子',   shape: ['cyl', 0.13, 0.46],      density: 300,  friction: 1.4, device: 'wheel', power: { speed: 9, torque: 900 } },
  fan:     { label: '风扇',   shape: ['box', 0.36, 0.36, 0.22], density: 150,  friction: 0.6, device: 'fan', power: { thrust: 520 } },
  rocket:  { label: '火箭',   shape: ['cyl', 0.42, 0.17],      density: 700,  friction: 0.6, device: 'rocket', power: { thrust: 5200, burn: 2.2 } },
  balloon: { label: '热气球',   shape: ['ball', 0.62],           density: 40,   friction: 0.4, device: 'balloon', power: { lift: 930 } },
};

export const PART_LIMIT = 21; // 一次能粘在一起的零件上限（见 research.md：游戏内实测的社区数字，视频里注明）

export function halfExtents(type) {
  const s = PARTS[type].shape;
  if (s[0] === 'box') return [s[1], s[2], s[3]];
  if (s[0] === 'cyl') return [s[2], s[1], s[2]];
  return [s[1], s[1], s[1]];
}
export const radiusOf = type => Math.hypot(...halfExtents(type));
