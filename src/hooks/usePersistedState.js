import { useState, useCallback } from 'react';

/**
 * useState that automatically persists to localStorage.
 * @template T
 * @param {string} storageKey
 * @param {T} defaultValue
 * @returns {[T, Function]}
 */
export function usePersistedState(storageKey, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistedState = useCallback((valueOrUpdater) => {
    setState(prev => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* quota exceeded — silent */ }
      return next;
    });
  }, [storageKey]);

  return [state, setPersistedState];
}
