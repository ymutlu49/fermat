import { describe, it, expect } from 'vitest';
import { ALL_CONCEPTS } from '../data/concepts.js';
import { SECTIONS } from '../data/sections.js';

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
});
