import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  base: './',
  build: { outDir: '../docs', emptyOutDir: true },
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
});
