// ─── Ferhenga Matematîkê — PDF Visual Icons ─────────────────────────────────
// Simple SVG icons for each visual type, used in PDF/print exports.
// These are lightweight inline SVGs that render well on paper.

const ICONS = {
  counting: `<svg viewBox="0 0 60 40" width="60" height="40"><circle cx="10" cy="20" r="6" fill="#0F4C5C" opacity="0.7"/><circle cx="25" cy="20" r="6" fill="#0F4C5C" opacity="0.7"/><circle cx="40" cy="20" r="6" fill="#0F4C5C" opacity="0.7"/><circle cx="55" cy="20" r="6" fill="#0F4C5C" opacity="0.3"/></svg>`,

  number_line: `<svg viewBox="0 0 80 30" width="80" height="30"><line x1="5" y1="20" x2="75" y2="20" stroke="#0F4C5C" stroke-width="2"/><line x1="15" y1="15" x2="15" y2="25" stroke="#0F4C5C" stroke-width="1.5"/><line x1="35" y1="15" x2="35" y2="25" stroke="#0F4C5C" stroke-width="1.5"/><line x1="55" y1="15" x2="55" y2="25" stroke="#0F4C5C" stroke-width="1.5"/><circle cx="35" cy="20" r="4" fill="#E76F51"/><text x="15" y="12" font-size="7" fill="#64748B" text-anchor="middle">0</text><text x="35" y="12" font-size="7" fill="#E76F51" text-anchor="middle" font-weight="bold">●</text><text x="55" y="12" font-size="7" fill="#64748B" text-anchor="middle">2</text></svg>`,

  number_grid: `<svg viewBox="0 0 50 50" width="50" height="50"><rect x="2" y="2" width="12" height="12" rx="2" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="0.8"/><text x="8" y="11" font-size="7" fill="#0F4C5C" text-anchor="middle" font-weight="bold">1</text><rect x="18" y="2" width="12" height="12" rx="2" fill="#E76F51" opacity="0.2" stroke="#E76F51" stroke-width="0.8"/><text x="24" y="11" font-size="7" fill="#E76F51" text-anchor="middle" font-weight="bold">2</text><rect x="34" y="2" width="12" height="12" rx="2" fill="#E76F51" opacity="0.2" stroke="#E76F51" stroke-width="0.8"/><text x="40" y="11" font-size="7" fill="#E76F51" text-anchor="middle" font-weight="bold">3</text><rect x="2" y="18" width="12" height="12" rx="2" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="0.8"/><text x="8" y="27" font-size="7" fill="#0F4C5C" text-anchor="middle">4</text><rect x="18" y="18" width="12" height="12" rx="2" fill="#E76F51" opacity="0.2" stroke="#E76F51" stroke-width="0.8"/><text x="24" y="27" font-size="7" fill="#E76F51" text-anchor="middle" font-weight="bold">5</text><rect x="34" y="18" width="12" height="12" rx="2" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="0.8"/><text x="40" y="27" font-size="7" fill="#0F4C5C" text-anchor="middle">6</text></svg>`,

  blocks: `<svg viewBox="0 0 60 40" width="60" height="40"><rect x="5" y="5" width="6" height="30" rx="1" fill="#0F4C5C" opacity="0.6"/><rect x="14" y="5" width="6" height="30" rx="1" fill="#0F4C5C" opacity="0.6"/><rect x="28" y="22" width="6" height="6" rx="1" fill="#E76F51" opacity="0.7"/><rect x="37" y="22" width="6" height="6" rx="1" fill="#E76F51" opacity="0.7"/><rect x="46" y="22" width="6" height="6" rx="1" fill="#E76F51" opacity="0.7"/><text x="12" y="42" font-size="6" fill="#64748B" text-anchor="middle">20</text><text x="40" y="42" font-size="6" fill="#64748B" text-anchor="middle">3</text></svg>`,

  fraction: `<svg viewBox="0 0 50 50" width="50" height="50"><circle cx="25" cy="25" r="20" fill="none" stroke="#0F4C5C" stroke-width="2"/><path d="M 25 5 A 20 20 0 0 1 25 45" fill="#E76F51" opacity="0.3"/><line x1="25" y1="5" x2="25" y2="45" stroke="#0F4C5C" stroke-width="1.5"/><text x="25" y="52" font-size="7" fill="#64748B" text-anchor="middle">1/2</text></svg>`,

  operation: `<svg viewBox="0 0 70 30" width="70" height="30"><text x="8" y="22" font-size="14" fill="#0F4C5C" font-weight="bold">3</text><text x="22" y="22" font-size="14" fill="#E76F51" font-weight="bold">+</text><text x="36" y="22" font-size="14" fill="#0F4C5C" font-weight="bold">2</text><text x="48" y="22" font-size="14" fill="#64748B">=</text><text x="60" y="22" font-size="14" fill="#2D6A4F" font-weight="bold">5</text></svg>`,

  compare: `<svg viewBox="0 0 60 30" width="60" height="30"><text x="10" y="22" font-size="14" fill="#0F4C5C" font-weight="bold">5</text><text x="30" y="22" font-size="16" fill="#E76F51" font-weight="bold">&gt;</text><text x="50" y="22" font-size="14" fill="#0F4C5C" font-weight="bold">3</text></svg>`,

  geometry: `<svg viewBox="0 0 50 50" width="50" height="50"><polygon points="25,5 45,40 5,40" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="1.5"/></svg>`,

  spatial: `<svg viewBox="0 0 50 50" width="50" height="50"><rect x="15" y="15" width="25" height="25" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="1.5" rx="2"/><line x1="15" y1="15" x2="8" y2="8" stroke="#0F4C5C" stroke-width="1"/><line x1="40" y1="15" x2="33" y2="8" stroke="#0F4C5C" stroke-width="1"/><line x1="8" y1="8" x2="33" y2="8" stroke="#0F4C5C" stroke-width="1"/></svg>`,

  measurement: `<svg viewBox="0 0 70 30" width="70" height="30"><rect x="5" y="8" width="60" height="14" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="1.5" rx="2"/><line x1="15" y1="8" x2="15" y2="16" stroke="#0F4C5C" stroke-width="1"/><line x1="25" y1="8" x2="25" y2="16" stroke="#0F4C5C" stroke-width="1"/><line x1="35" y1="8" x2="35" y2="16" stroke="#0F4C5C" stroke-width="1"/><line x1="45" y1="8" x2="45" y2="16" stroke="#0F4C5C" stroke-width="1"/><line x1="55" y1="8" x2="55" y2="16" stroke="#0F4C5C" stroke-width="1"/><text x="35" y="28" font-size="7" fill="#64748B" text-anchor="middle">cm</text></svg>`,

  clock: `<svg viewBox="0 0 50 50" width="50" height="50"><circle cx="25" cy="25" r="20" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="2"/><line x1="25" y1="25" x2="25" y2="12" stroke="#0F4C5C" stroke-width="2.5" stroke-linecap="round"/><line x1="25" y1="25" x2="35" y2="25" stroke="#E76F51" stroke-width="1.5" stroke-linecap="round"/><circle cx="25" cy="25" r="2" fill="#0F4C5C"/></svg>`,

  bar_chart: `<svg viewBox="0 0 60 40" width="60" height="40"><rect x="8" y="20" width="10" height="18" fill="#0F4C5C" opacity="0.6" rx="1"/><rect x="22" y="10" width="10" height="28" fill="#E76F51" opacity="0.6" rx="1"/><rect x="36" y="15" width="10" height="23" fill="#2D6A4F" opacity="0.6" rx="1"/><line x1="5" y1="38" x2="55" y2="38" stroke="#64748B" stroke-width="1"/></svg>`,

  pie_chart: `<svg viewBox="0 0 50 50" width="50" height="50"><circle cx="25" cy="25" r="18" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="1.5"/><path d="M 25 25 L 25 7 A 18 18 0 0 1 43 25 Z" fill="#0F4C5C" opacity="0.6"/><path d="M 25 25 L 43 25 A 18 18 0 0 1 25 43 Z" fill="#E76F51" opacity="0.5"/></svg>`,

  dice: `<svg viewBox="0 0 40 40" width="40" height="40"><rect x="4" y="4" width="32" height="32" rx="5" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="1.5"/><circle cx="14" cy="14" r="3" fill="#0F4C5C"/><circle cx="26" cy="14" r="3" fill="#0F4C5C"/><circle cx="14" cy="26" r="3" fill="#0F4C5C"/><circle cx="26" cy="26" r="3" fill="#0F4C5C"/></svg>`,

  balance: `<svg viewBox="0 0 60 40" width="60" height="40"><line x1="30" y1="5" x2="30" y2="35" stroke="#0F4C5C" stroke-width="2"/><line x1="10" y1="15" x2="50" y2="15" stroke="#0F4C5C" stroke-width="2"/><polygon points="30,3 26,10 34,10" fill="#0F4C5C"/><circle cx="10" cy="22" r="6" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="1"/><circle cx="50" cy="22" r="6" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="1"/><text x="10" y="25" font-size="7" fill="#0F4C5C" text-anchor="middle">x</text><text x="50" y="25" font-size="7" fill="#0F4C5C" text-anchor="middle">5</text></svg>`,

  symmetry: `<svg viewBox="0 0 50 40" width="50" height="40"><polygon points="15,5 5,35 25,35" fill="#E8F4F8" stroke="#0F4C5C" stroke-width="1.5"/><polygon points="35,5 45,35 25,35" fill="#E76F51" opacity="0.2" stroke="#E76F51" stroke-width="1.5" stroke-dasharray="3,2"/><line x1="25" y1="2" x2="25" y2="38" stroke="#64748B" stroke-width="1" stroke-dasharray="3,2"/></svg>`,
};

