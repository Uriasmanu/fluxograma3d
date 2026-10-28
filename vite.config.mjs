import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const INCLUDE = /^[ \t]*\/\* @include (\S+) \*\/[ \t]*\r?\n/gm;

/** Replaces each `@include path` marker line in index.html with that file's text, recursively. */
function htmlInclude() {
  const root = process.cwd();
  const appDir = resolve(root, 'app');
  const expand = (text, depth = 0) => {
    if (depth > 8) throw new Error('@include nested too deep');
    return text.replace(INCLUDE, (_marker, file) => expand(readFileSync(resolve(root, file), 'utf8'), depth + 1));
  };
  return {
    name: 'html-include',
    transformIndexHtml: { order: 'pre', handler: (html) => expand(html) },
    configureServer(server) {
      server.watcher.add(appDir);
      server.watcher.on('change', (file) => {
        if (resolve(file).startsWith(appDir)) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig({
  plugins: [htmlInclude(), react()],
  build: { rollupOptions: { input: { main: 'index.html', r3f: 'r3f.html' } } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
