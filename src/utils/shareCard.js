// ─── FerMat — Instagram share cards (canvas renderer) ───────────
// Draws a concept as a 1080px-wide PNG in Instagram's three native shapes.
// Text is drawn straight onto the canvas (so it uses the page's Inter and
// stays sharp); the concept illustration is the same React SVG the app shows,
// serialised and rasterised as a vector image.
//
// No dependencies: canvas 2D + the visuals the app already ships.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { SECTIONS } from '@data/sections.js';
import { THEME, SECTION_COLORS } from '@data/theme.js';
import { SYLLABLES } from '@data/conceptMeta.js';
import { ConceptVisual } from '@components/visuals';
import { wrapLines, normalizeHandle } from './shareText.js';

// Instagram: 4:5 feed post, 1:1 square, 9:16 story. Story keeps content out
// of the top/bottom strips the app covers with its own chrome.
export const SHARE_FORMATS = {
  post:   { id: 'post',   label: 'Post 4:5',   w: 1080, h: 1350, safeTop: 0,   safeBottom: 0 },
  square: { id: 'square', label: 'Kare 1:1',   w: 1080, h: 1080, safeTop: 0,   safeBottom: 0 },
  story:  { id: 'story',  label: 'Story 9:16', w: 1080, h: 1920, safeTop: 210, safeBottom: 250 },
};

export const SHARE_TEMPLATES = {
  term:     { id: 'term',     label: 'Têgeh' },
  question: { id: 'question', label: 'Pirs' },
};

export const SHARE_STYLES = {
  light: { id: 'light', label: 'Ronî' },
  dark:  { id: 'dark',  label: 'Tarî' },
};

export const DEFAULT_SHARE_PREFS = { format: 'post', template: 'term', style: 'light', handle: '' };

const BRAND_DARK = '#0F4C5C';
const CORAL = '#EA580C';
const FONT_STACK = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const SVG_FONT_STACK = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";
const PAD = 72;
// Visuals are authored for a 160-unit box (fixed label sizes); render at that
// size and let the browser scale the vector up.
const VISUAL_UNITS = 160;
// Room for drop shadows around the cropped drawing (SVG user units).
const VISUAL_BLEED = 6;
const VISUAL_RASTER_SCALE = 6;
const MIN_SCALE = 0.6;

const font = (weight, size, italic = false) =>
  `${italic ? 'italic ' : ''}${weight} ${Math.round(size)}px ${FONT_STACK}`;

function paletteFor(concept, styleId) {
  const index = SECTIONS[concept.s]?.colorIndex ?? 0;
  const light = SECTION_COLORS.light[index];
  if (styleId === 'dark') {
    const dark = SECTION_COLORS.dark[index];
    return {
      bgFrom: BRAND_DARK, bgTo: '#0A3440',
      ink: '#FFFFFF', muted: 'rgba(255,255,255,0.74)',
      term: '#FFFFFF', accent: dark.accent, brand: '#FFFFFF',
      box: 'rgba(255,255,255,0.08)', blob: 'rgba(255,255,255,0.05)',
      pillBg: dark.accent, pillInk: BRAND_DARK,
      example: '#FDBA74',
    };
  }
  return {
    bgFrom: '#FFFFFF', bgTo: light.bg,
    ink: '#1A2332', muted: '#64748B',
    term: light.text, accent: light.icon, brand: BRAND_DARK,
    box: '#FFFFFF', blob: hexAlpha(light.accent, 0.10),
    pillBg: light.text, pillInk: '#FFFFFF',
    example: CORAL,
  };
}

function hexAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// ── Asset loading ───────────────────────────────────────────────────────────
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

let logoPromise = null;
function loadLogo() {
  if (!logoPromise) {
    logoPromise = loadImage(import.meta.env.BASE_URL + 'favicon.svg').catch(() => null);
  }
  return logoPromise;
}

async function ensureFonts() {
  if (!document.fonts?.load) return;
  const weights = [500, 600, 700, 800, 900];
  try {
    await Promise.all([
      ...weights.map(w => document.fonts.load(`${w} 40px Inter`)),
      document.fonts.load('italic 500 40px Inter'),
    ]);
  } catch { /* offline / blocked: canvas falls back to the system stack */ }
}

/** A fresh macrotask. MessageChannel, because background tabs clamp setTimeout
 *  to ~1s and a whole-section export yields once per card. */
function nextTask() {
  return new Promise(resolve => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => { channel.port1.close(); resolve(); };
    channel.port2.postMessage(null);
  });
}

