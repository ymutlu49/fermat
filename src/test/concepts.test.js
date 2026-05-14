import { describe, it, expect } from 'vitest';
import { ALL_CONCEPTS } from '../data/concepts.js';
import { SECTIONS } from '../data/sections.js';
import { ACHIEVEMENTS } from '../data/gamification.js';
import { validateAllConcepts, validateConcept } from '../data/schema.js';

describe('ALL_CONCEPTS data integrity', () => {
  it('has more than 200 concepts', () => {
    expect(ALL_CONCEPTS.length).toBeGreaterThan(200);
  });

  it('every concept has required fields', () => {
    for (const c of ALL_CONCEPTS) {
      expect(c).toHaveProperty('ku');
      expect(c).toHaveProperty('tr');
      expect(c).toHaveProperty('en');
      expect(c).toHaveProperty('lv');
      expect(c).toHaveProperty('df');
      expect(c).toHaveProperty('s');
      expect(typeof c.ku).toBe('string');
      expect(c.ku.length).toBeGreaterThan(0);
      expect(typeof c.tr).toBe('string');
      expect(typeof c.en).toBe('string');
    }
  });

  it('every concept references a valid section', () => {
    const sectionIds = new Set(Object.keys(SECTIONS).map(Number));
    for (const c of ALL_CONCEPTS) {
      expect(sectionIds.has(c.s)).toBe(true);
    }
  });

  it('has mostly unique Kurdish terms (duplicates < 5%)', () => {
    const kuSet = new Set();
    let dupes = 0;
    for (const c of ALL_CONCEPTS) {
      if (kuSet.has(c.ku)) dupes++;
      kuSet.add(c.ku);
    }
    expect(dupes / ALL_CONCEPTS.length).toBeLessThan(0.05);
  });

  it('every concept has a non-empty level string', () => {
    for (const c of ALL_CONCEPTS) {
      expect(typeof c.lv).toBe('string');
      expect(c.lv.length).toBeGreaterThan(0);
    }
  });
});

describe('SECTIONS', () => {
  it('has at least 10 sections', () => {
    expect(Object.keys(SECTIONS).length).toBeGreaterThanOrEqual(10);
  });

  it('every section has name and short fields', () => {
    for (const [, sec] of Object.entries(SECTIONS)) {
      expect(sec).toHaveProperty('name');
      expect(sec).toHaveProperty('short');
    }
  });

  it('every section has a colorIndex within 0–9', () => {
    for (const [, sec] of Object.entries(SECTIONS)) {
      expect(typeof sec.colorIndex).toBe('number');
      expect(sec.colorIndex).toBeGreaterThanOrEqual(0);
      expect(sec.colorIndex).toBeLessThanOrEqual(9);
    }
  });
});

describe('schema validation', () => {
  it('every concept in ALL_CONCEPTS passes validateConcept', () => {
    const { ok, errors } = validateAllConcepts(ALL_CONCEPTS);
    if (!ok) {
      // Surface first few errors in the failure message for fast debugging
      throw new Error(`Schema errors (${errors.length}):\n` + errors.slice(0, 10).join('\n'));
    }
    expect(ok).toBe(true);
  });

  it('rejects a concept missing required fields', () => {
    const errors = validateConcept({ ku: 'X' });
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an invalid level value', () => {
    const errors = validateConcept(
      { ku: 'X', tr: 'x', en: 'x', lv: '99', df: 'd', ex: '', s: 1 }
    );
    expect(errors.some(e => e.includes('lv'))).toBe(true);
  });

  it('rejects a section id not present in SECTIONS', () => {
    const errors = validateConcept(
      { ku: 'X', tr: 'x', en: 'x', lv: '1', df: 'd', ex: '', s: 99 }
    );
    expect(errors.some(e => e.includes('.s:'))).toBe(true);
  });
});

describe('ACHIEVEMENTS', () => {
  it('all_words threshold tracks ALL_CONCEPTS.length (no hardcoded magic number)', () => {
    const allWords = ACHIEVEMENTS.find(a => a.id === 'all_words');
    expect(allWords).toBeDefined();
    // Should unlock exactly when knownCount reaches the current dictionary size
    expect(allWords.condition({ knownCount: ALL_CONCEPTS.length })).toBe(true);
    expect(allWords.condition({ knownCount: ALL_CONCEPTS.length - 1 })).toBe(false);
  });

  it('every achievement has a working condition function', () => {
    for (const a of ACHIEVEMENTS) {
      expect(typeof a.condition).toBe('function');
      // Empty progress shouldn't crash
      expect(() => a.condition({})).not.toThrow();
    }
  });
});
