import { useCallback, useMemo } from 'react';
import { usePersistedState } from './usePersistedState.js';
import { STRINGS, DEFAULT_LOCALE, SUPPORTED_LOCALES, interpolate } from '@/i18n/strings.js';

/**
 * Active-locale hook with key-based string lookup and fallback.
 *
 *   const { t, locale, setLocale } = useLocale();
 *   t('nav.home')                       → 'Malper'
 *   t('stats.knownOf', { known: 5, total: 209 })
 *
 * Lookup order: current locale → DEFAULT_LOCALE → the key itself.
 * Missing translations show the Kurmancî string rather than throwing.
 */
export function useLocale() {
  const [locale, setLocaleState] = usePersistedState('ferhenga_locale', DEFAULT_LOCALE);

  const setLocale = useCallback((next) => {
    if (SUPPORTED_LOCALES.includes(next)) setLocaleState(next);
  }, [setLocaleState]);

  const t = useCallback((key, vars) => {
    const fromActive = STRINGS[locale]?.[key];
    const fromFallback = STRINGS[DEFAULT_LOCALE]?.[key];
    const template = fromActive ?? fromFallback ?? key;
    return interpolate(template, vars);
  }, [locale]);

  return useMemo(() => ({ t, locale, setLocale }), [t, locale, setLocale]);
}
