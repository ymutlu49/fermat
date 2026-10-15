import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, readFileSync, existsSync, statSync } from 'fs';

// Two pages are built:
//   /       → the FerMat website (index.html + site/)
//   /app/   → the app itself (app/index.html + src/), installed from the site
//
// Cloudflare Pages: /app/* falls back to the app shell so hash routes and
// deep links keep working; the APK is served as a download.
function cloudflarePagesPlugin() {
  return {
    name: 'cloudflare-pages',
    closeBundle() {
      writeFileSync(
        resolve(__dirname, 'dist', '_redirects'),
        '/app    /app/    301\n/app/*    /app/index.html    200\n'
      );
      writeFileSync(
        resolve(__dirname, 'dist', '_headers'),
        '/sw.js\n'
        + '  Cache-Control: no-cache\n'
        + '/dl/*.apk\n'
        + '  Content-Type: application/vnd.android.package-archive\n'
        + '  Content-Disposition: attachment\n'
        + '  Cache-Control: no-cache\n'
      );
    },
  };
}

// Numbers on the website come from the data itself, so they never go stale.
function siteFactsPlugin() {
  const read = file => readFileSync(resolve(__dirname, file), 'utf8');
  const facts = () => {
    const concepts = read('src/data/concepts.js');
    const sectionIds = new Set([...concepts.matchAll(/"s": (\d+)/g)].map(m => m[1]));
    const apk = resolve(__dirname, 'public/dl/fermat.apk');
    const apkMb = existsSync(apk) ? (statSync(apk).size / 1048576).toFixed(1).replace('.', ',') : '–';
    return {
      FERMAT_CONCEPTS: (concepts.match(/"ku":/g) || []).length,
      FERMAT_SECTIONS: sectionIds.size,
      FERMAT_EXERCISES: (read('src/data/exercises.js').match(/\bid: '/g) || []).length,
      FERMAT_VERSION: JSON.parse(read('package.json')).version,
      FERMAT_APK_MB: apkMb,
      FERMAT_YEAR: new Date().getFullYear(),
    };
  };
  return {
    name: 'site-facts',
    transformIndexHtml(html) {
      const values = facts();
      return html.replace(/%(FERMAT_[A-Z_]+)%/g, (whole, key) => (key in values ? String(values[key]) : whole));
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), cloudflarePagesPlugin(), siteFactsPlugin()],
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
      input: {
        site: resolve(__dirname, 'index.html'),
        app:  resolve(__dirname, 'app/index.html'),
      },
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
