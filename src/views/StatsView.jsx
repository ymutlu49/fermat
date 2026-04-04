// ─── FerMat — StatsView (Minimal) ────────────────────────────────────────────
import { useCallback } from 'react';
import {
  ALL_CONCEPTS, SECTIONS, LEITNER_KNOWN_BOX,
  SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, TOUCH_MIN,
} from '@data';
import { getSectionColor } from '@utils/helpers.js';
import { useMediaQuery } from '@hooks';
import { ScoreCircle, ProgressBar, Modal } from '@components/ui';
import { useState } from 'react';

export default function StatsView({ theme, isDark, concepts, progress, setProgress, showToast }) {
  const t = theme;
  const { isMobile } = useMediaQuery();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const flashcardBoxes = progress.flashcardBoxes || {};
  const knownCount = concepts.filter(c => (flashcardBoxes[c.ku] || 0) >= LEITNER_KNOWN_BOX).length;
  const learningCount = concepts.filter(c => (flashcardBoxes[c.ku] || 0) === 1).length;
  const newCount = concepts.length - knownCount - learningCount;
  const totalQ = progress.totalQuestions || 0;
  const correctA = progress.correctAnswers || 0;
  const sessions = progress.sessions || [];
  const accuracy = totalQ > 0 ? Math.round((correctA / totalQ) * 100) : 0;

  const sectionCounts = {};
  concepts.forEach(c => { sectionCounts[c.s] = (sectionCounts[c.s] || 0) + 1; });

  const handleReset = useCallback(() => {
    setProgress({ flashcardBoxes: {}, totalQuestions: 0, correctAnswers: 0, sessions: [] });
    setShowResetConfirm(false);
    showToast?.('Pêşketin ji nû ve hat paqijkirin', 'info');
  }, [setProgress, showToast]);

  const px = isMobile ? SPACING.md : SPACING.xl;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: `${SPACING.xl}px ${px}px 80px` }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* Progress circle */}
        <div style={{ textAlign: 'center', marginBottom: SPACING.xxl }}>
          <ScoreCircle score={knownCount} total={concepts.length} theme={t} size={100} />
          <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted, marginTop: SPACING.md }}>
            {knownCount} ji {concepts.length} têgehan hatine fêrkirin
          </div>
        </div>

        {/* Stats list */}
        <div style={{
          background: t.surface, borderRadius: RADIUS.xl,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden', marginBottom: SPACING.lg,
        }}>
          {[
            { label: 'Pirs', value: totalQ },
            { label: 'Rast', value: accuracy + '%' },
            { label: 'Xebat', value: sessions.length },
            { label: 'Zanî', value: knownCount },
            { label: 'Fêr dibe', value: learningCount },
            { label: 'Nû', value: newCount },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: `12px ${SPACING.lg}px`,
              borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
            }}>
              <span style={{ fontSize: FONT_SIZE.base, color: t.text }}>{item.label}</span>
              <span style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: t.textSecondary }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Flashcard progress bar */}
        <div style={{
          background: t.surface, borderRadius: RADIUS.xl,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          padding: `${SPACING.lg}px`, marginBottom: SPACING.lg,
        }}>
          <div style={{ fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: SPACING.md }}>
            Pirs û Bersiv
          </div>
          <div style={{ display: 'flex', gap: 2, height: 8, borderRadius: RADIUS.full, overflow: 'hidden' }}>
            <div style={{ flex: knownCount, background: t.success, minWidth: knownCount > 0 ? 4 : 0, transition: 'flex 0.6s ease-out' }} />
            <div style={{ flex: learningCount, background: t.warning, minWidth: learningCount > 0 ? 4 : 0, transition: 'flex 0.6s ease-out' }} />
            <div style={{ flex: newCount, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', minWidth: 4, transition: 'flex 0.6s ease-out' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: SPACING.sm }}>
            {[
              { color: t.success, label: 'Zanî', count: knownCount },
              { color: t.warning, label: 'Fêrbûn', count: learningCount },
              { color: t.textMuted, label: 'Nû', count: newCount },
            ].map(seg => (
              <span key={seg.label} style={{ fontSize: FONT_SIZE.xs, color: seg.color, fontWeight: FONT_WEIGHT.medium }}>
                {seg.label} {seg.count}
              </span>
            ))}
          </div>
        </div>

        {/* Section distribution */}
        <div style={{
          background: t.surface, borderRadius: RADIUS.xl,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden', marginBottom: SPACING.lg,
        }}>
          {Object.entries(SECTIONS).map(([id, sec], i, arr) => {
            const count = sectionCounts[id] || 0;
            const pct = Math.round(count / concepts.length * 100);
            return (
              <div key={id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: `10px ${SPACING.lg}px`,
                borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
              }}>
                <span style={{ fontSize: FONT_SIZE.sm, color: t.text }}>
                  {sec.icon} {sec.short}
                </span>
                <span style={{ fontSize: FONT_SIZE.sm, color: t.textMuted }}>
                  {count} · %{pct}
                </span>
              </div>
            );
          })}
        </div>

        {/* Reset button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          style={{
            width: '100%', padding: '12px', borderRadius: RADIUS.lg,
            border: 'none',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            color: t.error,
            fontFamily: 'inherit', fontWeight: FONT_WEIGHT.medium,
            fontSize: FONT_SIZE.sm, cursor: 'pointer',
          }}
        >
          Pêşketinê paqij bike
        </button>

      </div>

      {/* Reset confirm modal */}
      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} theme={theme}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: t.text, marginBottom: SPACING.sm }}>Tu piştrast î?</div>
          <div style={{ fontSize: FONT_SIZE.sm, color: t.textSecondary, marginBottom: SPACING.xl }}>
            Hemû pêşketin dê bê paqijkirin.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowResetConfirm(false)} style={{
              flex: 1, padding: `${SPACING.md}px`, borderRadius: RADIUS.lg, border: '1px solid ' + t.border,
              background: t.surface, color: t.text, fontFamily: 'inherit', fontWeight: FONT_WEIGHT.medium, cursor: 'pointer', fontSize: FONT_SIZE.sm,
            }}>
              Betal bike
            </button>
            <button onClick={handleReset} style={{
              flex: 1, padding: `${SPACING.md}px`, borderRadius: RADIUS.lg, border: 'none',
              background: t.error, color: '#fff', fontFamily: 'inherit', fontWeight: FONT_WEIGHT.bold, cursor: 'pointer', fontSize: FONT_SIZE.sm,
            }}>
              Paqij bike
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
