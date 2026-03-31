import { useRef, useCallback } from 'react';

const SWIPE_THRESHOLD = 50;

/**
 * Detect horizontal swipe gestures on touch devices.
 * @param {Function} onSwipeLeft
 * @param {Function} onSwipeRight
 */
export function useSwipeGesture(onSwipeLeft, onSwipeRight) {
  const touchStartRef = useRef(null);
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e) => {
    if (touchStartRef.current === null) return;
    const delta = touchStartRef.current - e.changedTouches[0].clientX;
    if (delta > SWIPE_THRESHOLD)       onSwipeLeft?.();
    else if (delta < -SWIPE_THRESHOLD) onSwipeRight?.();
    touchStartRef.current = null;
  }, [onSwipeLeft, onSwipeRight]);
  return { handleTouchStart, handleTouchEnd };
}