// Map visual.type to icon key
const TYPE_MAP = {
  counting: 'counting',
  number_line: 'number_line',
  number_grid: 'number_grid',
  blocks: 'blocks',
  fraction: 'fraction',
  operation: 'operation',
  compare: 'compare',
  geometry: 'geometry',
  spatial: 'spatial',
  measurement: 'measurement',
  clock: 'clock',
  bar_chart: 'bar_chart',
  pie_chart: 'pie_chart',
  table: 'bar_chart',
  dice: 'dice',
  probability: 'dice',
  ball: 'dice',
  balance: 'balance',
  symmetry: 'symmetry',
};

// Section emoji icons as fallback
const SECTION_ICONS = {
  0: '🎓', 1: '🔢', 2: '➕', 3: '🍕', 4: '📐',
  5: '📏', 6: '📊', 9: '🧭', 10: '🔤',
};

/**
 * Get an inline SVG string for a concept's visual.
 * Falls back to section emoji if no visual type matches.
 * @param {Object} concept - Concept object
 * @param {Object} [palette] - Optional section color palette { bg, text, accent }
 */
export function getConceptVisualHTML(concept, palette) {
  const bg = palette ? palette.bg : '#F8FAFB';
  const border = palette ? hexToRgba(palette.accent, 0.25) : '#E8ECF1';
  const type = concept.visual?.type;
  const iconKey = TYPE_MAP[type];
  if (iconKey && ICONS[iconKey]) {
    return `<div class="concept-visual" style="background: ${bg}; border: 1px solid ${border};">${ICONS[iconKey]}</div>`;
  }
  // Fallback: section emoji
  const emoji = SECTION_ICONS[concept.s] || '📘';
  return `<div class="concept-visual-emoji" style="background: ${bg}; border: 1px solid ${border};">${emoji}</div>`;
}

/** Convert hex (#RRGGBB) to rgba string */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
