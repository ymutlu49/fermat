import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom 29 + vitest 4 ship a partial localStorage stub that's missing methods.
// Provide a clean, deterministic mock for every test so persistence tests work.
const __store = {};
const localStorageMock = {
  getItem:    (key) => (key in __store ? __store[key] : null),
  setItem:    (key, value) => { __store[key] = String(value); },
  removeItem: (key) => { delete __store[key]; },
  clear:      () => { for (const k of Object.keys(__store)) delete __store[k]; },
  key:        (i) => Object.keys(__store)[i] ?? null,
  get length() { return Object.keys(__store).length; },
};
vi.stubGlobal('localStorage', localStorageMock);

