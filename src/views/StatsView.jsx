// ─── FerMat — StatsView (Minimal) ────────────────────────────────────────────
import { useCallback, useState } from 'react';
import { ALL_CONCEPTS, SECTIONS, LEITNER_KNOWN_BOX, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@data';
import { getSectionColor } from '@utils/helpers.js';
import { ScoreCircle, PageContainer, SectionCard, SectionTitle, StatRow, Modal } from '@components/ui';

export default function StatsView({ theme, isDark, concepts, progress, setProgress, showToast }) {
  const t = theme;
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

  return (
    <PageContainer>
      {/* Progress circle */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <ScoreCircle score={knownCount} total={concepts.length} theme={t} size={100} />
        <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted, marginTop: 12 }}>
          {knownCount} ji {concepts.length} têgehan hatine fêrkirin
        </div>
      </div>

      {/* Stats */}
      <SectionCard theme={t}>
        {[
          { label: 'Pirs', value: totalQ },
          { label: 'Rast', value: accuracy + '%' },
          { label: 'Xebat', value: sessions.length },
          { label: 'Zanî', value: knownCount },
          { label: 'Fêr dibe', value: learningCount },
          { label: 'Nû', value: newCount },
        ].map((item, i, arr) => (
          <StatRow key={item.label} label={item.label} value={item.value} theme={t} isDark={isDark} isLast={i === arr.length - 1} />
        ))}
      </SectionCard>

      {/* Flashcard progress */}
      <SectionTitle theme={t}>Pirs û Bersiv</SectionTitle>
      <SectionCard theme={t} style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 2, height: 8, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ flex: knownCount, background: t.success, minWidth: knownCount > 0 ? 4 : 0, transition: 'flex 0.6s ease-out' }} />
          <div style={{ flex: learningCount, background: t.warning, minWidth: learningCount > 0 ? 4 : 0, transition: 'flex 0.6s ease-out' }} />
          <div style={{ flex: newCount, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', minWidth: 4, transition: 'flex 0.6s ease-out' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
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
      </SectionCard>

      {/* Section distribution */}
      <SectionTitle theme={t}>Beş</SectionTitle>
      <SectionCard theme={t}>
        {Object.entries(SECTIONS).map(([id, sec], i, arr) => {
          const count = sectionCounts[id] || 0;
          const pct = Math.round(count / concepts.length * 100);
          return (
            <StatRow key={id} label={`${sec.icon} ${sec.short}`} value={`${count} · %${pct}`} theme={t} isDark={isDark} isLast={i === arr.length - 1} />
          );
        })}
      </SectionCard>

      {/* Reset */}
      <div style={{ marginTop: 24 }}>
        <button onClick={() => setShowResetConfirm(true)} style={{
          width: '100%', padding: 12, borderRadius: 12,
          border: 'none', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          color: t.error, fontFamily: 'inherit', fontWeight: FONT_WEIGHT.medium, fontSize: FONT_SIZE.sm, cursor: 'pointer',
        }}>
          Pêşketinê paqij bike
        </button>
      </div>

      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} theme={t}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: t.text, marginBottom: 8 }}>Tu piştrast î?</div>
          <div style={{ fontSize: FONT_SIZE.sm, color: t.textSecondary, marginBottom: 24 }}>Hemû pêşketin dê bê paqijkirin.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowResetConfirm(false)} style={{
              flex: 1, padding: 12, borderRadius: 12, border: '1px solid ' + t.border,
              background: t.surface, color: t.text, fontFamily: 'inherit', fontWeight: FONT_WEIGHT.medium, cursor: 'pointer', fontSize: FONT_SIZE.sm,
            }}>Betal bike</button>
            <button onClick={handleReset} style={{
              flex: 1, padding: 12, borderRadius: 12, border: 'none',
              background: t.error, color: '#fff', fontFamily: 'inherit', fontWeight: FONT_WEIGHT.bold, cursor: 'pointer', fontSize: FONT_SIZE.sm,
            }}>Paqij bike</button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
