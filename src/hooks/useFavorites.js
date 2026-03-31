// ─── Ferhenga Matematîkê — Favorites Hook ───────────────────────────────────
import { useCallback, useMemo } from 'react';
import { usePersistedState } from './usePersistedState.js';

/**
 * Manages user's favorite concepts and recently viewed concepts.
 */
export function useFavorites() {
  const [favorites, setFavorites] = usePersistedState('ferhenga_favorites', []);
  const [recents, setRecents] = usePersistedState('ferhenga_recents', []);

  // ── Favorites ─────────────────────────────────────────────────────────
  const toggleFavorite = useCallback((conceptKey) => {
    setFavorites(prev =>
      prev.includes(conceptKey)
        ? prev.filter(k => k !== conceptKey)
        : [...prev, conceptKey]
    );
  }, [setFavorites]);

  const isFavorite = useCallback((conceptKey) => {
    return favorites.includes(conceptKey);
  }, [favorites]);

  const favoriteCount = favorites.length;

  // ── Recents ───────────────────────────────────────────────────────────
  const addRecent = useCallback((conceptKey) => {
    setRecents(prev => {
      const filtered = prev.filter(k => k !== conceptKey);
      return [conceptKey, ...filtered].slice(0, 20); // keep last 20
    });
  }, [setRecents]);

  return {
    favorites,
    recents,
    toggleFavorite,
    isFavorite,
    favoriteCount,
    addRecent,
  };
}
