import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Kurdish Kurmanji phonetic conversion for Turkish TTS engine.
 *
 * Kurmanji uses Latin script with these special characters:
 *   ê (open e), î (long i), û (long u), ç, ş — shared with Turkish
 *   x (velar fricative), w (labial approximant), q (uvular stop) — not in Turkish
 *
 * Strategy: minimal intervention — only convert sounds Turkish TTS can't produce.
 * Keep ê/î/û as-is because Turkish TTS reads them as e/i/u which is close enough
 * and sounds more natural than artificial doubling.
 */
function kurdishToPhonetic(text) {
  let s = text;

  // x → 'hh' with slight friction — doubled h gives a heavier sound closer to Kurdish x
  s = s.replace(/X/g, 'HH');
  s = s.replace(/x/g, 'hh');

  // w → Turkish doesn't have /w/, use 'v' which is the nearest
  s = s.replace(/W/g, 'V');
  s = s.replace(/w/g, 'v');

  // q → uvular stop, approximate with hard 'k'
  s = s.replace(/Q/g, 'K');
  s = s.replace(/q/g, 'k');

  // ê → open e, use 'ee' for slightly longer sound
  s = s.replace(/Ê/g, 'EE');
  s = s.replace(/ê/g, 'ee');

  // î → long i, use 'ii' for elongation
  s = s.replace(/Î/g, 'İİ');
  s = s.replace(/î/g, 'ii');

  // û → long u
  s = s.replace(/Û/g, 'UU');
  s = s.replace(/û/g, 'uu');

  // Add micro-pauses between compound words (hyphenated)
  s = s.replace(/-/g, ', ');

  return s;
}

/**
 * Detect if text is a short term (1-3 words) vs a full sentence.
 * Short terms get slower, more emphatic reading.
 */
function getTextProfile(text, slow = false) {
  const wordCount = text.trim().split(/\s+/).length;
  const slowFactor = slow ? 0.8 : 1;
  if (wordCount <= 2) return { rate: 0.85 * slowFactor, pitch: 1.0 };     // single term — clear but natural
  if (wordCount <= 5) return { rate: 0.88 * slowFactor, pitch: 0.98 };    // short phrase
  return { rate: 0.92 * slowFactor, pitch: 0.96 };                         // full sentence
}

/**
 * Text-to-Speech hook for Kurdish Kurmanji using Web Speech API.
 * Uses Turkish (tr-TR) voice with phonetic conversion.
 * Selects the most natural-sounding voice available.
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

      // Rank Turkish voices by quality (prefer online/neural voices)
      const turkishVoices = voices.filter(v => v.lang === 'tr-TR' || v.lang.startsWith('tr'));

      // Priority: online neural > online > local
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
    const { rate, pitch } = getTextProfile(text, slow);

    const utterance = new SpeechSynthesisUtterance(phonetic);
    utterance.lang = 'tr-TR';
    utterance.rate = rate;
    utterance.pitch = pitch;
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
