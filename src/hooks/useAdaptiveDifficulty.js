import { useCallback } from 'react';
import { usePersistedState } from './usePersistedState.js';

const LEVEL_MAP = {
  1: ['P', 'P-1', '1'],
  2: ['P-1', '1', '1-2', '2'],
  3: ['2', '2-3', '3', '3-4', '4', '4+'],
};

/**
 * Leitner-informed adaptive difficulty that adjusts based on recent answer accuracy.
 * @returns {{ difficulty: number, recordAnswer: Function, getCandidateConcepts: Function }}
 */
export function useAdaptiveDifficulty() {
  const [diffState, setDiffState] = usePersistedState('ferhenga_difficulty', {
    level: 1,
    recentAnswers: [],
  });

  const recordAnswer = useCallback((isCorrect) => {
    setDiffState(prev => {
      const recent = [...prev.recentAnswers, isCorrect].slice(-10);
      const rate   = recent.filter(Boolean).length / recent.length;
      let level    = prev.level;
      if (rate >= 0.8 && recent.length >= 5) level = Math.min(3, level + 1);
      else if (rate < 0.4 && recent.length >= 5) level = Math.max(1, level - 1);
      return { level, recentAnswers: recent };
    });
  }, [setDiffState]);

  const getCandidateConcepts = useCallback((allConcepts, progress) => {
    const targets = LEVEL_MAP[diffState.level] || LEVEL_MAP[1];
    const filtered = allConcepts.filter(c => targets.includes(c.lv));
    const boxes    = (progress || {}).flashcardBoxes || {};
    return filtered.sort((a, b) => (boxes[a.ku] || 0) - (boxes[b.ku] || 0));
  }, [diffState.level]);

  return { difficulty: diffState.level, recordAnswer, getCandidateConcepts };
}
