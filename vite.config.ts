import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: { main: 'index.html', r3f: 'r3f.html' } } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
