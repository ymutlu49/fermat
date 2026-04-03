import { useState, useCallback, useRef } from 'react';

const API_URL = 'https://kurdish-tts-proxy.y-mutlu.workers.dev';
const SPEAKER_ID = 'kurmanji_72'; // Female Kurmanji voice

// Cache for audio blobs to avoid re-fetching
const audioCache = new Map();

// Kurdish number words
const ONES = ['sifir', 'yek', 'du', 'sê', 'çar', 'pênc', 'şeş', 'heft', 'heşt', 'neh'];
const TEENS = ['deh', 'yanzdeh', 'dwanzdeh', 'sêzdeh', 'çardeh', 'panzdeh', 'şanzdeh', 'hivdeh', 'hijdeh', 'nozdeh'];
const TENS = ['', 'deh', 'bîst', 'sî', 'çil', 'pêncî', 'şêst', 'heftê', 'heştê', 'nod'];
const LARGE = [
  [1_000_000_000, 'milyar'],
  [1_000_000, 'milyon'],
  [1_000, 'hezar'],
  [100, 'sed'],
];

function numberToKurdish(n) {
  if (n < 0) return 'negatîf ' + numberToKurdish(-n);
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? TENS[t] : TENS[t] + ' û ' + ONES[o];
  }
  for (const [val, name] of LARGE) {
    if (n >= val) {
      const q = Math.floor(n / val);
      const r = n % val;
      const prefix = (q === 1 && val >= 100) ? '' : numberToKurdish(q) + ' ';
      return prefix + name + (r > 0 ? ' û ' + numberToKurdish(r) : '');
    }
  }
  return String(n);
}

/**
 * Replace digit sequences in text with Kurdish words
 */
function convertNumbersToKurdish(text) {
  return text.replace(/-?\d+([.,]\d+)?/g, (match) => {
    // Handle decimal numbers (e.g. 3,14 or 3.14)
    const decSep = match.includes(',') ? ',' : match.includes('.') ? '.' : null;
    if (decSep) {
      const [intPart, decPart] = match.split(decSep);
      const intWord = numberToKurdish(Math.abs(parseInt(intPart, 10)));
      const prefix = intPart.startsWith('-') ? 'negatîf ' : '';
      // Read decimal digits one by one
      const decWords = decPart.split('').map(d => ONES[parseInt(d, 10)]).join(' ');
      return prefix + intWord + ' niqte ' + decWords;
    }
    return numberToKurdish(parseInt(match, 10));
  });
}

/**
 * Fetch Kurdish TTS audio from KurdishTTS.com API
 */
async function fetchKurdishAudio(text) {
  // Convert numbers to Kurdish words before sending to TTS
  const kurdishText = convertNumbersToKurdish(text);

  // Check cache first
  const cacheKey = kurdishText.trim().toLowerCase();
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: kurdishText,
      speaker_id: SPEAKER_ID,
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  // Cache the result
  audioCache.set(cacheKey, url);

  return url;
}

/**
 * Text-to-Speech hook for Kurdish Kurmanji.
 * Uses KurdishTTS.com API for native Kurmanji pronunciation.
 * Falls back to browser TTS if API fails.
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const speak = useCallback(async (text, { slow = false } = {}) => {
    if (!text) return;

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    setIsSpeaking(true);

    try {
      // Try Kurdish TTS API
      const audioUrl = await fetchKurdishAudio(text);
      const audio = new Audio(audioUrl);
      audio.playbackRate = slow ? 0.75 : 1.0;
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.warn('Kurdish TTS API failed, falling back to browser TTS:', err);
      // Fallback to browser TTS with Turkish voice
      fallbackSpeak(text, slow);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported: true };
}

/**
 * Fallback: Browser TTS with Turkish voice
 */
function fallbackSpeak(text, slow) {
  if (!window.speechSynthesis) return;

  let s = convertNumbersToKurdish(text);
  s = s.replace(/[Êê]/g, 'e');
  s = s.replace(/Î/g, 'İ');
  s = s.replace(/î/g, 'i');
  s = s.replace(/[Ûû]/g, 'u');
  s = s.replace(/[Xx]/g, 'h');
  s = s.replace(/[Ww]/g, 'v');
  s = s.replace(/[Qq]/g, 'k');

  const utterance = new SpeechSynthesisUtterance(s);
  utterance.lang = 'tr-TR';
  utterance.rate = slow ? 0.7 : 0.85;
  utterance.pitch = 1.0;

  const voices = speechSynthesis.getVoices();
  const turkishVoice = voices.find(v => v.lang === 'tr-TR' || v.lang.startsWith('tr'));
  if (turkishVoice) utterance.voice = turkishVoice;

  speechSynthesis.speak(utterance);
}
