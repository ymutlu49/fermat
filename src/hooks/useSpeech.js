import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Kurdish Kurmanji phonetic conversion for Turkish TTS engine.
 *
 * Strategy: Replace only non-Turkish characters with their closest
 * Turkish equivalents. Keep everything else as-is for natural reading.
 */
function kurdishToPhonetic(text) {
  let s = text;

  // ê → e (Turkish TTS reads 'e' naturally)
  s = s.replace(/[Êê]/g, 'e');

  // î → i
  s = s.replace(/Î/g, 'İ');
  s = s.replace(/î/g, 'i');

  // û → u
  s = s.replace(/[Ûû]/g, 'u');

  // x → h (velar fricative → closest Turkish sound)
  s = s.replace(/[Xx]/g, 'h');

  // w → v (labial approximant → nearest Turkish)
  s = s.replace(/[Ww]/g, 'v');

  // q → k (uvular stop → hard k)
  s = s.replace(/[Qq]/g, 'k');

  return s;
}

/**
 * Text-to-Speech hook for Kurdish Kurmanji using Web Speech API.
 * Uses Turkish (tr-TR) voice with minimal phonetic conversion.
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    setIsSupported(true);

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return;

      // Find Turkish voices, prefer online/neural
      const turkishVoices = voices.filter(v => v.lang === 'tr-TR' || v.lang.startsWith('tr'));
      const ranked = turkishVoices.sort((a, b) => {
        const scoreA = (!a.localService ? 2 : 0) + (a.name.includes('Online') ? 1 : 0);
        const scoreB = (!b.localService ? 2 : 0) + (b.name.includes('Online') ? 1 : 0);
        return scoreB - scoreA;
      });

      if (ranked.length) voiceRef.current = ranked[0];
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback((text, { slow = false } = {}) => {
    if (!isSupported || !text) return;
    speechSynthesis.cancel();

    const phonetic = kurdishToPhonetic(text);
    const rate = slow ? 0.75 : 0.9;

    const utterance = new SpeechSynthesisUtterance(phonetic);
    utterance.lang = 'tr-TR';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}
