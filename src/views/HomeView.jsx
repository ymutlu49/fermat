// ─── FerMat — HomeView (Minimal) ─────────────────────────────────────────────
import { useMemo } from 'react';
import { ALL_CONCEPTS, LEITNER_KNOWN_BOX, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE } from '@data';
import { useMediaQuery } from '@hooks';
import { ScoreCircle } from '@components/ui';
import { IconBook, IconCards, IconGamepad, IconChevronRight } from '@components/icons';

const ACTIONS = [
  { id: 'dict',  icon: IconBook,    label: 'Ferheng',  desc: 'Hemû têgehan bibîne', color: '#2563EB' },
  { id: 'flash', icon: IconCards,   label: 'Fêrbûn',   desc: 'Bi kartan fêr bibe',  color: '#EA580C' },
  { id: 'games', icon: IconGamepad, label: 'Lîstik',   desc: 'Azmûn, cot bike...',  color: '#16A34A' },
];

export default function HomeView({ theme, isDark, progress, setView }) {
  const t = theme;
  const { isMobile } = useMediaQuery();

  const flashcardBoxes = progress.flashcardBoxes || {};
  const totalConcepts = ALL_CONCEPTS.length;
  const knownCount = useMemo(
    () => Object.values(flashcardBoxes).filter(v => v >= LEITNER_KNOWN_BOX).length,
    [flashcardBoxes]
  );

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: `${SPACING.xxl + 16}px ${isMobile ? SPACING.lg : SPACING.xl}px ${SPACING.xxl}px`,
    }}>
      {/* Progress */}
      <div style={{ marginBottom: SPACING.xxl + 8, textAlign: 'center' }}>
        <ScoreCircle score={knownCount} total={totalConcepts} theme={t} size={100} />
        <div style={{
          fontSize: FONT_SIZE.sm, color: t.textMuted,
          fontWeight: FONT_WEIGHT.medium, marginTop: SPACING.md,
        }}>
          {knownCount} ji {totalConcepts} têgehan hatine fêrkirin
        </div>
      </div>

      {/* Action rows */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: t.surface,
        borderRadius: RADIUS.xl,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        overflow: 'hidden',
      }}>
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => setView(action.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: SPACING.md,
                width: '100%', padding: `${SPACING.lg}px ${SPACING.lg}px`,
                minHeight: 64,
                background: 'transparent',
                border: 'none',
                borderBottom: i < ACTIONS.length - 1
                  ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`
                  : 'none',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: action.color + (isDark ? '20' : '10'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={22} color={action.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: t.text }}>
                  {action.label}
                </div>
                <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 1 }}>
                  {action.desc}
                </div>
              </div>
              <IconChevronRight size={18} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
