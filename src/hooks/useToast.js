import { useState, useCallback } from 'react';
import { TOAST_DURATION_MS } from '@data';

/**
 * @typedef {{ id: number, message: string, type: 'info'|'success'|'error' }} Toast
 * @returns {{ toasts: Toast[], showToast: Function }}
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), TOAST_DURATION_MS);
  }, []);
  return { toasts, showToast };
}
