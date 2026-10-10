// ─── FerMat — Share text helpers (pure, canvas-free) ────────────
// Everything here is plain string work so it can be unit-tested in jsdom:
// line wrapping against an injected measure function, file-name slugs and
// the Instagram caption that accompanies a card.
import { SECTIONS } from '@data/sections.js';

// Fixed block appended to every caption (concept and exercise posts alike),
// so the account's posts all end the same way.
export const CAPTION_FOOTER = [
  '📚 FerMat — Ferhenga Matematîkê ya Kurdî',
  'Kurdî · Tirkî · Îngilîzî',
  '📲 Sepan: jimaro.app',
  '🔖 Tomar bike · ↗️ Parve bike · ➕ Me bişopîne',
];

// Hashtags: the first five identify the account; the rest widen reach in
// Kurdish, Turkish and English. Per-post tags are inserted between the two.
export const CAPTION_TAGS_CORE = ['#FerMat', '#FerhengaMatematîkê', '#matematîk', '#kurdî', '#kurmancî'];
export const CAPTION_TAGS_REACH = [
  '#zimanêkurdî', '#ferheng', '#perwerde', '#zarok', '#mamoste',
  '#matematik', '#kürtçe', '#kürtçematematik', '#kurdish', '#mathematics',
];

/** Footer + hashtags (+ handle) shared by every caption. */
function captionTail(extraTags, handle) {
  const tags = [...CAPTION_TAGS_CORE, ...extraTags, ...CAPTION_TAGS_REACH].filter(Boolean);
  const lines = ['', ...CAPTION_FOOTER, '', [...new Set(tags)].join(' ')];
  const normalized = normalizeHandle(handle);
  if (normalized) lines.push(normalized);
  return lines;
}

const HAWAR_ASCII = { ê: 'e', î: 'i', û: 'u', ç: 'c', ş: 's' };

/** "HEJMARA XWEZAYÎ" → "hejmara-xwezayi" (safe on every file system). */
export function slugify(text) {
  return String(text)
    .toLocaleLowerCase('ku')
    .replace(/[êîûçş]/g, ch => HAWAR_ASCII[ch])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "#KIRARÎYA DANEYAN" is not a valid hashtag — strip spaces, keep Hawar letters. */
export function toHashtag(text) {
  const tag = String(text).toLocaleLowerCase('ku').replace(/[^\p{L}\p{N}]+/gu, '');
  return tag ? '#' + tag : '';
}

/**
 * File name for a rendered card.
 * @param {{ku:string}} concept
 * @param {string} formatId   'post' | 'square' | 'story'
 * @param {string} [suffix]   e.g. 'pirs' for the question slide
 * @param {number} [order]    1-based position inside a carousel/ZIP
 */
export function shareFileName(concept, formatId, suffix = '', order = 0) {
  const parts = ['fermat'];
  if (order > 0) parts.push(String(order).padStart(3, '0'));
  parts.push(slugify(concept.ku));
  if (suffix) parts.push(suffix);
  parts.push(formatId);
  return parts.join('-') + '.png';
}

/**
 * Greedy word wrap. `measure(text)` returns the rendered width, so the same
 * routine serves the canvas renderer and the tests.
 * A single word wider than maxWidth stays on its own line (never split).
 * @returns {string[]}
 */
export function wrapLines(measure, text, maxWidth) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? current + ' ' + word : word;
    if (current && measure(candidate) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Caption to paste under the Instagram post. Uses only the dictionary's own
 * text (term, definition, example) — nothing is composed here.
 * @param {import('@data').Concept} concept
 * @param {string} [handle] Instagram handle, with or without '@'
 */
export function buildCaption(concept, handle = '') {
  const section = SECTIONS[concept.s];
  const lines = [concept.ku];
  lines.push([concept.tr, concept.en].filter(Boolean).join(' · '));
  lines.push('');
  if (concept.df) lines.push('📖 ' + concept.df);
  if (concept.ex) lines.push('💬 ' + concept.ex);
  lines.push(...captionTail([section ? toHashtag(section.short) : ''], handle));
  return lines.join('\n');
}

/**
 * True when showing the section name next to a question would give the
 * answer away — e.g. the HEJMAR section pill beside "sayı → ?" (HEJMAR).
 */
export function sectionRevealsAnswer(sectionId, answer) {
  const section = SECTIONS[sectionId];
  const target = String(answer || '').toLocaleUpperCase('ku').trim();
  if (!section || !target) return false;
  return [section.short, section.name].some(name => {
    const label = name.toLocaleUpperCase('ku');
    return label.includes(target) || target.includes(label);
  });
}

/** '  fermat ' → '@fermat'; '' stays ''. */
export function normalizeHandle(handle) {
  const clean = String(handle || '').trim().replace(/^@+/, '').replace(/\s+/g, '');
  return clean ? '@' + clean : '';
}


/** Stable slug for an exercise: bank id, or concept + type for generated ones. */
export function exerciseSlug(question) {
  return question.id || slugify(`${question.concept?.ku || 'pirs'}-${question.type}`);
}

/** @param {'pirs'|'bersiv'} slide */
export function exerciseFileName(question, formatId, slide, order = 0) {
  const parts = ['fermat-hindari'];
  if (order > 0) parts.push(String(order).padStart(3, '0'));
  parts.push(exerciseSlug(question), slide, formatId);
  return parts.join('-') + '.png';
}

/**
 * Caption for an exercise post: the question and its options, never the
 * answer (that is the second slide).
 */
export function buildExerciseCaption(question, handle = '') {
  const lines = [];
  const prompt = [question.q, question.sub].filter(Boolean).join(' — ');
  if (prompt) lines.push(prompt);
  if (question.hint) lines.push(question.hint);
  lines.push('');
  question.opts.forEach((opt, i) => lines.push(`${'ABCD'[i]}) ${opt}`));
  const section = SECTIONS[question.s];
  lines.push(...captionTail(['#hîndarî', section ? toHashtag(section.short) : ''], handle));
  return lines.join('\n');
}
