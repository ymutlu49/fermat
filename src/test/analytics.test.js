import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing analytics
const store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => { store[key] = value; }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { for (const key in store) delete store[key]; }),
};
vi.stubGlobal('localStorage', localStorageMock);

const { trackEvent, trackSession, getAnalyticsSummary, resetAnalytics } = await import('../utils/analytics.js');

describe('analytics', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('tracks events and increments count', () => {
    trackEvent('view:home');
    trackEvent('view:home');
    trackEvent('view:dict');
    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(3);
    expect(summary.topEvents.find(e => e.name === 'view:home').count).toBe(2);
  });

  it('tracks sessions', () => {
    trackSession();
    trackSession();
    const summary = getAnalyticsSummary();
    expect(summary.totalSessions).toBe(2);
  });

  it('resets all data', () => {
    trackEvent('test');
    trackSession();
    resetAnalytics();
    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBe(0);
    expect(summary.totalSessions).toBe(0);
  });
});
