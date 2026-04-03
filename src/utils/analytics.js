// ─── FerMat — Anonymous Local Analytics ──────────────────────────
// Tracks usage patterns locally (localStorage only, no external calls).
// Helps understand which features are used most for future improvements.

const STORAGE_KEY = 'ferhenga_analytics_v1';

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { events: {}, sessions: 0, firstSeen: Date.now() };
  } catch {
    return { events: {}, sessions: 0, firstSeen: Date.now() };
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* quota exceeded — silently skip */ }
}

/**
 * Track a user event (locally only).
 * @param {string} event - e.g. 'view:dict', 'quiz:complete', 'search:term'
 * @param {Object} [meta] - optional metadata
 */
export function trackEvent(event, meta = {}) {
  const store = getStore();
  if (!store.events[event]) {
    store.events[event] = { count: 0, lastAt: null };
  }
  store.events[event].count++;
  store.events[event].lastAt = Date.now();
  if (meta.detail) {
    store.events[event].lastDetail = meta.detail;
  }
  saveStore(store);
}

/** Record a new session start. */
export function trackSession() {
  const store = getStore();
  store.sessions++;
  store.lastSessionAt = Date.now();
  saveStore(store);
}

/** Get analytics summary for display in stats view. */
export function getAnalyticsSummary() {
  const store = getStore();
  const daysSinceFirst = Math.max(1, Math.floor((Date.now() - store.firstSeen) / 86400000));
  return {
    totalSessions: store.sessions,
    daysSinceFirst,
    topEvents: Object.entries(store.events)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data })),
    totalEvents: Object.values(store.events).reduce((sum, e) => sum + e.count, 0),
  };
}

/** Reset all analytics data. */
export function resetAnalytics() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: {}, sessions: 0, firstSeen: Date.now() }));
  } catch { /* ignore */ }
}
