// ─── FerMat — website behaviour ─────────────────────────────────
// 1. Put the visitor's own platform first in the download section.
// 2. Offer the browser's install prompt on desktop when it is available.
// 3. Register the service worker so the site and app work offline and the
//    app is installable from this page.

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  // iPadOS reports itself as a Mac; touch support tells them apart.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'desktop';
}

const card = document.querySelector(`.download[data-platform="${detectPlatform()}"]`);
if (card) card.classList.add('is-yours');

const installButton = document.querySelector('[data-install]');
const installFallback = document.querySelector('[data-install-fallback]');
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  if (installButton && installFallback) {
    installButton.hidden = false;
    installFallback.hidden = true;
  }
});

installButton?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installButton.hidden = true;
  installFallback.hidden = false;
  if (outcome === 'accepted') window.location.href = '/app/';
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  });
}
