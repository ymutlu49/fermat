// ─── FerMat — Parvekirin (Instagram card studio) ────────────────
// Pick a section, set the card look once, then either open a single item in
// the share sheet or download the whole section as a ZIP of numbered PNGs
// (plus captions.txt) ready to schedule as carousels. Two sources: dictionary
// concepts (Têgeh) and the hand-written problem bank (Hîndarî).
import { useState, useMemo, useRef, useEffect } from 'react';
import { SECTIONS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@data';
import { getSectionColor } from '@utils/helpers.js';
import { Pill, PageContainer, ConceptRow, ListSection } from '@components/ui';
import { IconDownload, IconChevronRight } from '@components/icons';
import { ConceptVisual } from '@components/visuals';
import ShareSheet, { useSharePrefs, SharePrefsControls } from '@components/ShareSheet.jsx';
import {
  renderShareCard, renderSectionCover, renderExerciseCard, canvasToBlob, downloadBlob,
} from '@utils/shareCard.js';
import {
  buildCaption, shareFileName, buildExerciseCaption, exerciseFileName, slugify,
} from '@utils/shareText.js';
import { Q_TYPES, MATH_TYPE, mathQuestionsFor } from '@utils/exerciseQuestions.js';
import { buildZip } from '@utils/zipStore.js';

const MODES = [{ id: 'concept', label: 'Têgeh' }, { id: 'exercise', label: 'Hîndarî' }];
const MATH_LABEL = Q_TYPES.find(qt => qt.id === MATH_TYPE).label;
const CAPTION_SEPARATOR = '\n\n———\n\n';

const blobToBytes = async blob => new Uint8Array(await blob.arrayBuffer());

export default function ShareStudioView({ theme, isDark, concepts }) {
  const t = theme;
  const [prefs, setPref] = useSharePrefs();
  const [mode, setMode] = useState('concept');
  const isExercise = mode === 'exercise';

  const sectionIds = useMemo(
    () => Object.keys(SECTIONS).map(Number).filter(id => (
      isExercise ? mathQuestionsFor(id).length > 0 : concepts.some(c => c.s === id)
    )),
    [concepts, isExercise]
  );
  const [pickedSection, setPickedSection] = useState(null);
  // The two sources cover different sections; fall back to the first valid one.
  const sectionId = sectionIds.includes(pickedSection) ? pickedSection : sectionIds[0];

  const [selected, setSelected] = useState(null);     // { concept } | { exercise }
  const [zipProgress, setZipProgress] = useState(null); // { done, total } while building
  const [hasError, setHasError] = useState(false);
  const isMounted = useRef(false);
  // Set in the effect (not the initial value): StrictMode re-runs effects, and
  // a cleanup-only effect would leave the flag false for the real mount.
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const sectionConcepts = useMemo(() => concepts.filter(c => c.s === sectionId), [concepts, sectionId]);
  const sectionExercises = useMemo(() => mathQuestionsFor(sectionId), [sectionId]);
  const itemCount = isExercise ? sectionExercises.length : sectionConcepts.length;
  const isBuilding = zipProgress !== null;

  const handleDownloadAll = async () => {
    if (isBuilding || itemCount === 0) return;
    const { format, template, style, handle } = prefs;
    const look = { format, style, handle };
    const withQuestion = !isExercise && template === 'question';
    const total = isExercise ? itemCount * 2 : 1 + itemCount * (withQuestion ? 2 : 1);
    const files = [];
    const captions = [];
    let order = 0;
    const add = async (canvas, name) => {
      files.push({ name, data: await blobToBytes(await canvasToBlob(canvas)) });
      if (isMounted.current) setZipProgress({ done: files.length, total });
    };

    setHasError(false);
    setZipProgress({ done: 0, total });
    try {
      const sectionSlug = slugify(SECTIONS[sectionId].short);
      if (isExercise) {
        for (const question of sectionExercises) {
          if (!isMounted.current) return;
          for (const reveal of [false, true]) {
            order += 1;
            await add(
              await renderExerciseCard({ question, typeLabel: MATH_LABEL, ...look, reveal }),
              exerciseFileName(question, format, reveal ? 'bersiv' : 'pirs', order)
            );
          }
          captions.push(buildExerciseCaption(question, handle));
        }
      } else {
        await add(
          await renderSectionCover({ sectionId, count: itemCount, ...look }),
          `fermat-000-${sectionSlug}-${format}.png`
        );
        for (const concept of sectionConcepts) {
          if (!isMounted.current) return;
          if (withQuestion) {
            order += 1;
            await add(
              await renderShareCard({ concept, template: 'question', ...look }),
              shareFileName(concept, format, 'pirs', order)
            );
          }
          order += 1;
          await add(
            await renderShareCard({ concept, template: 'term', ...look }),
            shareFileName(concept, format, withQuestion ? 'bersiv' : '', order)
          );
          captions.push(buildCaption(concept, handle));
        }
      }
      files.push({ name: 'captions.txt', data: new TextEncoder().encode(captions.join(CAPTION_SEPARATOR) + '\n') });
      const zipName = `fermat-${isExercise ? 'hindari-' : ''}${sectionSlug}-${format}.zip`;
      downloadBlob(new Blob([buildZip(files)], { type: 'application/zip' }), zipName);
    } catch {
      if (isMounted.current) setHasError(true);
    } finally {
      if (isMounted.current) setZipProgress(null);
    }
  };

  return (
    <PageContainer>
      <div style={{ display: 'flex', gap: 8, marginBottom: SPACING.md }}>
        {MODES.map(m => (
          <Pill key={m.id} label={m.label} isActive={mode === m.id} isDark={isDark} color="#0F4C5C"
            onClick={() => setMode(m.id)} />
        ))}
      </div>

      <div style={{
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16,
        padding: SPACING.lg, marginBottom: SPACING.lg,
      }}>
        <SharePrefsControls prefs={prefs} setPref={setPref} theme={t} isDark={isDark} hideTemplate={isExercise} />
      </div>

      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: SPACING.md,
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}>
        {sectionIds.map(id => (
          <Pill key={id} icon={SECTIONS[id].icon} isActive={sectionId === id} isDark={isDark}
            color={getSectionColor(id, isDark).accent} onClick={() => setPickedSection(id)}>
            {SECTIONS[id].short}
          </Pill>
        ))}
      </div>

      <button
        type="button" onClick={handleDownloadAll} disabled={isBuilding}
        style={{
          width: '100%', minHeight: 52, marginBottom: 6,
          borderRadius: 14, border: 'none', cursor: isBuilding ? 'default' : 'pointer',
          background: 'linear-gradient(135deg, #0D9488, #0F766E)', color: '#FFFFFF',
          fontFamily: 'inherit', fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: isBuilding ? 0.75 : 1,
        }}
      >
        <IconDownload size={18} color="#FFFFFF" />
        {isBuilding
          ? `${zipProgress.done} / ${zipProgress.total}`
          : `Hemûyan daxîne (ZIP) · ${itemCount} ${isExercise ? 'pirs' : 'têgeh'}`}
      </button>
      <div role="status" aria-live="polite" style={{
        minHeight: 20, marginBottom: SPACING.sm, textAlign: 'center',
        fontSize: FONT_SIZE.sm, color: t.error, fontWeight: FONT_WEIGHT.semibold,
      }}>
        {hasError ? 'Xeletîyek çêbû' : ''}
      </div>

      <ListSection theme={t}>
        {isExercise
          ? sectionExercises.map((question, i) => (
              <ExerciseRow
                key={question.id} question={question} theme={t} isDark={isDark}
                onClick={() => setSelected({ exercise: { question, typeLabel: MATH_LABEL } })}
                isLast={i === sectionExercises.length - 1}
              />
            ))
          : sectionConcepts.map((concept, i) => (
              <ConceptRow
                key={concept.ku + '_' + concept.s}
                concept={concept} theme={t} isDark={isDark}
                onClick={() => setSelected({ concept })}
                isLast={i === sectionConcepts.length - 1}
                VisualComponent={ConceptVisual}
              />
            ))}
      </ListSection>

      {selected && (
        <ShareSheet {...selected} theme={t} isDark={isDark} onClose={() => setSelected(null)} />
      )}
    </PageContainer>
  );
}

function ExerciseRow({ question, theme: t, isDark, onClick, isLast }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: SPACING.md,
        width: '100%', padding: `12px ${SPACING.lg}px`, minHeight: 56,
        background: 'transparent', border: 'none',
        borderBottom: isLast ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{
        flex: 1, minWidth: 0, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold,
        color: t.text, lineHeight: 1.35,
      }}>
        {question.q}
      </span>
      <span style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, fontWeight: FONT_WEIGHT.medium, flexShrink: 0 }}>
        {question.lv}
      </span>
      <IconChevronRight size={14} color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'} />
    </button>
  );
}
