import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

// Cloudflare Pages SPA fallback: any unmatched path serves /index.html so
// hash-based routing (useHashRouter) can take over on the client.
function cloudflarePagesPlugin() {
  return {
    name: 'cloudflare-pages',
    closeBundle() {
      writeFileSync(
        resolve(__dirname, 'dist', '_redirects'),
        '/*    /index.html    200\n'
      );
    },
  };
}

export default defineConfig({
  base: '/',
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
    outDir: 'dist',
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