/**
 * Render the app's own illustration for a concept and return it as an image.
 * Mounted off-screen for one synchronous commit, serialised, then unmounted.
 */
async function loadConceptVisual(concept, { hideLabel = false } = {}) {
  if (!concept.visual || concept.visual.type === 'none') return null;
  let visual = concept.visual;
  // On a question card the free-text label would give the answer away.
  if (hideLabel && visual.params?.label) {
    visual = { ...visual, params: { ...visual.params, label: '' } };
  }
  // Leave the caller's stack first: this is reached from a React effect, and
  // flushSync must not run while React is still committing.
  await nextTask();
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;pointer-events:none;';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => {
      root.render(createElement(ConceptVisual, { visual, theme: THEME.light, size: VISUAL_UNITS }));
    });
    const svg = host.querySelector('svg');
    if (!svg) return null;
    // Crop to what is actually drawn: most visuals use only part of their
    // square box, and a tight crop lets the drawing fill the card's panel.
    let box = { x: 0, y: 0, width: VISUAL_UNITS, height: VISUAL_UNITS };
    try {
      const drawn = svg.getBBox();
      if (drawn.width > 0 && drawn.height > 0) {
        box = {
          x: drawn.x - VISUAL_BLEED, y: drawn.y - VISUAL_BLEED,
          width: drawn.width + VISUAL_BLEED * 2, height: drawn.height + VISUAL_BLEED * 2,
        };
      }
    } catch { /* getBBox unsupported: keep the full box */ }
    svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
    svg.setAttribute('width', String(box.width * VISUAL_RASTER_SCALE));
    svg.setAttribute('height', String(box.height * VISUAL_RASTER_SCALE));
    // An SVG loaded as an image cannot see the page's web fonts, and labels
    // without an explicit family would fall back to a serif face.
    const fontRule = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    fontRule.textContent = `text, tspan { font-family: ${SVG_FONT_STACK} !important; }`;
    svg.insertBefore(fontRule, svg.firstChild);
    const markup = new XMLSerializer().serializeToString(svg);
    return await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup));
  } catch {
    return null;
  } finally {
    root.unmount();
    host.remove();
  }
}

// ── Drawing primitives ──────────────────────────────────────────────────────
function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, w, h, r, fill, shadow) {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 12;
  }
  ctx.fillStyle = fill;
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

function measureWith(ctx, fontSpec) {
  return text => {
    ctx.font = fontSpec;
    return ctx.measureText(text).width;
  };
}

/** Largest size in [min, max] at which `text` fits on one line; null if none. */
function fitSingleLine(ctx, text, weight, max, min, maxWidth) {
  for (let size = max; size >= min; size -= 4) {
    ctx.font = font(weight, size);
    if (ctx.measureText(text).width <= maxWidth) return size;
  }
  return null;
}

/**
 * A text block: lines + metrics, measured once so layout can sum heights
 * before anything is painted.
 */
function textBlock(ctx, text, { weight, size, lineHeight = 1.3, maxWidth, italic = false, color, align = 'left' }) {
  const spec = font(weight, size, italic);
  const lines = wrapLines(measureWith(ctx, spec), text, maxWidth);
  const step = size * lineHeight;
  return {
    height: lines.length * step,
    draw(x, y) {
      ctx.font = spec;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      lines.forEach((line, i) => ctx.fillText(line, x, y + step * (i + 0.5)));
    },
  };
}

/** Headline: one line if it fits down to `min`, otherwise wrapped at `min`. */
function headlineBlock(ctx, text, { max, min, maxWidth, color }) {
  const size = fitSingleLine(ctx, text, 900, max, min, maxWidth) ?? min;
  return textBlock(ctx, text, { weight: 900, size, lineHeight: 1.1, maxWidth, color, align: 'center' });
}

function drawBackground(ctx, format, p) {
  const gradient = ctx.createLinearGradient(0, 0, format.w, format.h);
  gradient.addColorStop(0, p.bgFrom);
  gradient.addColorStop(1, p.bgTo);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, format.w, format.h);
  ctx.fillStyle = p.blob;
  ctx.beginPath(); ctx.arc(format.w - 40, 60, 300, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(30, format.h - 30, 210, 0, Math.PI * 2); ctx.fill();
}

const HEADER_H = 76;
const FOOTER_H = 56;

