// ─── Ferhenga Matematîkê — Pure Utility Functions ───────────────────────────
import { SECTIONS, SECTION_COLORS } from '@data';

/** Fisher-Yates shuffle — returns new array */
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Levenshtein edit distance between two strings */
export function levenshtein(source, target) {
  const s = source.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (s === t) return 0;
  const m = s.length, n = t.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s[i - 1] === t[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Filter and sort concepts by query, section, and sort mode.
 * @param {import('@data').Concept[]} concepts
 * @param {string} searchQuery
 * @param {number|null} sectionId - null = all
 * @param {'section'|'az'|'level'} sortMode
 */
export function filterConcepts(concepts, searchQuery, sectionId, sortMode) {
  const query = searchQuery.toLowerCase().trim();
  let result = concepts.filter(concept => {
    const matchesSection = sectionId === null || concept.s === sectionId;
    if (!matchesSection) return false;
    if (!query) return true;
    return (
      concept.ku.toLowerCase().includes(query) ||
      concept.tr.toLowerCase().includes(query) ||
      concept.en.toLowerCase().includes(query) ||
      concept.df.toLowerCase().includes(query)
    );
  });
  if (sortMode === 'az') {
    result = [...result].sort((a, b) => a.ku.localeCompare(b.ku, 'tr'));
  } else if (sortMode === 'level') {
    const levelOrder = { 'P': 0, 'P-1': 1, '1': 2, '1-2': 3, '2': 4, '2-3': 5, '3': 6, '3-4': 7, '4': 8, '4+': 9 };
    result = [...result].sort((a, b) => (levelOrder[a.lv] ?? 5) - (levelOrder[b.lv] ?? 5));
  }
  return result;
}

/** Map level string to semantic color token */
export function getLevelColor(level) {
  const colors = {
    'P': '#8B5CF6', 'P-1': '#8B5CF6',
    '1': '#10B981', '1-2': '#10B981',
    '2': '#3B82F6', '2-3': '#3B82F6',
    '3': '#F59E0B', '3-4': '#F59E0B',
    '4': '#EF4444', '4+': '#EF4444',
  };
  return colors[level] || '#94A3B8';
}

/** Retrieve the section-specific color palette */
export function getSectionColor(sectionId, isDark) {
  const index = SECTIONS[sectionId]?.colorIndex ?? 0;
  return isDark ? SECTION_COLORS.dark[index] : SECTION_COLORS.light[index];
}
