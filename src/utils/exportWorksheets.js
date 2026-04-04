// ─── FerMat — Worksheet Export Utilities ─────────────────────────
// Generates printable HTML worksheets for classroom use.
// Pattern: build HTML string, open in new window, trigger window.print().

import { SECTIONS } from '@data/sections.js';
import { getConceptVisualHTML } from './pdfVisuals.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle — returns new array */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Convert index to letter: 0→a, 1→b, etc. */
function toLetter(i) {
  return String.fromCharCode(97 + i);
}

/** Get section icon for a concept */
function sectionIcon(concept) {
  return SECTIONS[concept.s]?.icon || '';
}

/** Shared HTML document wrapper */
function wrapHTML(title, subtitle, bodyHtml, answerHtml = '') {
  const answerPage = answerHtml
    ? `<div class="page-break"></div>
       <div class="answer-section">
         <div class="answer-header">Bersivname</div>
         ${answerHtml}
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="ku" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      color: #1A2332;
      padding: 28px 32px;
      line-height: 1.55;
      font-size: 13px;
    }

    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 14px;
      border-bottom: 2.5px solid #0F4C5C;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0F4C5C;
      margin-bottom: 2px;
    }
    .header .subtitle {
      font-size: 13px;
      color: #64748B;
      margin-bottom: 8px;
    }
    .student-info {
      font-size: 13px;
      color: #334155;
      margin-top: 10px;
    }
    .student-info span {
      display: inline-block;
      margin: 0 18px;
    }

    .footer {
      text-align: center;
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      font-size: 10px;
      color: #94A3B8;
    }

    .page-break {
      page-break-before: always;
      margin-top: 0;
    }

    .answer-section {
      padding-top: 8px;
    }
    .answer-header {
      font-size: 18px;
      font-weight: 800;
      color: #0F4C5C;
      text-align: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #E2E8F0;
    }

    /* ── Matching worksheet ─────────────────────────────── */
    .match-container {
      display: flex;
      gap: 48px;
      margin-top: 16px;
    }
    .match-col {
      flex: 1;
    }
    .match-col h3 {
      font-size: 13px;
      font-weight: 700;
      color: #0F4C5C;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #E2E8F0;
    }
    .match-item {
      padding: 7px 0;
      font-size: 13px;
      border-bottom: 1px dotted #E2E8F0;
      display: flex;
      align-items: baseline;
      gap: 6px;
    }
    .match-number {
      font-weight: 700;
      color: #0F4C5C;
      min-width: 22px;
    }
    .match-term {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .match-trans {
      font-weight: 500;
    }

    /* ── Fill-in-the-blank ──────────────────────────────── */
    .fill-item {
      padding: 10px 0;
      border-bottom: 1px solid #F0F4F8;
      font-size: 13px;
      line-height: 1.6;
    }
    .fill-number {
      font-weight: 700;
      color: #0F4C5C;
      margin-right: 6px;
    }
    .fill-blank {
      display: inline-block;
      min-width: 140px;
      border-bottom: 2px solid #0F4C5C;
      margin: 0 2px;
    }
    .word-bank {
      margin-top: 20px;
      padding: 14px 18px;
      border: 2px solid #0F4C5C;
      border-radius: 10px;
      background: #F8FAFC;
    }
    .word-bank-title {
      font-size: 12px;
      font-weight: 800;
      color: #0F4C5C;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .word-bank-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 16px;
    }
    .word-bank-items span {
      font-size: 13px;
      font-weight: 600;
      padding: 3px 10px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      background: #FFFFFF;
    }

    /* ── Flashcards ─────────────────────────────────────── */
    .flash-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }
    .flash-card {
      border: 1.5px dashed #94A3B8;
      width: 100%;
      height: 190px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 12px;
      position: relative;
    }
    .flash-card .icon {
      font-size: 22px;
      margin-bottom: 6px;
    }
    .flash-card .term {
      font-size: 18px;
      font-weight: 800;
      color: #0F4C5C;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .flash-card .translation {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 4px;
    }
    .flash-card .definition {
      font-size: 10.5px;
      color: #64748B;
      line-height: 1.4;
      max-width: 90%;
    }
    .flash-label {
      position: absolute;
      top: 5px;
      right: 8px;
      font-size: 8px;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .flash-page-note {
      text-align: center;
      font-size: 10px;
      color: #94A3B8;
      margin: 4px 0 0;
      font-style: italic;
    }

    /* ── Concept map ───────────────────────────────────── */
    .cmap-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 16px;
    }
    .cmap-root {
      padding: 10px 24px;
      border: 2.5px solid #0F4C5C;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 800;
      color: #0F4C5C;
      background: #E8F4F8;
      text-align: center;
      margin-bottom: 4px;
    }
    .cmap-line-down {
      width: 2px;
      height: 20px;
      background: #0F4C5C;
    }
    .cmap-branches {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      margin-top: 4px;
    }
    .cmap-branch {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 130px;
    }
    .cmap-branch-line {
      width: 2px;
      height: 16px;
      background: #94A3B8;
    }
    .cmap-node {
      padding: 8px 14px;
      border: 1.5px solid #CBD5E1;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      background: #FFFFFF;
      min-width: 110px;
    }
    .cmap-node.blank {
      border-style: dashed;
      color: #94A3B8;
      background: #FAFBFC;
    }
    .cmap-node.filled {
      color: #1A2332;
    }

    /* ── Answer key ─────────────────────────────────────── */
    .answer-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 18px;
      font-size: 12px;
    }
    .answer-grid span {
      font-weight: 500;
    }
    .answer-list {
      list-style: none;
      padding: 0;
    }
    .answer-list li {
      padding: 3px 0;
      font-size: 12px;
      border-bottom: 1px dotted #F0F4F8;
    }
    .answer-list li strong {
      color: #0F4C5C;
      margin-right: 6px;
    }

    @media print {
      body { padding: 16px 20px; }
      .page-break { page-break-before: always; }
      .flash-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cmap-root, .word-bank { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }

    @page {
      margin: 12mm 10mm;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">${subtitle}</div>
    <div class="student-info">
      <span>Nav: __________________________</span>
      <span>Dirok: _______________</span>
    </div>
  </div>

  ${bodyHtml}

  ${answerPage}

  <div class="footer">
    FerMat &middot; Prof. Dr. Yilmaz MUTLU
  </div>

  <script>window.onload = () => { window.print(); };<\/script>
</body>
</html>`;
}

