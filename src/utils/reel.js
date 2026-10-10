// ─── FerMat — Reels video (canvas + MediaRecorder) ──────────────
// Turns three already-rendered 1080×1920 cards into a short vertical video:
// question → answer → links. Recorded in real time from a canvas stream, with
// an optional backing track synthesised on the spot with Web Audio — no audio
// files are shipped, so there is nothing to license.

export const REEL_SIZE = { w: 1080, h: 1920 };
// Seconds per slide: read the question, take in the answer, see the links.
export const REEL_SLIDE_SECONDS = [3.5, 5.5, 3.5];

const FPS = 30;
const FADE_SECONDS = 0.45;
const ZOOM = 0.035;            // slow push-in per slide so the frame never sits still
const VIDEO_BITS_PER_SECOND = 6_000_000;

// Equal-tempered pitches used by the tracks below.
const HZ = {
  C3: 130.81, D3: 146.83, F3: 174.61, G3: 196.00, A3: 220.00,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00,
  C5: 523.25, D5: 587.33, E5: 659.25,
};

// Each track is a looped melody + bass line: [pitch, beats]. Original motifs
// on pentatonic scales — simple enough to sit under a voice-less clip.
export const REEL_TRACKS = {
  none: { id: 'none', label: 'Bê muzîk' },
  aram: {
    id: 'aram', label: 'Aram', bpm: 76, wave: 'sine', noteGain: 0.20, bassGain: 0.10,
    melody: [
      ['D4', 1], ['G4', 1], ['A4', 2], ['G4', 1], ['F4', 1], ['D4', 2],
      ['A4', 1], ['C5', 1], ['D5', 2], ['C5', 1], ['A4', 1], ['G4', 2],
    ],
    bass: [['D3', 4], ['D3', 4], ['F3', 4], ['G3', 4]],
  },
  sad: {
    id: 'sad', label: 'Şad', bpm: 116, wave: 'triangle', noteGain: 0.17, bassGain: 0.10,
    melody: [
      ['E4', 0.5], ['G4', 0.5], ['A4', 1], ['G4', 0.5], ['E4', 0.5], ['C4', 1],
      ['D4', 0.5], ['E4', 0.5], ['G4', 1], ['A4', 0.5], ['C5', 0.5], ['A4', 1],
      ['C5', 0.5], ['D5', 0.5], ['E5', 1], ['C5', 0.5], ['A4', 0.5], ['G4', 1],
      ['E4', 0.5], ['D4', 0.5], ['C4', 2],
    ],
    bass: [['C3', 2], ['C3', 2], ['A3', 2], ['G3', 2], ['F3', 2], ['G3', 2], ['C3', 2]],
  },
};

/**
 * Best container the browser can record. Instagram needs MP4 (H.264 + AAC);
 * Firefox can only produce WebM, which has to be converted before upload.
 * @returns {{ mimeType: string, extension: 'mp4'|'webm' } | null}
 */
export function reelFormat(withAudio = true) {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = withAudio
    ? ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4',
       'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
    : ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
  const mimeType = candidates.find(type => MediaRecorder.isTypeSupported(type));
  return mimeType ? { mimeType, extension: mimeType.startsWith('video/mp4') ? 'mp4' : 'webm' } : null;
}

export function isReelSupported() {
  return typeof document !== 'undefined'
    && typeof document.createElement('canvas').captureStream === 'function'
    && reelFormat(false) !== null;
}

function playTone(audio, output, { frequency, start, length, wave, gain }) {
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  oscillator.type = wave;
  oscillator.frequency.value = frequency;
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(gain, start + Math.min(0.04, length * 0.2));
  envelope.gain.setValueAtTime(gain, start + length * 0.55);
  envelope.gain.exponentialRampToValueAtTime(0.0008, start + length);
  oscillator.connect(envelope).connect(output);
  oscillator.start(start);
  oscillator.stop(start + length + 0.02);
}

/** Loop a [pitch, beats] line from `start` until `end`. */
function scheduleLine(audio, output, line, { start, end, beat, wave, gain, sustain }) {
  let time = start;
  for (let i = 0; time < end; i++) {
    const [pitch, beats] = line[i % line.length];
    const length = beats * beat;
    playTone(audio, output, { frequency: HZ[pitch], start: time, length: length * sustain, wave, gain });
    time += length;
  }
}

