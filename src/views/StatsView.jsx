// ─── FerMat — StatsView (Minimal + Gamification) ─────────────────────────────
import { useCallback, useState } from 'react';
import {
  ALL_CONCEPTS, SECTIONS, ACHIEVEMENTS, LEITNER_KNOWN_BOX,
  SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT,
} from '@data';
import { getSectionColor } from '@utils/helpers.js';
import {
  ScoreCircle, PageContainer, SectionCard, SectionTitle, StatRow, Modal, ProgressBar,
} from '@components/ui';

export default function StatsView({ theme, isDark, concepts, progress, setProgress, showToast, gamification }) {
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

      {/* ── Gamification: Level + Streak + XP ── */}
      {gamification && (
        <GamificationPanel gamification={gamification} theme={t} isDark={isDark} />
      )}

      {/* Stats */}
      <SectionTitle theme={t}>Pirs û Bersiv</SectionTitle>
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
      <SectionTitle theme={t}>Pêşketina Kartan</SectionTitle>
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

      {/* ── Achievements ── */}
      {gamification && (
        <AchievementsGrid unlockedIds={gamification.gam.unlockedAchievements || []} theme={t} isDark={isDark} />
      )}

      {/* Section distribution */}
      <SectionTitle theme={t}>Beş</SectionTitle>
      <SectionCard theme={t}>
        {Object.entries(SECTIONS).map(([id, sec], i, arr) => {
          const count = sectionCounts[id] || 0;
          const pct = concepts.length > 0 ? Math.round(count / concepts.length * 100) : 0;
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

// ─── Gamification Panel (Level + Streak + Daily Goal) ────────────────────────
function GamificationPanel({ gamification, theme: t, isDark }) {
  const { level, dailyProgress, streak, xp } = gamification;
  const cur = level.current;
  const next = level.next;
  const xpToNext = next ? next.xpRequired - xp : 0;
  const progressPct = Math.round(level.progressToNext * 100);

  return (
    <>
      {/* Level card */}
      <div
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(234,88,12,0.10))'
            : 'linear-gradient(135deg, rgba(13,148,136,0.08), rgba(234,88,12,0.05))',
          border: `1px solid ${isDark ? 'rgba(13,148,136,0.25)' : 'rgba(13,148,136,0.15)'}`,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: isDark ? 'rgba(13,148,136,0.20)' : 'rgba(13,148,136,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {cur.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, fontWeight: FONT_WEIGHT.medium, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Asta {cur.level}
            </div>
            <div style={{ fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.extrabold, color: t.text, lineHeight: 1.2 }}>
              {cur.title}
            </div>
            <div style={{ fontSize: FONT_SIZE.xs, color: t.textSecondary, marginTop: 2 }}>
              {xp} XP{next ? ` · ${xpToNext} XP heya astê pêş` : ' · Asta tewra bilind!'}
            </div>
          </div>
        </div>
        {next && (
          <ProgressBar
            value={progressPct}
            max={100}
            color="#0D9488"
            bgColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
            height={6}
          />
        )}
      </div>

      {/* Streak + Daily goal row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Streak */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: 14,
            textAlign: 'center',
          }}
          aria-label={`Rêze: ${streak} roj`}
        >
          <div style={{ fontSize: 28, lineHeight: 1 }} aria-hidden="true">🔥</div>
          <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginTop: 4, lineHeight: 1 }}>
            {streak}
          </div>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 4, fontWeight: FONT_WEIGHT.medium }}>
            {streak === 1 ? 'Rojek li pey hev' : `${streak} roj li pey hev`}
          </div>
        </div>

        {/* Daily XP goal */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 14,
            padding: 14,
            textAlign: 'center',
          }}
          aria-label={`Armanca rojê: ${dailyProgress.xp} ji ${dailyProgress.xpTarget} XP`}
        >
          <div style={{ fontSize: 28, lineHeight: 1 }} aria-hidden="true">
            {dailyProgress.isComplete ? '🎯' : '⚡'}
          </div>
          <div style={{ fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: t.text, marginTop: 4, lineHeight: 1 }}>
            {dailyProgress.xp}/{dailyProgress.xpTarget}
          </div>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 4, fontWeight: FONT_WEIGHT.medium }}>
            Armanca îro · XP
          </div>
        </div>
      </div>

      {/* Daily progress detail */}
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 14,
          padding: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: t.text, marginBottom: 10 }}>
          Pêşketina îro
        </div>
        <DailyBar
          label="Têgehên nû"
          value={dailyProgress.newConcepts}
          target={dailyProgress.newConceptsTarget}
          color="#EA580C"
          theme={t}
          isDark={isDark}
        />
        <div style={{ height: 8 }} />
        <DailyBar
          label="Dubarekirin"
          value={dailyProgress.reviews}
          target={dailyProgress.reviewsTarget}
          color="#15803D"
          theme={t}
          isDark={isDark}
        />
      </div>
    </>
  );
}

function DailyBar({ label, value, target, color, theme: t, isDark }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: FONT_SIZE.xs, color: t.textSecondary, fontWeight: FONT_WEIGHT.medium }}>{label}</span>
        <span style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, fontWeight: FONT_WEIGHT.semibold }}>{value}/{target}</span>
      </div>
      <ProgressBar
        value={pct}
        max={100}
        color={color}
        bgColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
        height={6}
      />
    </div>
  );
}

// ─── Achievements Grid ───────────────────────────────────────────────────────
function AchievementsGrid({ unlockedIds, theme: t, isDark }) {
  const unlockedSet = new Set(unlockedIds);
  const unlockedCount = ACHIEVEMENTS.filter(a => unlockedSet.has(a.id)).length;

  return (
    <>
      <SectionTitle theme={t}>
        Destkeftî · {unlockedCount}/{ACHIEVEMENTS.length}
      </SectionTitle>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))',
          gap: 10,
          marginBottom: 8,
        }}
      >
        {ACHIEVEMENTS.map(a => {
          const unlocked = unlockedSet.has(a.id);
          return (
            <div
              key={a.id}
              role="img"
              aria-label={`${a.title}${unlocked ? ' (vekirî)' : ' (girtî)'} — ${a.desc}`}
              title={`${a.title} — ${a.desc}`}
              style={{
                background: unlocked
                  ? (isDark ? 'rgba(13,148,136,0.12)' : 'rgba(13,148,136,0.06)')
                  : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                border: `1px solid ${unlocked
                  ? (isDark ? 'rgba(13,148,136,0.30)' : 'rgba(13,148,136,0.20)')
                  : t.border}`,
                borderRadius: 12,
                padding: '10px 6px',
                textAlign: 'center',
                opacity: unlocked ? 1 : 0.45,
                filter: unlocked ? 'none' : 'grayscale(0.85)',
                minHeight: 86,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <div style={{ fontSize: 24, lineHeight: 1 }} aria-hidden="true">
                {unlocked ? a.icon : '🔒'}
              </div>
              <div style={{
                fontSize: '0.65rem', fontWeight: FONT_WEIGHT.semibold,
                color: unlocked ? t.text : t.textMuted,
                lineHeight: 1.2,
              }}>
                {a.title}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