/** Open a new window and write the HTML content */
function openPrintWindow(html) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

// ── 1. Matching Worksheet ────────────────────────────────────────────────────

/**
 * Export a matching worksheet — draw lines between Kurdish terms and Turkish translations.
 * @param {Array} concepts - Array of concept objects
 * @param {Object} options - { includeAnswerKey: true, count: 10 }
 */
export function exportMatchingWorksheet(concepts, options = {}) {
  const { includeAnswerKey = true, count = 10 } = options;
  const selected = shuffle(concepts).slice(0, Math.min(count, concepts.length));
  const maxPerPage = 15;
  const pages = [];

  for (let i = 0; i < selected.length; i += maxPerPage) {
    pages.push(selected.slice(i, i + maxPerPage));
  }

  let bodyHtml = '';
  const allAnswers = [];
  let globalIndex = 0;

  pages.forEach((pageConcepts, pageIdx) => {
    if (pageIdx > 0) {
      bodyHtml += '<div class="page-break"></div>';
    }

    // Left column: numbered Kurdish terms in original order
    // Right column: lettered Turkish translations in shuffled order
    const shuffledRight = shuffle(pageConcepts.map((c, i) => ({
      originalIndex: i,
      tr: c.tr
    })));

    // Build answer mapping
    pageConcepts.forEach((c, i) => {
      const rightIdx = shuffledRight.findIndex(r => r.originalIndex === i);
      allAnswers.push(`${globalIndex + i + 1}-${toLetter(rightIdx)}`);
    });

    bodyHtml += `
      <div class="match-container">
        <div class="match-col">
          <h3>Kurdî</h3>
          ${pageConcepts.map((c, i) => `
            <div class="match-item">
              <span class="match-number">${globalIndex + i + 1}.</span>
              <span class="match-term">${c.ku}</span>
            </div>
          `).join('')}
        </div>
        <div class="match-col">
          <h3>Tirkî</h3>
          ${shuffledRight.map((r, i) => `
            <div class="match-item">
              <span class="match-number">${toLetter(i)}.</span>
              <span class="match-trans">${r.tr}</span>
            </div>
          `).join('')}
        </div>
      </div>`;

    globalIndex += pageConcepts.length;
  });

  let answerHtml = '';
  if (includeAnswerKey) {
    answerHtml = `
      <div class="answer-grid">
        ${allAnswers.map(a => `<span>${a}</span>`).join('')}
      </div>`;
  }

  const html = wrapHTML(
    'Hevberdana Peyvan',
    'Têgeh û wateyan bi xêz bi hev re girêbide',
    bodyHtml,
    includeAnswerKey ? answerHtml : ''
  );

  openPrintWindow(html);
}

