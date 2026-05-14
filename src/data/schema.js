// ─── FerMat — Concept schema + runtime validator ────────────────
// Tiny dependency-free validator that documents the shape of a Concept
// and catches malformed entries at test time (and optionally at boot).
//
// Why no Zod: the project ships only react + react-dom as runtime deps.
// Validation here is a single function — keeping the bundle untouched
// matters more than fancy schema combinators.

import { SECTIONS } from './sections.js';

/**
 * @typedef {Object} Concept
 * @property {string} ku     Kurdish (Kurmancî) term (uppercase by convention)
 * @property {string} tr     Turkish translation
 * @property {string} en     English translation
 * @property {string} lv     Grade level: 'P','P-1','1','1-2','2','2-3','3','3-4','4','4+'
 * @property {string} df     Definition (Kurdish)
 * @property {string} ex     Example sentence (Kurdish)
 * @property {number} s      Section ID — must exist in SECTIONS
 * @property {Object} [visual]            Optional visualisation spec
 * @property {string} visual.type         e.g. 'number_line', 'fraction', 'geometry'
 * @property {Object} [visual.params]     Type-specific parameters
 */

// Levels accept:
//   • 'P'            — preschool only
//   • 'P-<grade>'    — preschool through grade N (e.g. 'P-1', 'P-4')
//   • '<n>'          — single grade (e.g. '1', '2', '3', '4')
//   • '<n>-<m>'      — multi-grade span (e.g. '1-2', '2-4')
//   • '<n>+'         — grade N and beyond (e.g. '4+')
const LEVEL_PATTERN = /^(P(-\d)?|\d(-\d)?|\d\+)$/;

/**
 * Validate a single concept. Returns an array of error strings (empty = OK).
 * @param {unknown} c
 * @param {number} index For richer error messages
 * @returns {string[]}
 */
export function validateConcept(c, index = -1) {
  const errors = [];
  const where = index >= 0 ? `concept[${index}]` : 'concept';

  if (!c || typeof c !== 'object') {
    return [`${where}: not an object`];
  }
  const { ku, tr, en, lv, df, ex, s, visual } = /** @type {any} */ (c);

  if (typeof ku !== 'string' || !ku.trim()) errors.push(`${where}.ku: missing or empty`);
  if (typeof tr !== 'string' || !tr.trim()) errors.push(`${where} (${ku}).tr: missing or empty`);
  if (typeof en !== 'string')              errors.push(`${where} (${ku}).en: not a string`);
  if (typeof df !== 'string' || !df.trim()) errors.push(`${where} (${ku}).df: missing or empty`);
  if (typeof ex !== 'string')              errors.push(`${where} (${ku}).ex: not a string`);

  if (typeof lv !== 'string' || !LEVEL_PATTERN.test(lv)) {
    errors.push(`${where} (${ku}).lv: invalid level "${lv}" — expected pattern P|P-N|N|N-M|N+`);
  }

  if (typeof s !== 'number' || !Number.isInteger(s)) {
    errors.push(`${where} (${ku}).s: not an integer (${s})`);
  } else if (!(s in SECTIONS)) {
    errors.push(`${where} (${ku}).s: ${s} is not a defined section`);
  }

  if (visual !== undefined) {
    if (typeof visual !== 'object' || visual === null) {
      errors.push(`${where} (${ku}).visual: present but not an object`);
    } else if (typeof visual.type !== 'string' || !visual.type) {
      errors.push(`${where} (${ku}).visual.type: missing or not a string`);
    } else if (visual.params !== undefined && (typeof visual.params !== 'object' || visual.params === null)) {
      errors.push(`${where} (${ku}).visual.params: present but not an object`);
    }
  }

  return errors;
}

/**
 * Validate the entire concept array. Returns { ok, errors }.
 * @param {unknown[]} concepts
 */
export function validateAllConcepts(concepts) {
  const errors = [];
  if (!Array.isArray(concepts)) {
    return { ok: false, errors: ['ALL_CONCEPTS is not an array'] };
  }
  for (let i = 0; i < concepts.length; i++) {
    errors.push(...validateConcept(concepts[i], i));
  }
  return { ok: errors.length === 0, errors };
}
