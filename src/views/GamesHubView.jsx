// ─── FerMat — Games Hub ────────────────────────────────────────────────────
// Same visual grammar as HomeView's action cards (Ferheng / Fêrbûn / Lîstik):
// soft tinted gradient + 44px tinted-icon container + dark text + chevron.
// Logo palette: teal #0D9488 · coral #EA580C · green #15803D · dark #0F4C5C
import { useMemo } from 'react';
import { FONT_SIZE, FONT_WEIGHT, SPACING, QUIZ_TOTAL_QUESTIONS } from '@data';
import { PageContainer } from '@components/ui';
import { IconQuizIcon, IconPuzzle, IconPencil, IconChevronRight } from '@components/icons';

export default function GamesHubView({ theme, isDark, setView, progress, gamification }) {
  const t = theme;

  const stats = useMemo(() => {
    const sessions = progress?.sessions || [];
    const quizSessions = sessions.filter(s => typeof s.total === 'number');
    const lastQuiz = quizSessions[quizSessions.length - 1];
    const bestQuiz = quizSessions.reduce(
      (best, s) => (!best || s.correct > best.correct ? s : best),
      null
    );
    const gam = gamification?.gam || {};
    return {
      quiz: {
        played: gam.quizCount || quizSessions.length || 0,
        last: lastQuiz ? `${lastQuiz.correct}/${lastQuiz.total}` : null,
        best: bestQuiz ? `${bestQuiz.correct}/${bestQuiz.total}` : null,
        perfect: gam.perfectQuizzes || 0,
      },
      match: { played: gam.matchCount || 0 },
      write: { correct: gam.writeCorrect || 0 },
    };
  }, [progress, gamification]);

  // Each game gets a logo-palette accent (rgb triplet for opacity math).
  const games = [
    {
      id: 'quiz',
      icon: IconQuizIcon,
      title: 'Azmûn',
      subtitle: 'Zanîna xwe biceribîne',
      hint: `${QUIZ_TOTAL_QUESTIONS} pirs · pirsên ji rastê hilbijartî`,
      tint:  '#15803D',    // logo green
      rgb:   '21,128,61',
      stats: stats.quiz.played > 0
        ? [
            `${stats.quiz.played} lîstik`,
            stats.quiz.last && `Dawî: ${stats.quiz.last}`,
            stats.quiz.best && `🏆 Çêtirîn: ${stats.quiz.best}`,
          ].filter(Boolean)
        : null,
    },
    {
      id: 'match',
      icon: IconPuzzle,
      title: 'Cot Bîne',
      subtitle: 'Peyv û wateyan bîne hev',
      hint: 'Kart bi kart cot bibîne · bê dem',
      tint:  '#0D9488',    // logo teal
      rgb:   '13,148,136',
      stats: stats.match.played > 0
        ? [`${stats.match.played} lîstik`]
        : null,
    },
    {
      id: 'write',
      icon: IconPencil,
      title: 'Binivîse',
      subtitle: 'Têgehan bi rêk binivîse',
      hint: 'Tîpan li ser klavyeya xwe binivîse',
      tint:  '#EA580C',    // logo coral
      rgb:   '234,88,12',
      stats: stats.write.correct > 0
        ? [`${stats.write.correct} peyv rast`]
        : null,
    },
  ];

  // Recommended: the game with the least activity, to nudge exploration.
  const recommended = games.reduce((acc, g) => {
    const played = stats[g.id]?.played || stats[g.id]?.correct || 0;
    return played < (stats[acc.id]?.played || stats[acc.id]?.correct || 0) ? g : acc;
  }, games[0]);

  return (
    <PageContainer>
      {/* Section label — matches "Têgeha îro" style in HomeView */}
      <div style={{
        fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
        color: t.textMuted, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 10,
      }}>
        Lîstik
      </div>

      {/* Game cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {games.map(game => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => setView(game.id)}
            t={t} isDark={isDark}
            isRecommended={game.id === recommended.id}
          />
        ))}
      </div>

      {/* Aggregate footer — matches stat card style from HomeView */}
      <div style={{
        marginTop: SPACING.xl,
        padding: '12px 14px',
        borderRadius: 14,
        background: t.surface,
        border: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div aria-hidden="true" style={{
          width: 36, height: 36, borderRadius: 10,
          background: isDark ? 'rgba(252,211,77,0.18)' : 'rgba(252,211,77,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.05rem', flexShrink: 0,
        }}>
          🏅
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, fontWeight: FONT_WEIGHT.medium }}>
            Tevahî
          </div>
          <div style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: t.text, marginTop: 1 }}>
            {stats.quiz.played + stats.match.played} lîstik · {stats.quiz.perfect} azmûna bê çewtî · {stats.write.correct} peyv
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// ─── GameCard — same shape as HomeView's full-width Lîstik card ────────────
function GameCard({ game, onClick, t, isDark, isRecommended }) {
  const Icon = game.icon;
  return (
    <button
      onClick={onClick}
      aria-label={game.title}
      style={{
        width: '100%',
        background: isDark
          ? `linear-gradient(135deg, rgba(${game.rgb},0.22) 0%, rgba(${game.rgb},0.08) 100%)`
          : `linear-gradient(135deg, rgba(${game.rgb},0.10) 0%, rgba(${game.rgb},0.04) 100%)`,
        border: `1px solid ${isDark ? `rgba(${game.rgb},0.30)` : `rgba(${game.rgb},0.18)`}`,
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? `0 6px 16px rgba(${game.rgb},0.20)`
          : `0 6px 16px rgba(${game.rgb},0.14)`;
        e.currentTarget.style.borderColor = `rgba(${game.rgb},0.35)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isDark
          ? `rgba(${game.rgb},0.30)`
          : `rgba(${game.rgb},0.18)`;
      }}
    >
      {/* Icon avatar — tinted square */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `rgba(${game.rgb},0.18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={game.tint} />
      </div>

      {/* Text block */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <div style={{
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.extrabold,
            color: t.text,
            lineHeight: 1.2,
          }}>
            {game.title}
          </div>
          {isRecommended && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: FONT_WEIGHT.extrabold,
              color: game.tint,
              padding: '2px 8px',
              borderRadius: 99,
              background: `rgba(${game.rgb},0.15)`,
              border: `1px solid rgba(${game.rgb},0.35)`,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <span aria-hidden="true">✨</span> Pêşniyar
            </span>
          )}
        </div>
        <div style={{
          fontSize: FONT_SIZE.xs,
          color: t.textMuted,
          marginTop: 2,
        }}>
          {game.subtitle}
        </div>
        {game.stats && (
          <div style={{
            fontSize: '0.7rem',
            color: t.textSecondary,
            fontWeight: FONT_WEIGHT.semibold,
            marginTop: 6,
            letterSpacing: '0.01em',
          }}>
            {game.stats.join(' · ')}
          </div>
        )}
      </div>

      <IconChevronRight size={18} color={t.textMuted} />
    </button>
  );
}
