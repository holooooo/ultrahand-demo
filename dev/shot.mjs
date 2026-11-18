// usage: node dev/shot.mjs page.html out.jpg [js-to-eval-after-ready] [waitMs]
import { launch } from '../tools/cdp.mjs';
import { serve } from '../tools/serve.mjs';
import { writeFileSync } from 'node:fs';
const [page, out, js, wait] = process.argv.slice(2);
const srv = await serve(process.cwd());
const b = await launch({ width: 1600, height: 900 });
try {
  const p = await b.open(`http://127.0.0.1:${srv.port}/${page}`);
  if (js) console.log('eval ->', JSON.stringify(await p.evaluate(js)).slice(0, 1500));
  await new Promise(r => setTimeout(r, +(wait || 1500)));
  writeFileSync(out, await p.screenshot(88));
  console.log(p.logs.join('\n').slice(0, 3000));
} finally { b.kill(); srv.close(); }
