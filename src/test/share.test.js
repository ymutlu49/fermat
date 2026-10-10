import { describe, it, expect } from 'vitest';
import { ALL_CONCEPTS } from '../data/concepts.js';
import {
  slugify, toHashtag, shareFileName, wrapLines, buildCaption, normalizeHandle,
} from '../utils/shareText.js';
import { buildZip, crc32 } from '../utils/zipStore.js';

describe('shareText', () => {
  it('slugifies Hawar letters to ASCII', () => {
    expect(slugify('HEJMARA XWEZAYÎ')).toBe('hejmara-xwezayi');
    expect(slugify('ZÊDETIR / KÊMTIR')).toBe('zedetir-kemtir');
    expect(slugify('ÇARGOŞE Û ŞEŞ')).toBe('cargose-u-ses');
  });

  it('produces a unique, ASCII-only file name for every concept', () => {
    const names = ALL_CONCEPTS.map((c, i) => shareFileName(c, 'post', '', i + 1));
    expect(new Set(names).size).toBe(names.length);
    names.forEach(n => expect(n).toMatch(/^fermat-\d{3}-[a-z0-9-]+-post\.png$/));
  });

  it('adds the suffix before the format', () => {
    expect(shareFileName({ ku: 'SIFIR' }, 'story', 'pirs')).toBe('fermat-sifir-pirs-story.png');
  });

  it('builds hashtags without spaces', () => {
    expect(toHashtag('KIRARÎYA DANEYAN')).toBe('#kirarîyadaneyan');
    expect(toHashtag('  ')).toBe('');
  });

  it('wraps on word boundaries and never splits a word', () => {
    const measure = text => text.length * 10;
    expect(wrapLines(measure, 'yek du sê çar', 70)).toEqual(['yek du', 'sê çar']);
    expect(wrapLines(measure, 'pergalabibingehadehî yek', 50)).toEqual(['pergalabibingehadehî', 'yek']);
    expect(wrapLines(measure, '   ', 50)).toEqual([]);
  });

  it('normalises the Instagram handle', () => {
    expect(normalizeHandle(' fermat ')).toBe('@fermat');
    expect(normalizeHandle('@@fer mat')).toBe('@fermat');
    expect(normalizeHandle('')).toBe('');
  });

  it('builds a caption from the concept text only', () => {
    const concept = ALL_CONCEPTS[0];
    const caption = buildCaption(concept, 'fermat');
    expect(caption.startsWith(concept.ku + '\n')).toBe(true);
    expect(caption).toContain(concept.df);
    expect(caption).toContain(concept.ex);
    expect(caption).toContain('#FerMat');
    expect(caption.endsWith('@fermat')).toBe(true);
    expect(buildCaption(concept)).not.toContain('@');
  });
});

describe('concept data encoding', () => {
  // Regression: 34 custom-visual icons shipped as mojibake ("?���").
  it('contains no replacement characters or "?"-only icons', () => {
    for (const c of ALL_CONCEPTS) {
      expect(JSON.stringify(c), c.ku).not.toContain('�');
      const icon = c.visual?.params?.icon;
      if (icon !== undefined) expect(icon, c.ku).not.toMatch(/^\?+$|\?$/);
    }
  });
});

describe('zipStore', () => {
  it('computes the standard CRC-32', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xCBF43926);
  });

  it('writes a readable store-only archive', () => {
    const data = new TextEncoder().encode('silav');
    const zip = buildZip([{ name: 'a.txt', data }, { name: 'têgeh.txt', data }]);
    const view = new DataView(zip.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    const eocd = zip.length - 22;
    expect(view.getUint32(eocd, true)).toBe(0x06054b50);
    expect(view.getUint16(eocd + 10, true)).toBe(2);
    const centralStart = view.getUint32(eocd + 16, true);
    expect(view.getUint32(centralStart, true)).toBe(0x02014b50);
    expect(centralStart + view.getUint32(eocd + 12, true)).toBe(eocd);
    // first entry: name then raw bytes
    expect(new TextDecoder().decode(zip.slice(30, 35))).toBe('a.txt');
    expect(new TextDecoder().decode(zip.slice(35, 40))).toBe('silav');
  });
});
