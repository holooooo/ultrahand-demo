// 打包网页版：源码不公开，网站只放压缩后的单文件 bundle。
// 用法：node tools/build.mjs [outDir=dist/05-ultrahand]
import { build } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'dist/05-ultrahand'));
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
await build({
  entryPoints: [path.join(ROOT, 'app.js')], bundle: true, minify: true, format: 'esm', target: 'es2022',
  outfile: path.join(OUT, 'app.min.js'), legalComments: 'eof',
  alias: { three: path.join(ROOT, 'node_modules/three/build/three.module.js') },
  plugins: [{ name: 'addons', setup(b) { b.onResolve({ filter: /^three\/addons\// }, a => ({ path: path.join(ROOT, 'node_modules/three/examples/jsm', a.path.slice('three/addons/'.length)) })); } }],
});
let html = readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replace(/<script type="importmap">.*?<\/script>\n?/s, '')
  .replace('<script type="module" src="app.js"></script>', '<script type="module" src="app.min.js"></script>');
writeFileSync(path.join(OUT, 'index.html'), html);
for (const f of ['site.css', 'site5.css', 'method.html', 'brand/avatar.png', 'media/site.jpg', 'media/poster.jpg'])
  if (existsSync(path.join(ROOT, f))) { mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true }); cpSync(path.join(ROOT, f), path.join(OUT, f)); }
console.log('built', OUT);
