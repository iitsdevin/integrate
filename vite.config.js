import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// After the build, write the list of built files into the service worker so it can
// cache all of them on install (offline from the first visit). Fonts for scripts the
// app does not use, and the older .woff copies, are left to be fetched on demand.
function precache() {
  let outDir = 'dist';
  const files = [];
  return {
    name: 'integrate-precache',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir; },
    generateBundle(_, bundle) {
      for (const name of Object.keys(bundle)) {
        if (/\.woff$/.test(name) || /(cyrillic|vietnamese|latin-ext)/.test(name) || /\.map$/.test(name)) continue;
        files.push('./' + name);
      }
    },
    closeBundle() {
      const sw = resolve(outDir, 'sw.js');
      const list = [...new Set(files)].sort();
      const version = createHash('sha256').update(list.join('|')).digest('hex').slice(0, 10);
      const src = readFileSync(sw, 'utf8')
        .replace('/*__PRECACHE__*/[]', JSON.stringify(list))
        .replace("/*__VERSION__*/'dev'", JSON.stringify(version));
      writeFileSync(sw, src);
    },
  };
}

export default defineConfig({
  plugins: [react(), precache()],
  base: process.env.BASE || '/integrate/',
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
  test: { environment: 'node', include: ['tests/**/*.test.js'] },
});