// ── 2. Fill-in-the-Blank Worksheet ───────────────────────────────────────────

/**
 * Export a fill-in-the-blank worksheet — read the definition, write the term.
 * @param {Array} concepts - Array of concept objects
 * @param {Object} options - { includeAnswerKey: true, count: 10 }
 */
export function exportFillBlankWorksheet(concepts, options = {}) {
  const { includeAnswerKey = true, count = 10 } = options;
  const selected = shuffle(concepts).slice(0, Math.min(count, concepts.length));
  const bankTerms = shuffle(selected.map(c => c.ku));

  let bodyHtml = '';

  selected.forEach((c, i) => {
    bodyHtml += `
      <div class="fill-item">
        <span class="fill-number">${i + 1}.</span>
        <span class="fill-blank">&nbsp;</span> : ${c.df}
      </div>`;
  });

  bodyHtml += `
    <div class="word-bank">
      <div class="word-bank-title">Peyvên Alîkar</div>
      <div class="word-bank-items">
        ${bankTerms.map(t => `<span>${t}</span>`).join('')}
      </div>
    </div>`;

  let answerHtml = '';
  if (includeAnswerKey) {
    answerHtml = `
      <ol class="answer-list">
        ${selected.map((c, i) => `
          <li><strong>${i + 1}.</strong> ${c.ku} <span style="color:#64748B;">(${c.tr})</span></li>
        `).join('')}
      </ol>`;
  }

  const html = wrapHTML(
    'Cihê Vala Dagire',
    'Penaseyê bixwîne, têgeha rast binivîse',
    bodyHtml,
    includeAnswerKey ? answerHtml : ''
  );

  openPrintWindow(html);
}

// ── 3. Flashcard Sheet ───────────────────────────────────────────────────────

/**
 * Export a printable flashcard sheet — 6 cards per page, front + back.
 * @param {Array} concepts - Array of concept objects
 * @param {Object} options - { count: 12 }
 */
