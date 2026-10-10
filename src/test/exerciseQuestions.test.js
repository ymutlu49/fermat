import { describe, it, expect } from 'vitest';
import { ALL_CONCEPTS } from '../data/concepts.js';
import { SECTIONS } from '../data/sections.js';
import {
  Q_TYPES, MATH_TYPE, MATH_QUESTIONS, mathQuestionsFor, buildQuestion, generateQuestions, hasDrawnVisual,
} from '../utils/exerciseQuestions.js';
import { buildExerciseCaption, exerciseFileName } from '../utils/shareText.js';

const CONCEPT_TYPES = Q_TYPES.map(qt => qt.id).filter(id => id !== MATH_TYPE);

describe('problem bank', () => {
  it('has unique ids and well-formed entries in existing sections', () => {
    expect(new Set(MATH_QUESTIONS.map(q => q.id)).size).toBe(MATH_QUESTIONS.length);
    for (const q of MATH_QUESTIONS) {
      expect(q.s in SECTIONS, q.id).toBe(true);
      expect(q.opts, q.id).toHaveLength(4);
      expect(new Set(q.opts).size, q.id).toBe(4);
      expect(q.ans, q.id).toBeGreaterThanOrEqual(0);
      expect(q.ans, q.id).toBeLessThan(4);
      expect(q.q.trim(), q.id).not.toBe('');
      expect(q.explain.trim(), q.id).not.toBe('');
    }
  });

  it('filters by section and returns everything for null', () => {
    expect(mathQuestionsFor(null)).toHaveLength(MATH_QUESTIONS.length);
    expect(mathQuestionsFor(2).every(q => q.s === 2)).toBe(true);
    expect(mathQuestionsFor(2).length).toBeGreaterThan(0);
  });
});

describe('buildQuestion', () => {
  it('yields a consistent question for every applicable concept and type', () => {
    for (const typeId of CONCEPT_TYPES) {
      let built = 0;
      for (const concept of ALL_CONCEPTS) {
        const q = buildQuestion(concept, ALL_CONCEPTS, typeId, ALL_CONCEPTS);
        if (!q) continue;
        built += 1;
        expect(q.s).toBe(concept.s);
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThan(q.opts.length);
        expect(q.opts.every(o => typeof o === 'string' && o.length > 0), `${typeId} ${concept.ku}`).toBe(true);
      }
      expect(built, typeId).toBeGreaterThan(20);
    }
  });

  it('true/false offers exactly Rast and Xelet and marks the matching one', () => {
    const concept = ALL_CONCEPTS[0];
    for (let i = 0; i < 20; i++) {
      const q = buildQuestion(concept, ALL_CONCEPTS, 'true_false', ALL_CONCEPTS);
      expect(q.opts).toEqual(['Rast', 'Xelet']);
      expect(q.ans).toBe(q.sub === concept.df ? 0 : 1);
    }
  });

  it('visual questions never use label-only visuals', () => {
    for (const concept of ALL_CONCEPTS) {
      const q = buildQuestion(concept, ALL_CONCEPTS, 'visual_term', ALL_CONCEPTS);
      expect(Boolean(q)).toBe(hasDrawnVisual(concept));
      if (q) expect(q.visual.type).not.toBe('custom');
    }
  });
});

describe('generateQuestions', () => {
  it('fills the requested count without repeating a concept or a problem', () => {
    const all = Q_TYPES.map(qt => qt.id);
    for (let run = 0; run < 10; run++) {
      const qs = generateQuestions(ALL_CONCEPTS, ALL_CONCEPTS, all, 10, null);
      expect(qs).toHaveLength(10);
      const keys = qs.map(q => q.id || q.concept.ku);
      expect(new Set(keys).size).toBe(10);
    }
  });

  it('serves only the bank when math is the only active type', () => {
    const qs = generateQuestions([], ALL_CONCEPTS, [MATH_TYPE], 10, 9);
    expect(qs.length).toBe(Math.min(10, mathQuestionsFor(9).length));
    expect(qs.every(q => q.type === MATH_TYPE && q.s === 9)).toBe(true);
  });

  it('returns nothing without active types', () => {
    expect(generateQuestions(ALL_CONCEPTS, ALL_CONCEPTS, [], 10)).toEqual([]);
  });
});

describe('exercise share text', () => {
  const question = MATH_QUESTIONS.find(q => q.id === 'k03');

  it('names both slides', () => {
    expect(exerciseFileName(question, 'post', 'pirs', 5)).toBe('fermat-hindari-005-k03-pirs-post.png');
    expect(exerciseFileName(question, 'story', 'bersiv')).toBe('fermat-hindari-k03-bersiv-story.png');
  });

  it('lists the options but not the explanation', () => {
    const caption = buildExerciseCaption(question, 'fermat');
    expect(caption).toContain(question.q);
    question.opts.forEach((opt, i) => expect(caption).toContain(`${'ABCD'[i]}) ${opt}`));
    expect(caption).not.toContain(question.explain);
    expect(caption).toContain('#hîndarî');
  });
});
