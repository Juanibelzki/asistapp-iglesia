import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const distDir = join(root, '..', 'dist');
const outPublic = join(root, '..', '.output', 'public');

const swPath = join(distDir, 'sw.js');
if (!existsSync(swPath)) {
  console.warn('[copy-pwa] No existe dist/sw.js, nada que copiar.');
  process.exit(0);
}

const swContent = readFileSync(swPath, 'utf8');
const ref = swContent.match(/workbox-([a-f0-9]+)/i);
const referenced = ref ? `workbox-${ref[1]}.js` : null;

const wanted = new Set(['sw.js']);
if (referenced) wanted.add(referenced);

for (const dir of [distDir, outPublic]) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if ((file === 'sw.js' || file.startsWith('workbox-')) && !wanted.has(file)) {
      rmSync(join(dir, file), { force: true });
      console.log(`[copy-pwa] Limpiando ${file}`);
    }
  }
}

let copied = 0;
for (const file of wanted) {
  const src = join(distDir, file);
  if (!existsSync(src)) continue;
  const dest = join(outPublic, file);
  mkdirSync(outPublic, { recursive: true });
  copyFileSync(src, dest);
  copied += 1;
  console.log(`[copy-pwa] ${file} -> .output/public/`);
}

if (copied === 0) {
  console.warn('[copy-pwa] No se pudieron copiar los archivos del service worker.');
}