import { describe, it, expect } from 'vitest';
import { ALL_CONCEPTS } from '../data/concepts.js';
import { SYLLABLES, RELATED_CONCEPTS } from '../data/conceptMeta.js';
import {
  RENAMED_KU, renameKeyList, renameBoxes, migrateRenamedConcepts,
} from '../utils/renamedConcepts.js';

const KU = new Set(ALL_CONCEPTS.map(c => c.ku));

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    dump: () => Object.fromEntries(data),
  };
}

describe('concept key consistency', () => {
  it('every renamed key points at an existing concept, and the old key is gone', () => {
    for (const [oldKu, newKu] of Object.entries(RENAMED_KU)) {
      expect(KU.has(newKu), newKu).toBe(true);
      expect(KU.has(oldKu), oldKu).toBe(false);
    }
  });

  it('SYLLABLES keys all name existing concepts', () => {
    expect(Object.keys(SYLLABLES).filter(k => !KU.has(k))).toEqual([]);
  });

  it('RELATED_CONCEPTS keys and targets all name existing concepts', () => {
    const unknown = [];
    for (const [k, targets] of Object.entries(RELATED_CONCEPTS)) {
      if (!KU.has(k)) unknown.push(k);
      for (const t of targets) if (!KU.has(t)) unknown.push(`${k} → ${t}`);
    }
    expect(unknown).toEqual([]);
  });

  it('NÎGARA XALAN (dot plot) follows NÎGARA TIŞTAN in the data section', () => {
    const i = ALL_CONCEPTS.findIndex(c => c.ku === 'NÎGARA TIŞTAN');
    const dot = ALL_CONCEPTS[i + 1];
    expect(dot.ku).toBe('NÎGARA XALAN');
    expect(dot.s).toBe(6);
    expect(dot.lv).toBe('3-4');
  });
});

describe('renamed concept migration', () => {
  it('renames `${ku}_${s}` entries and drops duplicates', () => {
    expect(renameKeyList(['ÇAREK_3', 'SIFIR_1', 'ÇARYEK_3'])).toEqual(['ÇARYEK_3', 'SIFIR_1']);
    expect(renameKeyList(['SIFIR_1', 'XAL_4'])).toBeNull();
    expect(renameKeyList('not a list')).toBeNull();
  });

  it('renames flashcard boxes, keeping the higher box on collision', () => {
    expect(renameBoxes({ KEMKIRIN: 2, SIFIR: 1 })).toEqual({ KÊMKIRIN: 2, SIFIR: 1 });
    expect(renameBoxes({ 'NEDÎYAR': 1, NEDIYAR: 2 })).toEqual({ NEDIYAR: 2 });
    expect(renameBoxes({ SIFIR: 1 })).toBeNull();
  });

  it('migrates stored favourites, recents and progress once', () => {
    const storage = memoryStorage({
      ferhenga_favorites: JSON.stringify(['PARÎNEK (÷)_2', 'SIFIR_1']),
      ferhenga_recents: JSON.stringify(['ŞÊWEYA HEJMARAN_1']),
      ferhenga_progress_v2: JSON.stringify({ flashcardBoxes: { ÇAREK: 2 }, totalQuestions: 5 }),
    });
    expect(migrateRenamedConcepts(storage)).toBe(true);
    const after = storage.dump();
    expect(JSON.parse(after.ferhenga_favorites)).toEqual(['PAREK (÷)_2', 'SIFIR_1']);
    expect(JSON.parse(after.ferhenga_recents)).toEqual(['ŞÊWEYÊ HEJMARAN_1']);
    expect(JSON.parse(after.ferhenga_progress_v2)).toEqual({ flashcardBoxes: { ÇARYEK: 2 }, totalQuestions: 5 });
    expect(migrateRenamedConcepts(storage)).toBe(false);
  });

  it('never throws on empty, corrupt or missing storage', () => {
    expect(migrateRenamedConcepts(memoryStorage())).toBe(false);
    expect(migrateRenamedConcepts(memoryStorage({ ferhenga_favorites: '{broken' }))).toBe(false);
    expect(migrateRenamedConcepts(null)).toBe(false);
  });
});
