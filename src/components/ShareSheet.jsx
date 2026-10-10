// ─── FerMat — Share sheet (Instagram card preview + export) ─────
// Bottom sheet that renders a concept as a PNG in the chosen Instagram shape
// and offers: download, native share (where the platform supports files) and
// copying the caption. Preferences are shared with the Parvekirin view.
import { useState, useEffect, useRef } from 'react';
import { FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '@data';
import { usePersistedState } from '@hooks';
import { Pill } from '@components/ui';
import { IconX, IconDownload, IconShare, IconCopy } from '@components/icons';
import {
  SHARE_FORMATS, SHARE_TEMPLATES, SHARE_STYLES, DEFAULT_SHARE_PREFS,
  renderShareCard, renderExerciseCard, canvasToBlob, downloadBlob, canShareFile, shareImage,
} from '@utils/shareCard.js';
import { buildCaption, shareFileName, buildExerciseCaption, exerciseFileName } from '@utils/shareText.js';

const PREFS_KEY = 'fermat_share_prefs_v1';
const STATUS_RESET_MS = 2200;

/** Persisted format/template/style/handle, tolerant of older stored shapes. */
export function useSharePrefs() {
  const [stored, setStored] = usePersistedState(PREFS_KEY, DEFAULT_SHARE_PREFS);
  const prefs = { ...DEFAULT_SHARE_PREFS, ...stored };
  const setPref = (key, value) => setStored(prev => ({ ...DEFAULT_SHARE_PREFS, ...prev, [key]: value }));
  return [prefs, setPref];
}

const EXERCISE_SLIDES = [{ id: 'question', label: 'Pirs' }, { id: 'answer', label: 'Bersiv' }];

/**
 * Format / template / style pills plus the Instagram handle field.
 * `slide` ({ value, onChange }) swaps the concept templates for the exercise
 * slides (Pirs / Bersiv); `hideTemplate` drops that group altogether.
 */
export function SharePrefsControls({ prefs, setPref, theme: t, isDark, slide = null, hideTemplate = false }) {
  const templates = slide ? EXERCISE_SLIDES : Object.values(SHARE_TEMPLATES);
  const activeTemplate = slide ? slide.value : prefs.template;
  const pickTemplate = id => (slide ? slide.onChange(id) : setPref('template', id));
  const rowStyle = { display: 'flex', gap: 8, flexWrap: 'wrap' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={rowStyle}>
        {Object.values(SHARE_FORMATS).map(f => (
          <Pill key={f.id} label={f.label} isActive={prefs.format === f.id} isDark={isDark}
            onClick={() => setPref('format', f.id)} />
        ))}
      </div>
      <div style={rowStyle}>
        {!hideTemplate && templates.map(tpl => (
          <Pill key={tpl.id} label={tpl.label} color="#EA580C" isActive={activeTemplate === tpl.id} isDark={isDark}
            onClick={() => pickTemplate(tpl.id)} />
        ))}
        {Object.values(SHARE_STYLES).map(s => (
          <Pill key={s.id} label={s.label} color="#0F4C5C" isActive={prefs.style === s.id} isDark={isDark}
            onClick={() => setPref('style', s.id)} />
        ))}
      </div>
      <input
        value={prefs.handle}
        onChange={e => setPref('handle', e.target.value)}
        placeholder="@instagram"
        aria-label="Instagram"
        autoCapitalize="none" autoCorrect="off" spellCheck={false}
        style={{
          width: '100%', padding: '10px 14px', minHeight: 44,
          borderRadius: RADIUS.lg, boxSizing: 'border-box',
          border: `1px solid ${t.border}`, background: t.surface, color: t.text,
          fontFamily: 'inherit', fontSize: FONT_SIZE.base, outline: 'none',
        }}
      />
    </div>
  );
}

/**
 * Pass either `concept` (dictionary card) or `exercise`
 * ({ question, typeLabel }) — the sheet is otherwise identical.
 */
export default function ShareSheet({ concept, exercise = null, theme: t, isDark, onClose }) {
  const [prefs, setPref] = useSharePrefs();
  const [slide, setSlide] = useState('question');
  const [preview, setPreview] = useState({ url: null, blob: null });
  const [status, setStatus] = useState('');
  const statusTimer = useRef(null);
  const { format, template, style, handle } = prefs;

  // Re-render the card whenever the concept or a preference changes.
  useEffect(() => {
    let isStale = false;
    let url = null;
    setPreview({ url: null, blob: null });
    const rendering = exercise
      ? renderExerciseCard({ ...exercise, format, style, handle, reveal: slide === 'answer' })
      : renderShareCard({ concept, format, template, style, handle });
    rendering
      .then(canvasToBlob)
      .then(blob => {
        if (isStale) return;
        url = URL.createObjectURL(blob);
        setPreview({ url, blob });
      })
      .catch(() => { if (!isStale) setStatus('Xeletîyek çêbû'); });
    return () => {
      isStale = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [concept, exercise, slide, format, template, style, handle]);

  useEffect(() => {
    const onKey = e => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    };
    // Capture phase: the concept modal underneath also listens for Escape.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  useEffect(() => () => clearTimeout(statusTimer.current), []);

  const flash = message => {
    setStatus(message);
    clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(''), STATUS_RESET_MS);
  };

  const fileName = exercise
    ? exerciseFileName(exercise.question, format, slide === 'answer' ? 'bersiv' : 'pirs')
    : shareFileName(concept, format, template === 'question' ? 'pirs' : '');
  const caption = exercise ? buildExerciseCaption(exercise.question, handle) : buildCaption(concept, handle);
  const previewAlt = exercise ? (exercise.question.q || exercise.typeLabel) : concept.ku;
  const fmt = SHARE_FORMATS[format];
  const isReady = Boolean(preview.blob);

  const handleDownload = () => { if (isReady) downloadBlob(preview.blob, fileName); };
  const handleShare = async () => {
    if (!isReady) return;
    try { await shareImage(preview.blob, fileName, caption); }
    catch { flash('Xeletîyek çêbû'); }
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      flash('Jêyek hat girtin ✓');
    } catch {
      flash('Xeletîyek çêbû');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      <div
        role="dialog" aria-modal="true" aria-label="Parve bike"
        onClick={e => e.stopPropagation()}
        style={{
          background: t.surface, width: '100%', maxWidth: 540,
          maxHeight: '94dvh', overflowY: 'auto',
          borderRadius: `${SPACING.xl}px ${SPACING.xl}px 0 0`,
          padding: `${SPACING.lg}px ${SPACING.lg}px calc(${SPACING.xl}px + env(safe-area-inset-bottom, 0px))`,
          animation: 'slideUp 0.22s cubic-bezier(0.22,0.61,0.36,1)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
          <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold, color: t.text }}>
            Parve bike
          </div>
          <button
            onClick={onClose} aria-label="Bigire"
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconX size={18} color={t.textSecondary} />
          </button>
        </div>

        {/* Preview — keeps the target aspect ratio while the PNG renders */}
        <div style={{
          margin: '0 auto', marginBottom: SPACING.md,
          height: 'min(46dvh, 420px)', aspectRatio: `${fmt.w} / ${fmt.h}`, maxWidth: '100%',
          borderRadius: 14, overflow: 'hidden',
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {preview.url
            ? <img src={preview.url} alt={previewAlt} style={{ width: '100%', height: '100%', display: 'block' }} />
            : <span role="status" style={{ fontSize: FONT_SIZE.sm, color: t.textMuted }}>Tê barkirin…</span>
          }
        </div>

        <SharePrefsControls
          prefs={prefs} setPref={setPref} theme={t} isDark={isDark}
          slide={exercise ? { value: slide, onChange: setSlide } : null}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: SPACING.md }}>
          <SheetButton onClick={handleDownload} disabled={!isReady} primary icon={IconDownload} label="Daxîne" t={t} />
          {canShareFile() && (
            <SheetButton onClick={handleShare} disabled={!isReady} icon={IconShare} label="Parve bike" t={t} />
          )}
          <SheetButton onClick={handleCopy} icon={IconCopy} label="Jêyek bigire" title="Ji nivîsê jêyek bigire" t={t} />
        </div>
        <div role="status" aria-live="polite" style={{
          minHeight: 20, marginTop: 8, textAlign: 'center',
          fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: t.primary,
        }}>
          {status}
        </div>
      </div>
    </div>
  );
}

function SheetButton({ onClick, disabled = false, primary = false, icon: Icon, label, title, t }) {
  const color = primary ? '#FFFFFF' : t.text;
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      title={title} aria-label={title}
      style={{
        flex: 1, minHeight: 48, padding: '10px 8px',
        borderRadius: 14, cursor: disabled ? 'default' : 'pointer',
        border: primary ? 'none' : `1px solid ${t.border}`,
        background: primary ? '#0D9488' : 'transparent',
        color, opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit', fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon size={17} color={color} />
      {label}
    </button>
  );
}
