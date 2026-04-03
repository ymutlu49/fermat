// ─── FerMat — PDF Export Utility (Colorful Edition) ─────────────
// Generates a printable HTML page with visuals — a pictorial math dictionary.
// Each section uses its own vibrant color palette from SECTION_COLORS.

import { SECTIONS } from '@data/sections.js';
import { SECTION_COLORS } from '@data/theme.js';
import { getConceptVisualHTML } from './pdfVisuals.js';

/** Get section color palette for PDF (always light mode) */
function getSectionPalette(sectionId) {
  const sec = SECTIONS[sectionId];
  if (!sec) return SECTION_COLORS.light[0];
  return SECTION_COLORS.light[sec.colorIndex] || SECTION_COLORS.light[0];
}

/** Convert hex (#RRGGBB) to rgba string */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Export selected concepts as a printable illustrated dictionary page.
 * Opens a new window with formatted content and triggers print.
 *
 * @param {Array} concepts - Array of concept objects to export
 * @param {string} title - Page title
 */
export function exportConceptsAsPDF(concepts, title = 'FerMat — Ferhenga Wêneyî ya Matematîkê') {
  const grouped = {};
  const groupSectionIds = {};
  concepts.forEach(c => {
    const sectionName = SECTIONS[c.s]?.name || 'Din';
    if (!grouped[sectionName]) {
      grouped[sectionName] = [];
      groupSectionIds[sectionName] = c.s;
    }
    grouped[sectionName].push(c);
  });

  const html = `<!DOCTYPE html>
<html lang="ku" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      color: #1A2332;
      padding: 24px;
      line-height: 1.5;
      background: #FFFFFF;
    }

    /* ── Header ── */
    .header {
      text-align: center;
      margin-bottom: 28px;
      padding: 20px 16px;
      background: linear-gradient(135deg, #0F4C5C 0%, #1A6B7F 100%);
      border-radius: 12px;
      color: #FFFFFF;
    }
    .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; color: #FFFFFF; }
    .header .subtitle { font-size: 13px; color: rgba(255,255,255,0.85); font-style: italic; margin-bottom: 6px; }
    .header p { font-size: 11px; color: rgba(255,255,255,0.7); }

    /* ── Section Titles ── */
    .section-title {
      font-size: 15px;
      font-weight: 800;
      margin: 24px 0 12px;
      padding: 8px 14px;
      border-radius: 8px;
      page-break-after: avoid;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-icon {
      font-size: 18px;
    }

    /* ── Card Grid ── */
    .concept-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .concept-card {
      border-radius: 10px;
      padding: 10px 12px;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      gap: 10px;
    }

    /* ── Visual Box ── */
    .concept-visual {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70px;
      min-height: 48px;
      border-radius: 8px;
      padding: 4px;
    }
    .concept-visual svg {
      max-width: 60px;
      max-height: 42px;
      shape-rendering: geometricPrecision;
      text-rendering: optimizeLegibility;
    }
    .concept-visual-emoji {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      min-height: 48px;
      font-size: 28px;
      border-radius: 8px;
    }

    /* ── Content ── */
    .concept-content { flex: 1; min-width: 0; }
    .concept-ku { font-size: 13px; font-weight: 800; margin-bottom: 1px; }
    .concept-tr { font-size: 10px; margin-bottom: 3px; }
    .concept-df { font-size: 10px; color: #1A2332; line-height: 1.45; }
    .concept-ex { font-size: 9px; font-style: italic; margin-top: 3px; }
    .concept-lv {
      display: inline-block;
      font-size: 8px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      margin-bottom: 3px;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      margin-top: 28px;
      padding-top: 14px;
      border-top: 2px solid #E2E8F0;
      font-size: 10px;
      color: #94A3B8;
    }

    /* ── Print Overrides ── */
    @media print {
      body { padding: 12px; }
      .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .concept-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .concept-visual, .concept-visual-emoji {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .section-title {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .concept-card {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .concept-lv {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      svg {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        shape-rendering: geometricPrecision;
        text-rendering: optimizeLegibility;
      }
      .concept-visual svg { max-width: 80px; max-height: 55px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">"Matematîk bi her zimanî diaxive, bi kurdî jî."</div>
    <p>Pêşdibistanî – Dibistana Seretayî · ${concepts.length} têgeh · Prof. Dr. Yılmaz MUTLU</p>
  </div>
  ${Object.entries(grouped).map(([sectionName, sectionConcepts]) => {
    const sid = groupSectionIds[sectionName];
    const sec = SECTIONS[sid];
    const palette = getSectionPalette(sid);
    return `
    <div class="section-title" style="background: ${palette.bg}; color: ${palette.text}; border-left: 4px solid ${palette.accent};">
      <span class="section-icon">${sec?.icon || '📘'}</span>
      ${sectionName}
    </div>
    <div class="concept-grid">
      ${sectionConcepts.map(c => {
        const p = getSectionPalette(c.s);
        const cardBg = hexToRgba(p.bg, 0.5);
        const cardBorder = hexToRgba(p.accent, 0.25);
        const lvBg = hexToRgba(p.accent, 0.15);
        const exColor = hexToRgba(p.text, 0.6);
        return `
        <div class="concept-card" style="background: ${cardBg}; border: 1.5px solid ${cardBorder};">
          ${getConceptVisualHTML(c, p)}
          <div class="concept-content">
            <span class="concept-lv" style="background: ${lvBg}; color: ${p.text};">${c.lv}</span>
            <div class="concept-ku" style="color: ${p.text};">${c.ku}</div>
            <div class="concept-tr" style="color: ${p.accent};">${c.tr} · ${c.en}</div>
            <div class="concept-df">${c.df}</div>
            ${c.ex ? `<div class="concept-ex" style="color: ${exColor};">"${c.ex}"</div>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('')}
  <div class="footer">
    FerMat · Ferhenga Wêneyî ya Matematîkê
  </div>
  <script>window.onload = () => { window.print(); };<\/script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
