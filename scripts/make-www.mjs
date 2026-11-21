// يجهّز فولدر www للأبلكيشن من ملفات الموقع نفسها، ويضيف جسر الموبايل (native.js)
import fs from 'node:fs';
import { build } from 'esbuild';

const OUT = 'www';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const f of fs.readdirSync('.')) {
  if (/\.(png|webmanifest)$/.test(f)) fs.copyFileSync(f, `${OUT}/${f}`);
}

let html = fs.readFileSync('index.html', 'utf8');
// native.js لازم يتحمّل قبل الصفحة عشان isNative() تكون جاهزة وقت التشغيل:
// عليها متوقّف تسجيل الـ service worker وطريقة الدخول بجوجل.
html = html.replace('</head>', '<script src="native.js"></script>\n</head>');
fs.writeFileSync(`${OUT}/index.html`, html);

await build({
  entryPoints: ['native/entry.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: `${OUT}/native.js`,
  external: ['firebase', 'firebase/*'],
  legalComments: 'none',
  logLevel: 'warning',
});

if (!fs.existsSync(`${OUT}/native.js`)) {
  console.error('native.js was not produced');
  process.exit(1);
}
if (!fs.readFileSync(`${OUT}/index.html`, 'utf8').includes('native.js')) {
  console.error('index.html does not load native.js — the </head> anchor moved');
  process.exit(1);
}
console.log('www ready');