function drawHeader(ctx, format, p, logo, pillText) {
  const y = format.safeTop + PAD;
  if (logo) ctx.drawImage(logo, PAD, y, HEADER_H, HEADER_H);
  ctx.font = font(800, 44);
  ctx.fillStyle = p.brand;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('FerMat', PAD + (logo ? HEADER_H + 20 : 0), y + HEADER_H / 2 + 2);

  if (pillText) {
    ctx.font = font(800, 26);
    const w = ctx.measureText(pillText).width + 52;
    const h = 54;
    fillRoundRect(ctx, format.w - PAD - w, y + (HEADER_H - h) / 2, w, h, h / 2, p.pillBg);
    ctx.fillStyle = p.pillInk;
    ctx.textAlign = 'center';
    ctx.fillText(pillText, format.w - PAD - w / 2, y + HEADER_H / 2 + 1);
  }
  return y + HEADER_H;
}

function drawFooter(ctx, format, p, left, right) {
  const y = format.h - format.safeBottom - PAD - FOOTER_H / 2;
  ctx.textBaseline = 'middle';
  ctx.font = font(700, 28);
  ctx.fillStyle = p.muted;
  ctx.textAlign = 'left';
  ctx.fillText(left, PAD, y);
  if (right) {
    ctx.textAlign = 'right';
    ctx.fillText(right, format.w - PAD, y);
  }
}

