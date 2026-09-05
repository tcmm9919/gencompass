import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: fromRoot('./pages-client'),
  base: process.env.PAGES_BASE_PATH || '/gencompass/',
  publicDir: fromRoot('./public'),
  resolve: { alias: { '@': fromRoot('./') } },
  define: { __GENCOMPASS_STATIC__: 'true' },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  build: { outDir: fromRoot('./dist-pages'), emptyOutDir: true },
});
