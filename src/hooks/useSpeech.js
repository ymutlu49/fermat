import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Kurdish Kurmanji number words
 */
const KURDISH_NUMBERS = {
  '0': 'sifir',
  '1': 'yek',
  '2': 'du',
  '3': 'sê',
  '4': 'çar',
  '5': 'pênc',
  '6': 'şeş',
  '7': 'heft',
  '8': 'heşt',
  '9': 'neh',
  '10': 'deh',
  '11': 'yanzdeh',
  '12': 'diwanzdeh',
  '13': 'sêzdeh',
  '14': 'çardeh',
  '15': 'panzdeh',
  '16': 'şanzdeh',
  '17': 'hivdeh',
  '18': 'hijdeh',
  '19': 'nozdeh',
  '20': 'bîst',
  '30': 'sîh',
  '40': 'çil',
  '50': 'pêncî',
  '60': 'şêst',
  '70': 'heftê',
  '80': 'heştê',
  '90': 'nod',
  '100': 'sed',
  '1000': 'hezar',
};

/**
 * Convert a number string to Kurdish words
 */
function numberToKurdish(numStr) {
  const n = parseInt(numStr, 10);
  if (isNaN(n)) return numStr;

  // Direct lookup
  if (KURDISH_NUMBERS[numStr]) return KURDISH_NUMBERS[numStr];
  if (KURDISH_NUMBERS[String(n)]) return KURDISH_NUMBERS[String(n)];

  // For numbers 21-99
  if (n > 20 && n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const ones = n % 10;
    const tensWord = KURDISH_NUMBERS[String(tens)] || '';
    if (ones === 0) return tensWord;
    const onesWord = KURDISH_NUMBERS[String(ones)] || String(ones);
    return `${tensWord} û ${onesWord}`;
  }

  // For 100+, just read digits individually in Kurdish
  if (n >= 100) {
    return numStr.split('').map(d => KURDISH_NUMBERS[d] || d).join(' ');
  }

  return numStr;
}

/**
 * Replace all standalone numbers in text with Kurdish words
 */
function replaceNumbersWithKurdish(text) {
  return text.replace(/\b\d+\b/g, (match) => numberToKurdish(match));
}

/**
 * Kurdish Kurmanji phonetic conversion for Turkish TTS engine.
 *
 * Converts non-Turkish characters and numbers to Kurdish-readable form.
 */
function kurdishToPhonetic(text) {
  // First replace numbers with Kurdish words
  let s = replaceNumbersWithKurdish(text);

  // ê → "é" sound — use 'e' (Turkish TTS reads naturally)
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
 * Uses Turkish (tr-TR) voice with phonetic conversion and Kurdish numbers.
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