/** White panel holding the illustration (or the section emoji as fallback). */
function drawVisualPanel(ctx, x, y, w, h, concept, image) {
  fillRoundRect(ctx, x, y, w, h, 40, '#FFFFFF', 'rgba(15,76,92,0.14)');
  const side = Math.min(w, h) - 40;
  if (image) {
    // Contain the (cropped, possibly wide) drawing inside the padded panel.
    const fit = Math.min((w - 72) / image.width, (h - 56) / image.height);
    const dw = image.width * fit, dh = image.height * fit;
    ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    return;
  }
  ctx.font = `${Math.round(side * 0.55)}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1A2332';
  ctx.fillText(SECTIONS[concept.s]?.icon || '📘', x + w / 2, y + h / 2);
}

/** Labelled box with a coloured bar on the left (Penase / Mînak). */
function labelledBox(ctx, label, body, { barColor, p, width, scale, italic = false }) {
  const padX = 34, padY = 26;
  const labelSize = 24 * scale;
  const text = textBlock(ctx, body, {
    weight: 500, size: 37 * scale, lineHeight: 1.38, italic,
    maxWidth: width - padX * 2 - 10, color: p.ink,
  });
  const height = padY * 2 + labelSize + 14 + text.height;
  return {
    height,
    draw(x, y) {
      fillRoundRect(ctx, x, y, width, height, 26, p.box, 'rgba(15,76,92,0.06)');
      fillRoundRect(ctx, x, y, 10, height, 5, barColor);
      ctx.font = font(800, labelSize);
      ctx.fillStyle = barColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.toLocaleUpperCase('ku'), x + padX + 6, y + padY + labelSize / 2);
      text.draw(x + padX + 6, y + padY + labelSize + 14);
    },
  };
}

// ── Templates ───────────────────────────────────────────────────────────────
// Each template returns the stack of text blocks below the illustration for a
// given scale; `layoutAndDraw` shrinks the scale until the illustration keeps
// its minimum height, then drops optional blocks as a last resort.

function termBlocks(ctx, concept, p, width, scale) {
  const blocks = [];
  blocks.push({ gap: 40 * scale, ...headlineBlock(ctx, concept.ku, { max: 104 * scale, min: 60 * scale, maxWidth: width, color: p.term }) });
  if (SYLLABLES[concept.ku] && SYLLABLES[concept.ku] !== concept.ku) {
    blocks.push({ gap: 10 * scale, optional: 2, ...textBlock(ctx, SYLLABLES[concept.ku], {
      weight: 600, size: 30 * scale, maxWidth: width, color: p.muted, align: 'center',
    }) });
  }
  const gloss = [concept.tr, concept.en].filter(Boolean).join('  ·  ');
  blocks.push({ gap: 14 * scale, ...textBlock(ctx, gloss, {
    weight: 600, size: 38 * scale, maxWidth: width, color: p.muted, align: 'center',
  }) });
  if (concept.df) {
    blocks.push({ gap: 36 * scale, boxed: true, ...labelledBox(ctx, 'Penase', concept.df, { barColor: p.accent, p, width, scale }) });
  }
  if (concept.ex) {
    blocks.push({ gap: 20 * scale, boxed: true, optional: 1, ...labelledBox(ctx, 'Mînak', concept.ex, { barColor: p.example, p, width, scale, italic: true }) });
  }
  return blocks;
}

function questionBlocks(ctx, concept, p, width, scale) {
  const blocks = [];
  blocks.push({ gap: 44 * scale, ...headlineBlock(ctx, concept.tr, { max: 96 * scale, min: 56 * scale, maxWidth: width, color: p.term }) });
  if (concept.en) {
    blocks.push({ gap: 12 * scale, ...textBlock(ctx, concept.en, {
      weight: 600, size: 38 * scale, maxWidth: width, color: p.muted, align: 'center',
    }) });
  }
  blocks.push({ gap: 40 * scale, ...textBlock(ctx, 'Bi Kurdî çi ye?', {
    weight: 800, size: 60 * scale, maxWidth: width, color: p.accent, align: 'center',
  }) });
  return blocks;
}

const stackHeight = blocks => blocks.reduce((sum, b) => sum + b.gap + b.height, 0);

function layoutAndDraw(ctx, format, concept, p, image, buildBlocks, top, bottom) {
  const width = format.w - PAD * 2;
  const available = bottom - top;
  const minVisual = format.id === 'square' ? 250 : format.id === 'story' ? 460 : 340;
  const maxVisual = format.id === 'square' ? 420 : format.id === 'story' ? 780 : 620;

  let scale = 1;
  let blocks = buildBlocks(ctx, concept, p, width, scale);
  while (available - stackHeight(blocks) < minVisual && scale > MIN_SCALE) {
    scale = Math.max(MIN_SCALE, scale - 0.05);
    blocks = buildBlocks(ctx, concept, p, width, scale);
  }
  // Still too tall (long definition in the square format): drop the example,
  // then the syllables.
  for (const level of [1, 2]) {
    if (available - stackHeight(blocks) >= minVisual) break;
    blocks = blocks.filter(b => b.optional !== level);
  }

  const visualH = Math.max(160, Math.min(maxVisual, available - stackHeight(blocks)));
  const slack = Math.max(0, available - stackHeight(blocks) - visualH);
  let y = top + slack / 2;
  drawVisualPanel(ctx, PAD, y, width, visualH, concept, image);
  y += visualH;
  for (const block of blocks) {
    y += block.gap;
    block.draw(block.boxed ? PAD : format.w / 2, y);
    y += block.height;
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * @param {Object} options
 * @param {import('@data').Concept} options.concept
 * @param {'post'|'square'|'story'} [options.format]
 * @param {'term'|'question'} [options.template]
 * @param {'light'|'dark'} [options.style]
 * @param {string} [options.handle] Instagram handle printed in the footer
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderShareCard({ concept, format = 'post', template = 'term', style = 'light', handle = '' }) {
  const fmt = SHARE_FORMATS[format] || SHARE_FORMATS.post;
  const isQuestion = template === 'question';
  const [logo, image] = await Promise.all([
    loadLogo(),
    loadConceptVisual(concept, { hideLabel: isQuestion }),
    ensureFonts(),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const ctx = canvas.getContext('2d');
  const p = paletteFor(concept, style);
  const section = SECTIONS[concept.s];

  drawBackground(ctx, fmt, p);
  const headerBottom = drawHeader(ctx, fmt, p, logo, section?.short);
  drawFooter(ctx, fmt, p, normalizeHandle(handle) || 'Ferhenga Matematîkê', isQuestion ? '' : 'Asta ' + concept.lv);

  const top = headerBottom + 40;
  const bottom = fmt.h - fmt.safeBottom - PAD - FOOTER_H - 28;
  layoutAndDraw(ctx, fmt, concept, p, image, isQuestion ? questionBlocks : termBlocks, top, bottom);
  return canvas;
}

/**
 * Cover slide for a section carousel: icon, section name, concept count.
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderSectionCover({ sectionId, count, format = 'post', style = 'light', handle = '' }) {
  const fmt = SHARE_FORMATS[format] || SHARE_FORMATS.post;
  const [logo] = await Promise.all([loadLogo(), ensureFonts()]);
  const section = SECTIONS[sectionId];
  const canvas = document.createElement('canvas');
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const ctx = canvas.getContext('2d');
  const p = paletteFor({ s: sectionId }, style);
  const width = fmt.w - PAD * 2;

  drawBackground(ctx, fmt, p);
  drawHeader(ctx, fmt, p, logo, '');
  drawFooter(ctx, fmt, p, normalizeHandle(handle) || 'Ferhenga Matematîkê', '');

  const title = headlineBlock(ctx, section.name, { max: 116, min: 64, maxWidth: width, color: p.term });
  const subtitle = textBlock(ctx, section.tr, { weight: 600, size: 42, maxWidth: width, color: p.muted, align: 'center' });
  const disc = 300;
  const countText = `${count} têgeh`;
  const total = disc + 56 + title.height + 18 + subtitle.height + 48 + 72;
  let y = fmt.safeTop + (fmt.h - fmt.safeTop - fmt.safeBottom - total) / 2;

  fillRoundRect(ctx, (fmt.w - disc) / 2, y, disc, disc, disc / 2, '#FFFFFF', 'rgba(15,76,92,0.16)');
  ctx.font = `150px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1A2332';
  ctx.fillText(section.icon, fmt.w / 2, y + disc / 2 + 8);
  y += disc + 56;
  title.draw(fmt.w / 2, y);
  y += title.height + 18;
  subtitle.draw(fmt.w / 2, y);
  y += subtitle.height + 48;

  ctx.font = font(800, 34);
  const pillW = ctx.measureText(countText).width + 72;
  fillRoundRect(ctx, (fmt.w - pillW) / 2, y, pillW, 72, 36, p.pillBg);
  ctx.fillStyle = p.pillInk;
  ctx.fillText(countText, fmt.w / 2, y + 37);
  return canvas;
}

