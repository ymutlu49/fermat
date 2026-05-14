import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocale } from '../hooks/useLocale.js';
import { STRINGS, DEFAULT_LOCALE } from '../i18n/strings.js';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocale', () => {
  it('defaults to the configured locale', () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current.locale).toBe(DEFAULT_LOCALE);
  });

  it('resolves a string in the active locale', () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current.t('nav.home')).toBe(STRINGS.ku['nav.home']);
  });

  it('falls back to the default locale when a key is missing in the active one', () => {
    const { result } = renderHook(() => useLocale());
    act(() => { result.current.setLocale('en'); });
    // 'nav.home' is only defined in ku — should fall back to ku value
    expect(result.current.t('nav.home')).toBe(STRINGS.ku['nav.home']);
  });

  it('returns the key itself when missing in all locales', () => {
    const { result } = renderHook(() => useLocale());
    expect(result.current.t('totally.missing.key')).toBe('totally.missing.key');
  });

  it('interpolates {placeholders}', () => {
    const { result } = renderHook(() => useLocale());
    const out = result.current.t('stats.knownOf', { known: 5, total: 209 });
    expect(out).toContain('5');
    expect(out).toContain('209');
  });

  it('rejects unsupported locales silently', () => {
    const { result } = renderHook(() => useLocale());
    act(() => { result.current.setLocale('zz'); });
    expect(result.current.locale).toBe(DEFAULT_LOCALE);
  });
});
