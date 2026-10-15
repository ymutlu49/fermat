// ─── FerMat — Renamed concept keys ──────────────────────────────
// Favourites and recents are stored in localStorage as `${ku}_${s}`, and
// flashcard (Leitner) progress as `flashcardBoxes[ku]`. When a headword is
// renamed, the stored key has to follow it, otherwise the user's heart and
// Leitner box for that concept silently disappear.
//
// Runs once at start-up (main.jsx), before the first render reads storage.
// Idempotent: once the old keys are gone it changes nothing.

/** Old concept.ku → new concept.ku (14 Ekim 2026 term decisions). */
export const RENAMED_KU = Object.freeze({
  'ŞÊWEYA HEJMARAN':       'ŞÊWEYÊ HEJMARAN',
  'KEMKIRIN':              'KÊMKIRIN',
  'KEMKIRINA LIREXHEV':    'KÊMKIRINA LI KÊLEKA HEV',
  'KEMKIRINA LIBINHEV':    'KÊMKIRINA DI BIN HEV DE',
  'KEMKIRINA BI STANDINÊ': 'KÊMKIRINA BI HÛRKIRINÊ',
  'KEMKIRINA BÊ STANDINÊ': 'KÊMKIRINA BÊ HÛRKIRIN',
  'PARÎNEK (÷)':           'PAREK (÷)',
  'ÇAREK':                 'ÇARYEK',
  'NEDÎYAR':               'NEDIYAR',
  // 14 Ekim, ikinci tur: işlem öğeleri, bozma (hûrkirin), yan yana / alt alta
  'KEMEK (−)':              'KÊMEK (−)',
  'KEMBAR':                 'KÊMEBAR',
  'KEMKER':                 'KÊMKER',
  'KEMOK':                  'KÊMOK',
  'ZÊDEKIRINA LIREXHEV':    'ZÊDEKIRINA LI KÊLEKA HEV',
  'ZÊDEKIRINA LIBINHEV':    'ZÊDEKIRINA DI BIN HEV DE',
  'KÊMKIRINA LIREXHEV':     'KÊMKIRINA LI KÊLEKA HEV',
  'KÊMKIRINA LIBINHEV':     'KÊMKIRINA DI BIN HEV DE',
  'KÊMKIRINA BI STANDINÊ':  'KÊMKIRINA BI HÛRKIRINÊ',
  'KÊMKIRINA BÊ STANDINÊ':  'KÊMKIRINA BÊ HÛRKIRIN',
  'CAREK (×)':              'CARÎNEK (×)',
  'PARAN':                  'PAROK',
  'PARÎNA BI JÊMA':         'PARKIRINA BI JÊMA',
  // Rêbera Rastnivîsînê: î + y → iy
  'DÎYARKIRINA RÊBAZÊ':    'DIYARKIRINA RÊBAZÊ',
  'YEKSANÎYA TEVPARAN':    'YEKSANIYA TEVPARAN',
});

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const STORAGE_KEYS = {
  favorites: 'ferhenga_favorites',
  recents:   'ferhenga_recents',
  progress:  'ferhenga_progress_v2',
};

/** `${ku}_${s}` → same entry with the new ku (or unchanged). */
function renameEntry(entry, map) {
  if (typeof entry !== 'string') return entry;
  const i = entry.lastIndexOf('_');
  if (i <= 0) return has(map, entry) ? map[entry] : entry;
  const ku = entry.slice(0, i);
  return has(map, ku) ? map[ku] + entry.slice(i) : entry;
}

/** Returns the renamed list, or null when nothing changed. */
export function renameKeyList(list, map = RENAMED_KU) {
  if (!Array.isArray(list)) return null;
  let changed = false;
  const out = [];
  for (const entry of list) {
    const next = renameEntry(entry, map);
    if (next !== entry) changed = true;
    if (out.includes(next)) { changed = true; continue; }
    out.push(next);
  }
  return changed ? out : null;
}

/** Returns the renamed box map, or null when nothing changed. */
export function renameBoxes(boxes, map = RENAMED_KU) {
  if (!boxes || typeof boxes !== 'object' || Array.isArray(boxes)) return null;
  let changed = false;
  const out = {};
  for (const [ku, box] of Object.entries(boxes)) {
    const next = has(map, ku) ? map[ku] : ku;
    if (next !== ku) changed = true;
    out[next] = has(out, next) ? Math.max(out[next], box) : box;
  }
  return changed ? out : null;
}

/**
 * Rewrite stored favourites, recents and flashcard boxes that still use an
 * old concept key. Never throws; returns true when storage was updated.
 */
export function migrateRenamedConcepts(storage = globalThis.localStorage, map = RENAMED_KU) {
  if (!storage) return false;
  let updated = false;
  const rewrite = (key, transform) => {
    try {
      const raw = storage.getItem(key);
      if (!raw) return;
      const next = transform(JSON.parse(raw));
      if (next === null) return;
      storage.setItem(key, JSON.stringify(next));
      updated = true;
    } catch { /* corrupt JSON or blocked storage — leave it as it is */ }
  };
  rewrite(STORAGE_KEYS.favorites, list => renameKeyList(list, map));
  rewrite(STORAGE_KEYS.recents,   list => renameKeyList(list, map));
  rewrite(STORAGE_KEYS.progress,  progress => {
    const boxes = renameBoxes(progress?.flashcardBoxes, map);
    return boxes ? { ...progress, flashcardBoxes: boxes } : null;
  });
  return updated;
}
