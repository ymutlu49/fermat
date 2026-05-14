import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// ── Register Service Worker for offline support ─────────────────────────────
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = import.meta.env.BASE_URL + 'sw.js';
    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .catch(() => {});
  });
}
