import { useRef, useCallback, useMemo, useEffect } from 'react';
import { usePersistedState } from './usePersistedState.js';

/**
 * Web Audio API sound effects manager.
 * Cleans up AudioContext on unmount to prevent memory leaks.
 * @returns {{ sounds: Object, isSoundEnabled: boolean, toggleSound: Function }}
 */
export function useSoundManager() {
  const [isSoundEnabled, setIsSoundEnabled] = usePersistedState('ferhenga_sound', true);
  const audioContextRef = useRef(null);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      try { audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    // Resume suspended context (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequencies, type, duration, gain) => {
    if (!isSoundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqArray = Array.isArray(frequencies) ? frequencies : [frequencies];
    freqArray.forEach((freq, index) => {
      try {
        const osc      = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type            = type;
        const t0 = ctx.currentTime + index * (duration / freqArray.length);
        gainNode.gain.setValueAtTime(gain, t0);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
        osc.start(t0);
        osc.stop(t0 + duration);
      } catch { /* AudioContext unavailable */ }
    });
  }, [isSoundEnabled, getAudioContext]);

  const sounds = useMemo(() => ({
    correct:  () => playTone(880,                   'sine',     0.15, 0.3),
    wrong:    () => playTone(220,                   'square',   0.2,  0.2),
    flip:     () => playTone(1200,                  'sine',     0.05, 0.15),
    match:    () => playTone([523, 659, 784],        'sine',     0.3,  0.25),
    complete: () => playTone([523, 659, 784, 1047],  'sine',     0.5,  0.3),
    hint:     () => playTone(660,                   'triangle', 0.1,  0.15),
    click:    () => playTone(1000,                  'sine',     0.03, 0.1),
    levelUp:  () => playTone([440, 554, 659, 880],   'sine',     0.6,  0.3),
  }), [playTone]);

  const toggleSound = useCallback(() => setIsSoundEnabled(prev => !prev), [setIsSoundEnabled]);
  return { sounds, isSoundEnabled, toggleSound };
}