/** Schedule the whole track up front; returns the node to stop/close later. */
function scheduleTrack(audio, destination, track, seconds) {
  const master = audio.createGain();
  const start = audio.currentTime + 0.05;
  const end = start + seconds;
  master.gain.setValueAtTime(0, start);
  master.gain.linearRampToValueAtTime(1, start + 0.3);
  master.gain.setValueAtTime(1, Math.max(start + 0.3, end - 1.2));
  master.gain.linearRampToValueAtTime(0, end);
  master.connect(destination);
  const beat = 60 / track.bpm;
  scheduleLine(audio, master, track.melody, { start, end, beat, wave: track.wave, gain: track.noteGain, sustain: 0.95 });
  scheduleLine(audio, master, track.bass, { start, end, beat, wave: 'triangle', gain: track.bassGain, sustain: 1 });
}

function drawSlide(ctx, slide, progress, alpha) {
  const { w, h } = REEL_SIZE;
  const scale = 1 + ZOOM * progress;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);
  ctx.drawImage(slide, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Countdown bar on the question slide: "think before the answer appears". */
function drawCountdown(ctx, remaining) {
  const { w, h } = REEL_SIZE;
  const x = 96, width = w - 192, y = h - 300, height = 12;
  ctx.save();
  ctx.fillStyle = 'rgba(15,76,92,0.16)';
  ctx.beginPath(); ctx.roundRect(x, y, width, height, height / 2); ctx.fill();
  ctx.fillStyle = '#EA580C';
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(height, width * remaining), height, height / 2); ctx.fill();
  ctx.restore();
}

function drawFrame(ctx, slides, seconds, time) {
  let index = 0, slideStart = 0;
  while (index < slides.length - 1 && time >= slideStart + seconds[index]) {
    slideStart += seconds[index];
    index += 1;
  }
  const local = time - slideStart;
  const progress = Math.min(1, local / seconds[index]);
  const isFading = index > 0 && local < FADE_SECONDS;
  if (isFading) drawSlide(ctx, slides[index - 1], 1, 1);
  drawSlide(ctx, slides[index], progress, isFading ? local / FADE_SECONDS : 1);
  if (index === 0) drawCountdown(ctx, 1 - progress);
}

/**
 * Record the slides as one video.
 * @param {Object} options
 * @param {HTMLCanvasElement[]} options.slides  1080×1920 cards, in order
 * @param {number[]} [options.seconds]          duration of each slide
 * @param {string} [options.track]              key of REEL_TRACKS
 * @param {(fraction: number) => void} [options.onProgress]
 * @returns {Promise<{ blob: Blob, extension: string }>}
 */
export function recordReel({ slides, seconds = REEL_SLIDE_SECONDS, track = 'aram', onProgress }) {
  const music = REEL_TRACKS[track] && track !== 'none' ? REEL_TRACKS[track] : null;
  const format = reelFormat(Boolean(music));
  if (!format) return Promise.reject(new Error('video recording unsupported'));
  const total = seconds.slice(0, slides.length).reduce((sum, s) => sum + s, 0);

  const canvas = document.createElement('canvas');
  canvas.width = REEL_SIZE.w;
  canvas.height = REEL_SIZE.h;
  const ctx = canvas.getContext('2d');
  drawFrame(ctx, slides, seconds, 0);

  const stream = canvas.captureStream(FPS);
  let audio = null;
  if (music) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audio = new AudioContextClass();
    const destination = audio.createMediaStreamDestination();
    scheduleTrack(audio, destination, music, total);
    destination.stream.getAudioTracks().forEach(audioTrack => stream.addTrack(audioTrack));
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: format.mimeType, videoBitsPerSecond: VIDEO_BITS_PER_SECOND });
    let timer = null;
    const cleanUp = () => {
      clearInterval(timer);
      stream.getTracks().forEach(streamTrack => streamTrack.stop());
      if (audio) audio.close().catch(() => {});
    };
    recorder.ondataavailable = event => { if (event.data.size > 0) chunks.push(event.data); };
    recorder.onerror = event => { cleanUp(); reject(event.error || new Error('recording failed')); };
    recorder.onstop = () => {
      cleanUp();
      resolve({ blob: new Blob(chunks, { type: format.mimeType.split(';')[0] }), extension: format.extension });
    };

    recorder.start();
    const startedAt = performance.now();
    // Wall-clock driven, so a throttled tab drops frames instead of stretching time.
    timer = setInterval(() => {
      const time = (performance.now() - startedAt) / 1000;
      if (time >= total) {
        drawFrame(ctx, slides, seconds, total - 0.001);
        clearInterval(timer);
        onProgress?.(1);
        // One more frame interval so the last frame reaches the encoder.
        setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 1000 / FPS * 2);
        return;
      }
      drawFrame(ctx, slides, seconds, time);
      onProgress?.(time / total);
    }, 1000 / FPS);
  });
}
