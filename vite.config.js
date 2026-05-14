import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';

// Cloudflare Pages plugin:
//   1. Wipes the entire `dist/` parent on build start (Vite's `emptyOutDir`
//      only clears `dist/fermat`, not legacy files at dist root).
//   2. Emits `dist/_redirects` so deep links under /fermat/ fall back to
//      /fermat/index.html — must live at the Pages "Build output directory"
//      root, which is dist/, NOT dist/fermat/.
function cloudflarePagesPlugin() {
  return {
    name: 'cloudflare-pages',
    buildStart() {
      const distDir = resolve(__dirname, 'dist');
      if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });
    },
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      mkdirSync(outDir, { recursive: true });
      writeFileSync(
        resolve(outDir, '_redirects'),
        '/fermat/*    /fermat/index.html    200\n'
      );
    },
  };
}

export default defineConfig({
  base: '/fermat/',
  plugins: [react(), cloudflarePagesPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views':      resolve(__dirname, 'src/views'),
      '@hooks':      resolve(__dirname, 'src/hooks'),
      '@utils':      resolve(__dirname, 'src/utils'),
      '@data':       resolve(__dirname, 'src/data'),
    },
  },
  build: {
    // outDir mirrors the base URL so Cloudflare Pages can serve files at the
    // same path the bundled HTML/JS references them at (e.g. /fermat/assets/...).
    // Pages "Build output directory" should be set to `dist` so it serves
    // dist/fermat/* under https://<project>.pages.dev/fermat/*.
    outDir: 'dist/fermat',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react:     ['react', 'react-dom'],
          data:      ['./src/data/concepts.js'],
          visuals:   ['./src/components/visuals/index.jsx'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
