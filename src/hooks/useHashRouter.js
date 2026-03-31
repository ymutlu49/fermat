import { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight hash-based router for SPA navigation.
 * Supports browser back/forward, deep linking via #/view URLs.
 *
 * @param {string} defaultView - fallback view when no hash present
 * @returns {{ view: string, setView: (v: string) => void }}
 */
export function useHashRouter(defaultView = 'splash') {
  const getViewFromHash = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    return hash || defaultView;
  };

  const [view, setViewState] = useState(getViewFromHash);

  // Listen for browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      setViewState(getViewFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Navigate by updating hash (pushes history entry)
  const setView = useCallback((newView) => {
    if (newView === 'splash') {
      // splash is transient, don't push to history
      window.history.replaceState(null, '', '#/splash');
    } else {
      window.location.hash = '#/' + newView;
    }
    setViewState(newView);
  }, []);

  return { view, setView };
}
