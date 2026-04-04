import { useState, useCallback, useRef } from 'react';

const HF_API = 'https://amedcj-kmr-tts.hf.space/gradio_api';

// Cache for audio blobs
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

function convertNumbersToKurdish(text) {
  return text.replace(/-?\d+([.,]\d+)?/g, (match) => {
    const decSep = match.includes(',') ? ',' : match.includes('.') ? '.' : null;
    if (decSep) {
      const [intPart, decPart] = match.split(decSep);
      const intWord = numberToKurdish(Math.abs(parseInt(intPart, 10)));
      const prefix = intPart.startsWith('-') ? 'negatîf ' : '';
      const decWords = decPart.split('').map(d => ONES[parseInt(d, 10)]).join(' ');
      return prefix + intWord + ' niqte ' + decWords;
    }
    return numberToKurdish(parseInt(match, 10));
  });
}

/**
 * Fetch Kurdish TTS audio from HuggingFace Gradio API (amedcj/kmr_tts)
 */
async function fetchKurdishAudio(text) {
  const kurdishText = convertNumbersToKurdish(text);
  const cacheKey = kurdishText.trim().toLowerCase();
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey);

  // Step 1: Submit the request
  const callRes = await fetch(HF_API + '/call/text_to_speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [kurdishText] }),
  });
  if (!callRes.ok) throw new Error('TTS call failed: ' + callRes.status);
  const { event_id } = await callRes.json();

  // Step 2: Get the result (SSE stream)
  const resultRes = await fetch(HF_API + '/call/text_to_speech/' + event_id);
  if (!resultRes.ok) throw new Error('TTS result failed: ' + resultRes.status);
  const sseText = await resultRes.text();

  // Parse SSE: find the "data:" line with the JSON payload
  const dataMatch = sseText.match(/^data:\s*(.+)$/m);
  if (!dataMatch) throw new Error('No data in TTS response');
  const payload = JSON.parse(dataMatch[1]);
  const audioUrl = payload[0]?.url;
  if (!audioUrl) throw new Error('No audio URL in TTS response');

  // Step 3: Fetch the audio file
  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) throw new Error('Audio fetch failed: ' + audioRes.status);
  const blob = await audioRes.blob();
  const blobUrl = URL.createObjectURL(blob);

  audioCache.set(cacheKey, blobUrl);
  return blobUrl;
}

/**
 * Text-to-Speech hook for Kurdish Kurmanji.
 * Uses HuggingFace amedcj/kmr_tts for native Kurmanji pronunciation.
 * Falls back to browser TTS if API fails.
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const speak = useCallback(async (text, { slow = false } = {}) => {
    if (!text) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(true);

    try {
      const audioUrl = await fetchKurdishAudio(text);
      const audio = new Audio(audioUrl);
      audio.playbackRate = slow ? 0.75 : 1.0;
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); audioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); audioRef.current = null; };
      await audio.play();
    } catch (err) {
      console.warn('Kurdish TTS API failed, falling back to browser TTS:', err);
      fallbackSpeak(text, slow);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported: true };
}

function fallbackSpeak(text, slow) {
  if (!window.speechSynthesis) return;
  let s = convertNumbersToKurdish(text);
  s = s.replace(/[Êê]/g, 'e').replace(/Î/g, 'İ').replace(/î/g, 'i');
  s = s.replace(/[Ûû]/g, 'u').replace(/[Xx]/g, 'h');
  s = s.replace(/[Ww]/g, 'v').replace(/[Qq]/g, 'k');
  const utterance = new SpeechSynthesisUtterance(s);
  utterance.lang = 'tr-TR';
  utterance.rate = slow ? 0.7 : 0.85;
  utterance.pitch = 1.0;
  const voices = speechSynthesis.getVoices();
  const trVoice = voices.find(v => v.lang === 'tr-TR' || v.lang.startsWith('tr'));
  if (trVoice) utterance.voice = trVoice;
  utterance.onend = () => {};
  speechSynthesis.speak(utterance);
}
