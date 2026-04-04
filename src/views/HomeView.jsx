// ─── FerMat — HomeView (Minimal) ─────────────────────────────────────────────
import { useMemo } from 'react';
import { ALL_CONCEPTS, LEITNER_KNOWN_BOX, FONT_SIZE, FONT_WEIGHT } from '@data';
import { ScoreCircle, PageContainer, SectionCard, ActionRow } from '@components/ui';
import { IconBook, IconCards, IconGamepad } from '@components/icons';

// Logo colors: Teal, Coral, Green
const ACTIONS = [
  { id: 'dict',  icon: IconBook,    label: 'Ferheng',  desc: 'Hemû têgehan bibîne', color: '#0D9488' },
  { id: 'flash', icon: IconCards,   label: 'Fêrbûn',   desc: 'Bi kartan fêr bibe',  color: '#EA580C' },
  { id: 'games', icon: IconGamepad, label: 'Lîstik',   desc: 'Azmûn, cot bike...',  color: '#15803D' },
];

export default function HomeView({ theme, isDark, progress, setView }) {
  const t = theme;
  const flashcardBoxes = progress.flashcardBoxes || {};
  const totalConcepts = ALL_CONCEPTS.length;
  const knownCount = useMemo(
    () => Object.values(flashcardBoxes).filter(v => v >= LEITNER_KNOWN_BOX).length,
    [flashcardBoxes]
  );

  return (
    <PageContainer>
      {/* Progress */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <ScoreCircle score={knownCount} total={totalConcepts} theme={t} size={100} />
        <div style={{
          fontSize: FONT_SIZE.sm, color: t.textMuted,
          fontWeight: FONT_WEIGHT.medium, marginTop: 12,
        }}>
          {knownCount} ji {totalConcepts} têgehan hatine fêrkirin
        </div>
      </div>

      {/* Actions */}
      <SectionCard theme={t}>
        {ACTIONS.map((action, i) => (
          <ActionRow
            key={action.id}
            icon={action.icon}
            iconColor={action.color}
            label={action.label}
            desc={action.desc}
            onClick={() => setView(action.id)}
            theme={t}
            isDark={isDark}
            isLast={i === ACTIONS.length - 1}
          />
        ))}
      </SectionCard>
    </PageContainer>
  );
}
