import { useRef, useState, useCallback, useEffect } from 'react';
import { usePersistedState } from './usePersistedState.js';

/**
 * Background music hook — generates a gentle Kurdish-inspired pentatonic melody
 * using Web Audio API. No external audio files needed.
 *
 * Uses a pentatonic scale common in Kurdish folk music (similar to makam).
 * Soft sine/triangle waves simulate a calm tembur/ney ambiance.
 */
export function useBackgroundMusic() {
  const [isMusicOn, setIsMusicOn] = usePersistedState('ferhenga_music', false);
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const intervalRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Kurdish-inspired pentatonic scale (D minor pentatonic — common in Kurdish music)
  // D4, F4, G4, A4, C5, D5, F5
  const NOTES = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46];
  const BASS = [146.83, 174.61, 196.00]; // D3, F3, G3

  const playNote = useCallback((ctx, freq, startTime, duration, type = 'sine', vol = 0.06) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(gainRef.current || ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      // Gentle envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.15);
      gain.gain.setValueAtTime(vol, startTime + duration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch { /* Audio context unavailable */ }
  }, []);

  const generatePhrase = useCallback((ctx, startTime) => {
    // Random melodic phrase: 4-6 notes
    const noteCount = 4 + Math.floor(Math.random() * 3);
    let t = startTime;
    let prevIdx = Math.floor(Math.random() * NOTES.length);

    for (let i = 0; i < noteCount; i++) {
      // Step-wise motion (more musical than random jumps)
      const step = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
      prevIdx = Math.max(0, Math.min(NOTES.length - 1, prevIdx + step));
      const duration = 0.8 + Math.random() * 1.2;
      playNote(ctx, NOTES[prevIdx], t, duration, 'sine', 0.04 + Math.random() * 0.02);
      t += duration * 0.7; // slight overlap for legato feel
    }

    // Soft bass drone
    const bassNote = BASS[Math.floor(Math.random() * BASS.length)];
    playNote(ctx, bassNote, startTime, t - startTime + 1, 'triangle', 0.025);

    return t - startTime + 1.5; // phrase duration + pause
  }, [playNote]);

  const startMusic = useCallback(() => {
    if (isPlayingRef.current) return;

    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Master gain for volume control
      gainRef.current = ctx.createGain();
      gainRef.current.gain.value = 0.7;
      gainRef.current.connect(ctx.destination);

      isPlayingRef.current = true;

      // Schedule phrases with natural pauses
      const scheduleNext = () => {
        if (!isPlayingRef.current) return;
        const phraseDuration = generatePhrase(ctx, ctx.currentTime + 0.1);
        const pause = 2 + Math.random() * 3; // 2-5 seconds between phrases
        intervalRef.current = setTimeout(scheduleNext, (phraseDuration + pause) * 1000);
      };
      scheduleNext();
    } catch { /* Audio not supported */ }
  }, [generatePhrase]);

  const stopMusic = useCallback(() => {
    isPlayingRef.current = false;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    // Fade out
    if (gainRef.current) {
      try {
        const ctx = ctxRef.current;
        if (ctx && ctx.state !== 'closed') {
          gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        }
      } catch { /* ignore */ }
    }
  }, []);

  const toggleMusic = useCallback(() => {
    setIsMusicOn(prev => {
      const next = !prev;
      if (next) startMusic();
      else stopMusic();
      return next;
    });
  }, [startMusic, stopMusic, setIsMusicOn]);

  // Auto-start if was on
  useEffect(() => {
    if (isMusicOn && !isPlayingRef.current) {
      // Delay to ensure user interaction has happened (autoplay policy)
      const handler = () => {
        startMusic();
        window.removeEventListener('click', handler);
        window.removeEventListener('touchstart', handler);
      };
      window.addEventListener('click', handler, { once: true });
      window.addEventListener('touchstart', handler, { once: true });
    }
    return () => stopMusic();
  }, []);

  return { isMusicOn, toggleMusic };
}
