// ─── Ferhenga Matematîkê — Fuzzy Search Engine ──────────────────────────────

/**
 * Lightweight fuzzy search for Kurdish/Turkish/English math terms.
 * No external dependencies — uses Levenshtein distance + substring matching.
 */

// ── Levenshtein distance ────────────────────────────────────────────────────
function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

// ── Normalize Kurdish text (strip diacritics for matching) ──────────────────
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/î/g, 'i')
    .replace(/ê/g, 'e')
    .replace(/û/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g');
}

/**
 * Search concepts with fuzzy matching.
 * Returns scored results sorted by relevance.
 *
 * @param {Array} concepts - Array of concept objects
 * @param {string} query - Search query
 * @param {Object} options - { maxResults, threshold }
 * @returns {Array} - [{ concept, score, matchField }]
 */
export function fuzzySearchConcepts(concepts, query, options = {}) {
  const { maxResults = 30, threshold = 0.4 } = options;
  if (!query || query.length < 1) return [];

  const q = query.toLowerCase().trim();
  const qNorm = normalize(q);
  const results = [];

  for (const concept of concepts) {
    let bestScore = 0;
    let matchField = '';

    // Check each searchable field with different weights
    const fields = [
      { key: 'ku', text: concept.ku, weight: 1.0 },
      { key: 'tr', text: concept.tr, weight: 0.9 },
      { key: 'en', text: concept.en, weight: 0.85 },
      { key: 'df', text: concept.df, weight: 0.5 },
    ];

    for (const field of fields) {
      if (!field.text) continue;
      const text = field.text.toLowerCase();
      const textNorm = normalize(field.text);

      // Exact match (highest score)
      if (text === q || textNorm === qNorm) {
        bestScore = Math.max(bestScore, 1.0 * field.weight);
        matchField = field.key;
        continue;
      }

      // Starts with (very high score)
      if (text.startsWith(q) || textNorm.startsWith(qNorm)) {
        bestScore = Math.max(bestScore, 0.95 * field.weight);
        matchField = matchField || field.key;
        continue;
      }

      // Contains (high score)
      if (text.includes(q) || textNorm.includes(qNorm)) {
        bestScore = Math.max(bestScore, 0.8 * field.weight);
        matchField = matchField || field.key;
        continue;
      }

      // Fuzzy match on first word (for short queries)
      if (q.length >= 2) {
        const firstWord = text.split(/\s+/)[0];
        const dist = levenshteinDistance(qNorm, normalize(firstWord));
        const maxLen = Math.max(qNorm.length, firstWord.length);
        const similarity = 1 - (dist / maxLen);
        if (similarity >= 0.6) {
          const score = similarity * 0.7 * field.weight;
          if (score > bestScore) {
            bestScore = score;
            matchField = field.key;
          }
        }
      }
    }

    if (bestScore >= threshold) {
      results.push({ concept, score: bestScore, matchField });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

/**
 * Get "did you mean" suggestions when no results found.
 * @param {Array} concepts
 * @param {string} query
 * @returns {Array} - top 3 closest matches
 */
export function getDidYouMean(concepts, query) {
  if (!query || query.length < 2) return [];
  return fuzzySearchConcepts(concepts, query, { maxResults: 3, threshold: 0.25 })
    .map(r => r.concept);
}

/**
 * Get autocomplete suggestions while typing.
 * @param {Array} concepts
 * @param {string} query
 * @returns {Array} - top 6 suggestions
 */
export function getAutocompleteSuggestions(concepts, query) {
  if (!query || query.length < 1) return [];
  return fuzzySearchConcepts(concepts, query, { maxResults: 6, threshold: 0.5 })
    .map(r => ({ concept: r.concept, field: r.matchField }));
}
