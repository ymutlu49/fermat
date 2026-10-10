// ─── FerMat — Hîndarî question builder ──────────────────────────
// Turns dictionary concepts and the hand-written problem bank into uniform
// question objects. Pure apart from Math.random, so it is unit-testable and
// shared by the exercise view and the share cards.
import { EXERCISES } from '@data/exercises.js';
import { shuffle } from './helpers.js';

// ─── Cureyên pirsan ───────────────────────────────────────────────────────────
export const Q_TYPES = [
  { id: 'def_term',    label: 'Penase → Têgeh',     desc: 'Penaseyê bixwîne, têgeha rast hilbijêre', emoji: '📖' },
  { id: 'term_def',    label: 'Têgeh → Penase',     desc: 'Têgehê bibîne, penaseyê rast hilbijêre',  emoji: '🔍' },
  { id: 'ku_tr',       label: 'Kurdî → Tirkî',      desc: 'Têgeha Kurdî bi Tirkî bide',              emoji: '🔄' },
  { id: 'tr_ku',       label: 'Tirkî → Kurdî',      desc: 'Têgeha Tirkî bi Kurdî bide',              emoji: '🔁' },
  { id: 'en_ku',       label: 'Îngilîzî → Kurdî',   desc: 'Têgeha Îngilîzî bi Kurdî bide',           emoji: '🌍' },
  { id: 'ex_term',     label: 'Mînak → Têgeh',      desc: 'Mînak bixwîne, têgeha rast hilbijêre',    emoji: '💬' },
  { id: 'visual_term', label: 'Wêne → Têgeh',       desc: 'Li wêne binêre, têgeha rast hilbijêre',      emoji: '🖼️' },
  { id: 'true_false',  label: 'Rast an Xelet',      desc: 'Têgeh û penase: rast e an xelet e?',      emoji: '⚖️' },
  { id: 'math',        label: 'Pirsên Matematîkê',  desc: 'Pirsê bixwîne, bersiva rast hilbijêre',   emoji: '🧮' },
];

export const MATH_TYPE = 'math';

// The problem bank still numbers TÊGEHÊN PERWERDEYÎ as section 8; the
// dictionary moved it to 0.
const LEGACY_SECTION = { 8: 0 };

/** Hand-written problems in the same shape as generated questions. */
export const MATH_QUESTIONS = EXERCISES.map(e => ({
  type: MATH_TYPE,
  id: e.id,
  concept: null,
  s: LEGACY_SECTION[e.s] ?? e.s,
  lv: e.lv,
  q: e.q,
  hint: '',
  opts: e.opts,
  ans: e.ans,
  explain: e.explain,
}));

export function mathQuestionsFor(sectionId) {
  return sectionId === null || sectionId === undefined
    ? MATH_QUESTIONS
    : MATH_QUESTIONS.filter(q => q.s === sectionId);
}

/** Free-text label visuals and labelled position scenes would print the
 *  answer; plain drawn ones do not. */
export function hasDrawnVisual(concept) {
  const type = concept.visual?.type;
  return Boolean(type) && type !== 'none' && type !== 'custom' && type !== 'spatial';
}

function termChoice(concept, distractors, qType, fields) {
  const correct = concept.ku;
  const opts = shuffle([correct, ...distractors.map(d => d.ku)]);
  return { type: qType, concept, s: concept.s, opts, ans: opts.indexOf(correct), ...fields };
}

/**
 * Build one question about `concept`, or null when the type does not apply
 * (no example sentence, no English gloss, no drawn visual).
 */