// ── Exercise cards ──────────────────────────────────────────────────────────
const SUCCESS = '#15803D';
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

// p.accent is always #RRGGBB; this keeps the helper safe if that changes.
const tint = (color, alpha) => (color.startsWith('#') ? hexAlpha(color, alpha) : color);

function pillBlock(ctx, text, p, scale) {
  const size = 26 * scale;
  const height = 54 * scale;
  return {
    height,
    draw(x, y) {
      ctx.font = font(800, size);
      const w = ctx.measureText(text).width + 56 * scale;
      fillRoundRect(ctx, x - w / 2, y, w, height, height / 2, tint(p.accent, 0.18));
      ctx.fillStyle = p.accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y + height / 2 + 1);
    },
  };
}

function visualBlock(ctx, image, width, height) {
  return {
    height,
    draw(x, y) { drawVisualPanel(ctx, x, y, width, height, { s: 0 }, image); },
  };
}

function optionBlock(ctx, letter, text, { p, width, scale, state }) {
  const isLong = text.length > 28;
  const padY = 24 * scale;
  const disc = 30 * scale;
  const textX = 40 * scale + disc * 2 + 24 * scale;
  const isCorrect = state === 'correct';
  const body = textBlock(ctx, text, {
    weight: 700, size: (isLong ? 30 : 40) * scale, lineHeight: 1.3,
    maxWidth: width - textX - 36 * scale - (isCorrect ? 60 * scale : 0),
    color: isCorrect ? '#FFFFFF' : p.ink,
  });
  const height = Math.max(body.height, disc * 2) + padY * 2;
  return {
    height,
    draw(x, y) {
      ctx.save();
      if (state === 'dimmed') ctx.globalAlpha = 0.45;
      fillRoundRect(ctx, x, y, width, height, 24, isCorrect ? SUCCESS : p.box, 'rgba(15,76,92,0.06)');
      const cx = x + 40 * scale + disc, cy = y + height / 2;
      ctx.fillStyle = isCorrect ? '#FFFFFF' : tint(p.accent, 0.2);
      ctx.beginPath(); ctx.arc(cx, cy, disc, 0, Math.PI * 2); ctx.fill();
      ctx.font = font(800, 30 * scale);
      ctx.fillStyle = isCorrect ? SUCCESS : p.accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, cx, cy + 1);
      body.draw(x + textX, y + (height - body.height) / 2);
      if (isCorrect) {
        ctx.font = font(900, 44 * scale);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.fillText('✓', x + width - 36 * scale, cy + 2);
      }
      ctx.restore();
    },
  };
}

