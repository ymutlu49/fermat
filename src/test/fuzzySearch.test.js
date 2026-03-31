import { describe, it, expect } from 'vitest';
import { fuzzySearchConcepts, getDidYouMean, getAutocompleteSuggestions } from '../utils/fuzzySearch.js';
import { ALL_CONCEPTS } from '../data/concepts.js';

describe('fuzzySearchConcepts', () => {
  it('finds exact Kurdish term match', () => {
    const results = fuzzySearchConcepts(ALL_CONCEPTS, 'HEJMAR');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].concept.ku).toBe('HEJMAR');
    expect(results[0].matchField).toBe('ku');
  });

  it('finds Turkish translation match', () => {
    const results = fuzzySearchConcepts(ALL_CONCEPTS, 'sayı');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].concept.tr).toBe('sayı');
  });

  it('finds English translation match', () => {
    const results = fuzzySearchConcepts(ALL_CONCEPTS, 'number');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].concept.en).toBe('number');
  });

  it('is case-insensitive', () => {
    const upper = fuzzySearchConcepts(ALL_CONCEPTS, 'HEJMAR');
    const lower = fuzzySearchConcepts(ALL_CONCEPTS, 'hejmar');
    expect(upper.length).toBeGreaterThan(0);
    expect(lower.length).toBeGreaterThan(0);
    expect(upper[0].concept.ku).toBe(lower[0].concept.ku);
  });

  it('handles diacritic-insensitive search (î → i)', () => {
    const results = fuzzySearchConcepts(ALL_CONCEPTS, 'ciyometri');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty array for empty query', () => {
    expect(fuzzySearchConcepts(ALL_CONCEPTS, '')).toEqual([]);
    expect(fuzzySearchConcepts(ALL_CONCEPTS, null)).toEqual([]);
  });

  it('respects maxResults option', () => {
    const results = fuzzySearchConcepts(ALL_CONCEPTS, 'a', { maxResults: 5 });
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('returns scored results sorted by relevance', () => {
    const results = fuzzySearchConcepts(ALL_CONCEPTS, 'hejmar');
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});

describe('getDidYouMean', () => {
  it('suggests close matches for typos', () => {
    const suggestions = getDidYouMean(ALL_CONCEPTS, 'hejmer');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('returns empty for very short queries', () => {
    expect(getDidYouMean(ALL_CONCEPTS, 'a')).toEqual([]);
  });
});

describe('getAutocompleteSuggestions', () => {
  it('returns suggestions for partial input', () => {
    const suggestions = getAutocompleteSuggestions(ALL_CONCEPTS, 'hej');
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toHaveProperty('concept');
    expect(suggestions[0]).toHaveProperty('field');
  });
});