export function buildQuestion(concept, allConcepts, qType, sectionPool) {
  // Xeletiyên pêşniyarkirî: pêşî ji heman beşê, paşê ji hemûyan
  const distractorPool = sectionPool.filter(c => c.ku !== concept.ku);
  const fallback = allConcepts.filter(c => c.ku !== concept.ku);
  const source = distractorPool.length >= 3 ? distractorPool : fallback;
  const distractors = shuffle(source).slice(0, 3);

  switch (qType) {
    case 'def_term':
      return termChoice(concept, distractors, qType, {
        q: concept.df,
        hint: 'Vê penaseyê xwedî kîjan têgeh e?',
        explain: `${concept.ku} — ${concept.tr}`,
      });
    case 'term_def': {
      const correct = concept.df;
      const opts = shuffle([correct, ...distractors.map(d => d.df)]);
      return {
        type: qType, concept, s: concept.s,
        q: concept.ku,
        hint: 'Penaseyê rast hilbijêre:',
        opts, ans: opts.indexOf(correct),
        explain: concept.df,
      };
    }
    case 'ku_tr': {
      const correct = concept.tr;
      const opts = shuffle([correct, ...distractors.map(d => d.tr)]);
      return {
        type: qType, concept, s: concept.s,
        q: concept.ku,
        hint: 'Bi Tirkî çawa tê gotin?',
        opts, ans: opts.indexOf(correct),
        explain: `${concept.ku} = ${concept.tr} (${concept.en})`,
      };
    }
    case 'tr_ku':
      return termChoice(concept, distractors, qType, {
        q: concept.tr,
        hint: 'Bi Kurdî çawa tê gotin?',
        explain: `${concept.tr} = ${concept.ku}`,
      });
    case 'en_ku':
      if (!concept.en) return null;
      return termChoice(concept, distractors, qType, {
        q: concept.en,
        hint: 'Bi Kurdî çawa tê gotin?',
        explain: `${concept.en} = ${concept.ku}`,
      });
    case 'ex_term':
      if (!concept.ex || concept.ex.trim().length < 5) return null;
      return termChoice(concept, distractors, qType, {
        q: concept.ex,
        hint: 'Ev mînak ji bo kîjan têgehê ye?',
        explain: `${concept.ku} — ${concept.df}`,
      });
    case 'visual_term':
      if (!hasDrawnVisual(concept)) return null;
      return termChoice(concept, distractors, qType, {
        q: '',
        visual: concept.visual,
        hint: 'Ev wêne kîjan têgehê nîşan dide?',
        explain: `${concept.ku} — ${concept.df}`,
      });
    case 'true_false': {
      const isTrue = Math.random() < 0.5;
      return {
        type: qType, concept, s: concept.s,
        q: concept.ku,
        sub: isTrue ? concept.df : distractors[0].df,
        hint: 'Ev penase rast e?',
        opts: ['Rast', 'Xelet'],
        ans: isTrue ? 0 : 1,
        explain: `${concept.ku} — ${concept.df}`,
      };
    }
    default:
      return null;
  }
}

/**
 * Build up to `count` questions. Each slot draws a random active type; the
 * hand-written bank is used without repeats and, once it runs dry for the
 * chosen section, the slot falls back to a concept question.
 *
 * @param {Array} concepts     concepts of the selected section (or all)
 * @param {Array} allConcepts
 * @param {string[]} activeTypes
 * @param {number} count
 * @param {number|null} [sectionId] null = every section
 */
export function generateQuestions(concepts, allConcepts, activeTypes, count, sectionId = null) {
  if (activeTypes.length === 0) return [];
  const conceptTypes = activeTypes.filter(t => t !== MATH_TYPE);
  const mathPool = activeTypes.includes(MATH_TYPE) ? shuffle(mathQuestionsFor(sectionId)) : [];
  const used = new Set();
  const questions = [];

  const nextConceptQuestion = (pool, distractorPool) => {
    for (const concept of pool) {
      if (used.has(concept.ku)) continue;
      // Try the types in random order so a concept without, say, a drawn
      // visual still yields a question of another active type.
      for (const typeId of shuffle(conceptTypes)) {
        const question = buildQuestion(concept, allConcepts, typeId, distractorPool);
        if (question) {
          used.add(concept.ku);
          return question;
        }
      }
    }
    return null;
  };

  const sectionOrder = shuffle(concepts);
  const globalOrder = shuffle(allConcepts);
  while (questions.length < count) {
    const wantsMath = activeTypes[Math.floor(Math.random() * activeTypes.length)] === MATH_TYPE;
    let question = wantsMath ? mathPool.pop() : null;
    if (!question && conceptTypes.length > 0) {
      // Eger beş têr neke, ji hemûyan zêde bike
      question = nextConceptQuestion(sectionOrder, concepts) || nextConceptQuestion(globalOrder, allConcepts);
    }
    if (!question) question = mathPool.pop();
    if (!question) break;
    questions.push(question);
  }
  return questions;
}
