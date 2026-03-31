import { describe, it, expect, vi } from 'vitest';

// Mock window.open before importing
let capturedHTML = '';
vi.stubGlobal('open', vi.fn(() => ({
  document: {
    write: (html) => { capturedHTML = html; },
    close: () => {},
  },
})));

const { exportConceptsAsPDF } = await import('../utils/exportPDF.js');
const { ALL_CONCEPTS } = await import('../data/concepts.js');

describe('exportConceptsAsPDF - colorful', () => {
  it('generates HTML with rgba colors (not broken hex+suffix)', () => {
    capturedHTML = '';
    exportConceptsAsPDF(ALL_CONCEPTS.slice(0, 10));
    expect(capturedHTML.length).toBeGreaterThan(1000);
    // Must use rgba() for transparent colors, not hex+suffix like #EFF6FF15
    expect(capturedHTML).toContain('rgba(');
    // Should NOT contain broken 8-char hex like #EFF6FF15
    expect(capturedHTML).not.toMatch(/#[0-9A-Fa-f]{8,}/);
  });

  it('has gradient header', () => {
    expect(capturedHTML).toContain('linear-gradient(135deg, #0F4C5C');
  });

  it('section titles have colored backgrounds from SECTION_COLORS', () => {
    // Should have section-specific background colors like #EFF6FF, #FFF7ED, #ECFDF5
    expect(capturedHTML).toMatch(/section-title.*style=".*background:\s*#[A-Fa-f0-9]{6}/);
    expect(capturedHTML).toContain('border-left: 4px solid');
  });

  it('section titles have emoji icons', () => {
    expect(capturedHTML).toContain('section-icon');
  });

  it('concept cards have rgba background and border', () => {
    const cardStyles = capturedHTML.match(/concept-card" style="([^"]+)"/g) || [];
    expect(cardStyles.length).toBeGreaterThan(0);
    // Every card should have rgba background
    for (const style of cardStyles) {
      expect(style).toContain('rgba(');
    }
  });

  it('level badges have colored backgrounds', () => {
    const lvStyles = capturedHTML.match(/concept-lv" style="([^"]+)"/g) || [];
    expect(lvStyles.length).toBeGreaterThan(0);
    for (const style of lvStyles) {
      expect(style).toContain('rgba(');
    }
  });

  it('concept terms have section-specific text colors', () => {
    // Re-generate with concepts from multiple sections
    capturedHTML = '';
    const diverse = [];
    const seen = new Set();
    for (const c of ALL_CONCEPTS) {
      if (!seen.has(c.s)) { seen.add(c.s); diverse.push(c); }
      if (diverse.length >= 5) break;
    }
    exportConceptsAsPDF(diverse);
    const kuStyles = capturedHTML.match(/concept-ku" style="color:\s*([^"]+)"/g) || [];
    expect(kuStyles.length).toBeGreaterThan(0);
    const colors = new Set(kuStyles.map(s => s.match(/color:\s*([^"]+)/)?.[1]));
    expect(colors.size).toBeGreaterThan(1);
  });

  it('translations have accent colors', () => {
    const trStyles = capturedHTML.match(/concept-tr" style="color:\s*([^"]+)"/g) || [];
    expect(trStyles.length).toBeGreaterThan(0);
  });
});
