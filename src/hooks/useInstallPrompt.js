import { useEffect, useState, useCallback } from 'react';

/**
 * PWA install prompt hook.
 *
 * Tracks the browser's `beforeinstallprompt` event so we can offer a custom
 * "Install" UI inside the app. Returns a deterministic state machine the UI
 * can switch on:
 *
 *   { isInstalled, canPrompt, isIOS, isStandalone, promptInstall, dismiss }
 *
 *   - isInstalled:  the app is already running as a PWA (standalone display).
 *   - canPrompt:    Chrome/Edge has fired beforeinstallprompt; we have a prompt.
 *   - isIOS:        user is on iOS Safari; show the manual instructions instead.
 *   - isStandalone: display-mode is standalone (covers iOS too).
 *   - promptInstall: call to show the native install dialog (Chrome/Edge).
 *   - dismiss:      hide our UI for this session (does not block re-prompting later).
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari exposes navigator.standalone on the home-screen launcher
      window.navigator.standalone === true);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const onBeforeInstall = (e) => {
      // Prevent Chrome's mini-infobar so we can prompt on our own button
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [isStandalone]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return { outcome: 'unavailable' };
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice; // { outcome: 'accepted' | 'dismissed' }
    // One-shot: a deferred prompt cannot be reused
    setDeferredPrompt(null);
    return choice;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => setDismissed(true), []);

  return {
    isInstalled,
    isStandalone,
    isIOS,
    canPrompt: !!deferredPrompt && !dismissed,
    showIOSInstructions: isIOS && !isStandalone && !dismissed,
    promptInstall,
    dismiss,
  };
}