function exerciseBlocks(ctx, question, typeLabel, p, width, scale, { image, visualHeight, reveal }) {
  const blocks = [{ gap: 0, ...pillBlock(ctx, typeLabel, p, scale) }];
  if (image) blocks.push({ gap: 32 * scale, boxed: true, ...visualBlock(ctx, image, width, visualHeight * scale) });
  if (question.q) {
    const isShort = question.q.length <= 26;
    blocks.push({ gap: 36 * scale, ...(isShort
      ? headlineBlock(ctx, question.q, { max: 92 * scale, min: 52 * scale, maxWidth: width, color: p.term })
      : textBlock(ctx, question.q, {
          weight: 700, size: (question.q.length > 110 ? 38 : 46) * scale, lineHeight: 1.35,
          maxWidth: width, color: p.term, align: 'center',
        })) });
  }
  if (question.sub) {
    blocks.push({ gap: 28 * scale, boxed: true, ...labelledBox(ctx, 'Penase', question.sub, { barColor: p.accent, p, width, scale }) });
  }
  if (question.hint) {
    blocks.push({ gap: 22 * scale, optional: 2, ...textBlock(ctx, question.hint, {
      weight: 600, size: 32 * scale, maxWidth: width, color: p.muted, align: 'center',
    }) });
  }
  question.opts.forEach((opt, i) => {
    const state = !reveal ? 'idle' : i === question.ans ? 'correct' : 'dimmed';
    blocks.push({ gap: (i === 0 ? 40 : 18) * scale, boxed: true, ...optionBlock(ctx, OPTION_LETTERS[i], opt, { p, width, scale, state }) });
  });
  if (reveal && question.explain) {
    blocks.push({ gap: 28 * scale, optional: 1, ...textBlock(ctx, '💡 ' + question.explain, {
      weight: 500, size: 30 * scale, lineHeight: 1.4, italic: true, maxWidth: width, color: p.muted, align: 'center',
    }) });
  }
  return blocks;
}

/**
 * Exercise question as an Instagram card. With `reveal` the correct option is
 * highlighted and the explanation added — the second slide of a carousel.
 *
 * @param {Object} options
 * @param {Object} options.question  from utils/exerciseQuestions.js
 * @param {string} options.typeLabel pill text, e.g. the question type label
 * @param {boolean} [options.reveal]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderExerciseCard({ question, typeLabel, format = 'post', style = 'light', handle = '', reveal = false }) {
  const fmt = SHARE_FORMATS[format] || SHARE_FORMATS.post;
  const [logo, image] = await Promise.all([
    loadLogo(),
    question.visual ? loadConceptVisual({ visual: question.visual }) : null,
    ensureFonts(),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const ctx = canvas.getContext('2d');
  const p = paletteFor({ s: question.s }, style);
  const width = fmt.w - PAD * 2;

  drawBackground(ctx, fmt, p);
  const headerBottom = drawHeader(ctx, fmt, p, logo, SECTIONS[question.s]?.short);
  drawFooter(ctx, fmt, p, normalizeHandle(handle) || 'Ferhenga Matematîkê', reveal ? 'Bersiv' : 'Pirs');

  const top = headerBottom + 36;
  const bottom = fmt.h - fmt.safeBottom - PAD - FOOTER_H - 24;
  const available = bottom - top;
  const visualHeight = fmt.id === 'square' ? 230 : fmt.id === 'story' ? 460 : 330;
  const build = scale => exerciseBlocks(ctx, question, typeLabel, p, width, scale, { image, visualHeight, reveal });

  let scale = 1;
  let blocks = build(scale);
  while (stackHeight(blocks) > available && scale > MIN_SCALE) {
    scale = Math.max(MIN_SCALE, scale - 0.05);
    blocks = build(scale);
  }
  for (const level of [1, 2]) {
    if (stackHeight(blocks) <= available) break;
    blocks = blocks.filter(b => b.optional !== level);
  }

  let y = top + Math.max(0, (available - stackHeight(blocks)) / 2);
  for (const block of blocks) {
    y += block.gap;
    block.draw(block.boxed ? PAD : fmt.w / 2, y);
    y += block.height;
  }
  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** True when the platform share sheet accepts PNG files (mobile browsers, TWA). */
export function canShareFile() {
  if (typeof navigator === 'undefined' || !navigator.canShare || typeof File === 'undefined') return false;
  try {
    return navigator.canShare({ files: [new File([new Blob()], 'x.png', { type: 'image/png' })] });
  } catch {
    return false;
  }
}

/**
 * Open the native share sheet with the image attached.
 * @returns {Promise<'shared'|'cancelled'>}
 */
export async function shareImage(blob, fileName, text) {
  const file = new File([blob], fileName, { type: 'image/png' });
  try {
    await navigator.share({ files: [file], text });
    return 'shared';
  } catch (err) {
    if (err?.name === 'AbortError') return 'cancelled';
    throw err;
  }
}