export function exportFlashcardSheet(concepts, options = {}) {
  const { count = 12 } = options;
  const selected = shuffle(concepts).slice(0, Math.min(count, concepts.length));
  const cardsPerPage = 6;
  let bodyHtml = '';

  for (let p = 0; p < selected.length; p += cardsPerPage) {
    const pageCards = selected.slice(p, p + cardsPerPage);

    if (p > 0) {
      bodyHtml += '<div class="page-break"></div>';
    }

    // Front side: Kurdish terms
    bodyHtml += `
      <div style="margin-bottom:4px;">
        <div style="text-align:center;font-size:11px;font-weight:700;color:#64748B;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em;">Rû - Pêş (Bibirre û biqelibîne)</div>
        <div class="flash-grid">
          ${pageCards.map(c => `
            <div class="flash-card">
              <span class="flash-label">pêş</span>
              <div style="margin-bottom:4px;">${getConceptVisualHTML(c)}</div>
              <div class="term">${c.ku}</div>
              <div style="font-size:9px;color:#64748B;margin-top:2px;">${c.tr}</div>
            </div>
          `).join('')}
        </div>
      </div>`;

    // Back side: translations + definitions (mirrored column order for fold-and-cut)
    const mirroredCards = [];
    for (let r = 0; r < pageCards.length; r += 2) {
      if (r + 1 < pageCards.length) {
        mirroredCards.push(pageCards[r + 1]);
        mirroredCards.push(pageCards[r]);
      } else {
        mirroredCards.push(pageCards[r]);
      }
    }

    bodyHtml += `
      <div class="page-break"></div>
      <div>
        <div style="text-align:center;font-size:11px;font-weight:700;color:#64748B;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em;">Rû - Paş (Bersiv)</div>
        <div class="flash-grid">
          ${mirroredCards.map(c => `
            <div class="flash-card">
              <span class="flash-label">paş</span>
              <div class="translation">${c.tr}</div>
              <div class="definition">${c.df}</div>
            </div>
          `).join('')}
        </div>
        <div class="flash-page-note">Ji bo qelibandinê: rûyê pêş û paş li ser hev çap bikin, paşê li ser xetên bişkokî bibirrin.</div>
      </div>`;
  }

  const html = wrapHTML(
    'Kartên Hînbûnê',
    'Kartan çap bike, li ser xetên bişkokî bibirre',
    bodyHtml
  );

  openPrintWindow(html);
}

// ── 4. Concept Map Worksheet ─────────────────────────────────────────────────

/**
 * Export an incomplete concept map worksheet.
 * @param {Array} concepts - Array of concept objects
 * @param {string} sectionName - Name of the section for the root node
 * @param {Object} options - { includeAnswerKey: true, blankPercent: 0.4 }
 */
export function exportConceptMapWorksheet(concepts, sectionName, options = {}) {
  const { includeAnswerKey = true, blankPercent = 0.4 } = options;
  const items = [...concepts];

  // Decide which items become blanks
  const blankCount = Math.max(1, Math.round(items.length * blankPercent));
  const blankIndices = new Set(
    shuffle(items.map((_, i) => i)).slice(0, blankCount)
  );

  const blankedTerms = [];
  items.forEach((c, i) => {
    if (blankIndices.has(i)) blankedTerms.push(c.ku);
  });

  // Build the diagram
  const branchesHtml = items.map((c, i) => {
    const isBlank = blankIndices.has(i);
    const nodeClass = isBlank ? 'cmap-node blank' : 'cmap-node filled';
    const label = isBlank ? '______' : c.ku;
    return `
      <div class="cmap-branch">
        <div class="cmap-branch-line"></div>
        <div class="${nodeClass}">${label}</div>
      </div>`;
  }).join('');

  let bodyHtml = `
    <div class="cmap-container">
      <div class="cmap-root">${sectionName}</div>
      <div class="cmap-line-down"></div>
      <div class="cmap-branches">
        ${branchesHtml}
      </div>
    </div>

    <div class="word-bank" style="margin-top:24px;">
      <div class="word-bank-title">Peyvên Kêm</div>
      <div class="word-bank-items">
        ${shuffle(blankedTerms).map(t => `<span>${t}</span>`).join('')}
      </div>
    </div>`;

  // Answer key: complete diagram
  let answerHtml = '';
  if (includeAnswerKey) {
    const answerBranchesHtml = items.map(c => `
      <div class="cmap-branch">
        <div class="cmap-branch-line"></div>
        <div class="cmap-node filled">${c.ku}</div>
      </div>`
    ).join('');

    answerHtml = `
      <div class="cmap-container">
        <div class="cmap-root">${sectionName}</div>
        <div class="cmap-line-down"></div>
        <div class="cmap-branches">
          ${answerBranchesHtml}
        </div>
      </div>`;
  }

  const html = wrapHTML(
    'Nexşeya Netemam',
    'Nexşeya kavramî bi peyvên kêm temam bike',
    bodyHtml,
    includeAnswerKey ? answerHtml : ''
  );

  openPrintWindow(html);
}
