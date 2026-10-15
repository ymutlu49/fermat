import { useState, useCallback, useRef } from 'react';
import sesManifest from '../data/ses_manifest.json';

/**
 * Kurmancî seslendirme — önceden üretilmiş sesler (Jimaro ses fabrikası, Ziman/ses/fabrika).
 *
 * Her terim, tanım ve örnek cümlenin sesi bizde üretilir ve Cloudflare R2'den sunulur;
 * dış bir TTS servisine bağımlılık yoktur. Manifest metin anahtarını ses dosyasına eşler.
 * Manifestte olmayan metin (ör. programın ürettiği test soruları) sessiz kalır: Kurmancîyi
 * Türkçe tarayıcı sesiyle bozarak okumaktansa ses çalmamak tercih edildi.
 */

// Sesler sitenin kendisiyle yayımlanır (public/ses/<ses>/…, ~11 MB). R2'ye taşınınca VITE_SES_BASE verilir.
const SES_BASE = (import.meta.env.VITE_SES_BASE || import.meta.env.BASE_URL + 'ses/') + sesManifest.ses + '/';

/** Ses fabrikasıyla aynı anahtar kuralı (fabrika/uret.py: anahtar). */
export function sesAnahtari(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[.,!?]+$/, '')
    .trim()
    .replace(/[’‘`]/g, "'");
}

/** Metnin ses adresi; ses yoksa null. */
export function sesAdresi(text) {
  const dosya = sesManifest.entries[sesAnahtari(text)];
  return dosya ? SES_BASE + dosya : null;
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);

  const stop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text, { slow = false } = {}) => {
    if (!text) return false;
    stop();
    const url = sesAdresi(text);
    if (!url) {
      console.info('Ses yok (manifestte değil):', text);
      return false;
    }
    const audio = new Audio(url);
    audio.playbackRate = slow ? 0.75 : 1.0;
    audioRef.current = audio;
    setIsSpeaking(true);
    audio.onended = () => { setIsSpeaking(false); audioRef.current = null; };
    audio.onerror = () => { setIsSpeaking(false); audioRef.current = null; };
    try {
      await audio.play();
      return true;
    } catch (err) {
      console.warn('Ses çalınamadı:', err);
      setIsSpeaking(false);
      return false;
    }
  }, [stop]);

  return { speak, stop, isSpeaking, isSupported: true };
}
