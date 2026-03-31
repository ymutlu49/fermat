import { useCallback } from 'react';
import { THEME } from '@data';
import { usePersistedState } from './usePersistedState.js';

/**
 * @returns {{ theme: Object, isDark: boolean, themeMode: string, toggleTheme: Function }}
 */
export function useTheme() {
  const [themeMode, setThemeMode] = usePersistedState('ferhenga_theme', 'light');
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const theme      = isDark ? THEME.dark : THEME.light;
  const toggleTheme = useCallback(() => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, [setThemeMode]);
  return { theme, isDark, themeMode, toggleTheme };
}
