// ─── FerMat — Minimal ZIP writer (store only, no compression) ───
// PNGs are already compressed, so "store" loses nothing and keeps this to a
// few dozen lines instead of a zip dependency. Names are written as UTF-8
// (general-purpose bit 11).

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const UTF8_FLAG = 0x0800;
// Fixed DOS timestamp (1980-01-01 00:00) — archives stay byte-identical for
// identical input, which keeps the tests deterministic.
const DOS_TIME = 0;
const DOS_DATE = 0x0021;

/**
 * @param {{ name: string, data: Uint8Array }[]} files
 * @returns {Uint8Array} the complete archive
 */
export function buildZip(files) {
  const encoder = new TextEncoder();
  const entries = files.map(f => ({ name: encoder.encode(f.name), data: f.data, crc: crc32(f.data) }));

  const localSize = entries.reduce((sum, e) => sum + 30 + e.name.length + e.data.length, 0);
  const centralSize = entries.reduce((sum, e) => sum + 46 + e.name.length, 0);
  const out = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(out.buffer);

  let offset = 0;
  const offsets = [];
  for (const e of entries) {
    offsets.push(offset);
    view.setUint32(offset, 0x04034b50, true);
    view.setUint16(offset + 4, 20, true);            // version needed
    view.setUint16(offset + 6, UTF8_FLAG, true);
    view.setUint16(offset + 8, 0, true);             // method: store
    view.setUint16(offset + 10, DOS_TIME, true);
    view.setUint16(offset + 12, DOS_DATE, true);
    view.setUint32(offset + 14, e.crc, true);
    view.setUint32(offset + 18, e.data.length, true);
    view.setUint32(offset + 22, e.data.length, true);
    view.setUint16(offset + 26, e.name.length, true);
    view.setUint16(offset + 28, 0, true);
    out.set(e.name, offset + 30);
    out.set(e.data, offset + 30 + e.name.length);
    offset += 30 + e.name.length + e.data.length;
  }

  const centralStart = offset;
  entries.forEach((e, i) => {
    view.setUint32(offset, 0x02014b50, true);
    view.setUint16(offset + 4, 20, true);            // version made by
    view.setUint16(offset + 6, 20, true);            // version needed
    view.setUint16(offset + 8, UTF8_FLAG, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, DOS_TIME, true);
    view.setUint16(offset + 14, DOS_DATE, true);
    view.setUint32(offset + 16, e.crc, true);
    view.setUint32(offset + 20, e.data.length, true);
    view.setUint32(offset + 24, e.data.length, true);
    view.setUint16(offset + 28, e.name.length, true);
    // extra, comment, disk, internal attrs, external attrs stay 0
    view.setUint32(offset + 42, offsets[i], true);
    out.set(e.name, offset + 46);
    offset += 46 + e.name.length;
  });

  view.setUint32(offset, 0x06054b50, true);
  view.setUint16(offset + 8, entries.length, true);
  view.setUint16(offset + 10, entries.length, true);
  view.setUint32(offset + 12, centralSize, true);
  view.setUint32(offset + 16, centralStart, true);
  return out;
}
