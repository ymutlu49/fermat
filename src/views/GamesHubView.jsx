// ─── FerMat — Games Hub (rich) ─────────────────────────────────────────────
// Each game is presented as a vivid gradient card with its own colour identity,
// session stats, and a clear primary action. The hub is the "menu" that makes
// the player want to come back tomorrow.
import { useMemo } from 'react';
import { FONT_SIZE, FONT_WEIGHT, SPACING, QUIZ_TOTAL_QUESTIONS } from '@data';
import { PageContainer } from '@components/ui';
import { IconQuizIcon, IconPuzzle, IconPencil, IconArrowRight } from '@components/icons';

export default function GamesHubView({ theme, isDark, setView, progress, gamification }) {
  const t = theme;

  // Derive per-game stats from progress + gamification state
  const stats = useMemo(() => {
    const sessions = progress?.sessions || [];
    const quizSessions = sessions.filter(s => typeof s.total === 'number');
    const lastQuiz = quizSessions[quizSessions.length - 1];
    const bestQuiz = quizSessions.reduce((best, s) =>
      (!best || s.correct > best.correct) ? s : best, null);
    const gam = gamification?.gam || {};
    return {
      quiz: {
        played: gam.quizCount || quizSessions.length || 0,
        last: lastQuiz ? `${lastQuiz.correct}/${lastQuiz.total}` : null,
        best: bestQuiz ? `${bestQuiz.correct}/${bestQuiz.total}` : null,
        perfect: gam.perfectQuizzes || 0,
      },
      match: {
        played: gam.matchCount || 0,
      },
      write: {
        correct: gam.writeCorrect || 0,
      },
    };
  }, [progress, gamification]);

  // Each card uses two logo-palette colours that fade into the dark-teal
  // anchor (#0F4C5C) — the same anchor as the HomeView hero. This keeps
  // every gradient in the same family while letting each game keep its
  // own identity colour at the focal (top-left) corner.
  //   Logo palette: teal #0D9488 · coral #EA580C · green #15803D · dark #0F4C5C
  const games = [
    {
      id: 'quiz',
      icon: IconQuizIcon,
      title: 'Azmûn',
      subtitle: 'Zanîna xwe biceribîne',
      hint: `${QUIZ_TOTAL_QUESTIONS} pirs · pirsên ji rastê hilbijartî`,
      from:   '#15803D', // logo green
      mid:    '#166D40',
      to:     '#0F4C5C', // logo dark teal — shared anchor
      shadow: '#15803D',
      stats: stats.quiz.played > 0
        ? [
            { label: 'Lîstik', value: stats.quiz.played },
            stats.quiz.last && { label: 'Dawî', value: stats.quiz.last },
            stats.quiz.best && { label: 'Çêtirîn', value: stats.quiz.best, icon: '🏆' },
          ].filter(Boolean)
        : null,
    },
    {
      id: 'match',
      icon: IconPuzzle,
      title: 'Cot Bîne',
      subtitle: 'Peyv û wateyan bîne hev',
      hint: 'Kart bi kart cot bibîne · bê dem',
      from:   '#0D9488', // logo teal
      mid:    '#0E6F70',
      to:     '#0F4C5C', // logo dark teal — shared anchor
      shadow: '#0D9488',
      stats: stats.match.played > 0
        ? [
            { label: 'Lîstik', value: stats.match.played },
          ]
        : null,
    },
    {
      id: 'write',
      icon: IconPencil,
      title: 'Binivîse',
      subtitle: 'Têgehan bi rêk binivîse',
      hint: 'Tîpan li ser klavyeya xwe binivîse',
      from:   '#EA580C', // logo coral
      mid:    '#9A4014',
      to:     '#0F4C5C', // logo dark teal — shared anchor
      shadow: '#EA580C',
      stats: stats.write.correct > 0
        ? [
            { label: 'Peyvên rast', value: stats.write.correct },
          ]
        : null,
    },
  ];

  // "Recommended" highlight: pick the least-played game so users don't repeat
  const recommended = games.reduce((acc, g) => {
    const played = stats[g.id]?.played || stats[g.id]?.correct || 0;
    return played < (stats[acc.id]?.played || stats[acc.id]?.correct || 0) ? g : acc;
  }, games[0]);

  return (
    <PageContainer>
      {/* ── Header strip ── */}
      <div style={{ marginBottom: SPACING.lg + 4 }}>
        <div style={{
          fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
          color: t.textMuted, textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Lîstik
        </div>
        <div style={{
          fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold,
          color: t.text, marginTop: 2, lineHeight: 1.15,
        }}>
          {recommended && stats[recommended.id]?.played === 0 && stats[recommended.id]?.correct === 0
            ? 'Yek hilbijêre û dest pê bike'
            : 'Berdewam bike, fêr bibe, bilîze'}
        </div>
        {recommended && (
          <div style={{
            fontSize: FONT_SIZE.xs, color: t.textMuted,
            marginTop: 4, fontWeight: FONT_WEIGHT.medium,
          }}>
            <span aria-hidden="true">✨ </span>
            Pêşniyar: {recommended.title}
          </div>
        )}
      </div>

      {/* ── Game cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

      {/* ── Aggregate footer ── */}
      <div style={{
        marginTop: SPACING.xl + 4,
        padding: '12px 14px',
        borderRadius: 14,
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
        border: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ fontSize: 22 }} aria-hidden="true">🏅</div>
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

// ─── Sub-component ─────────────────────────────────────────────────────────

function GameCard({ game, onClick, t, isDark, isRecommended }) {
  const Icon = game.icon;
  // Logo-palette gradient: identity colour fades into shared dark-teal anchor.
  const gradient = `linear-gradient(135deg, ${game.from} 0%, ${game.mid} 55%, ${game.to} 100%)`;
  const restingShadow = isDark
    ? `0 6px 18px ${game.shadow}44, 0 1px 3px rgba(0,0,0,0.30)`
    : `0 8px 20px ${game.shadow}28, 0 1px 2px rgba(15,76,92,0.10)`;
  const hoverShadow = isDark
    ? `0 10px 26px ${game.shadow}55, 0 2px 6px rgba(0,0,0,0.35)`
    : `0 12px 28px ${game.shadow}38, 0 2px 4px rgba(15,76,92,0.12)`;
  return (
    <button
      onClick={onClick}
      aria-label={game.title}
      style={{
        position: 'relative',
        background: gradient,
        border: 'none',
        borderRadius: 20,
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: restingShadow,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = hoverShadow;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = restingShadow;
      }}
    >
      {/* Decorative blob — much softer so the dark anchor reads through */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -30, right: -30,
        width: 130, height: 130, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -20, left: 30,
        width: 70, height: 70, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />

      {/* Recommended badge */}
      {isRecommended && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          padding: '3px 9px',
          borderRadius: 99,
          background: 'rgba(255,255,255,0.16)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#fff', fontSize: '0.6rem',
          fontWeight: FONT_WEIGHT.bold,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          display: 'flex', alignItems: 'center', gap: 4,
          border: '1px solid rgba(255,255,255,0.18)',
        }}>
          <span aria-hidden="true">✨</span> Pêşniyar
        </div>
      )}

      <div style={{ position: 'relative', padding: '18px 18px 16px', color: '#fff' }}>
        {/* Top row: icon + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255,255,255,0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}>
            <Icon size={28} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '1.4rem', fontWeight: FONT_WEIGHT.extrabold,
              letterSpacing: '-0.01em', lineHeight: 1.15,
            }}>
              {game.title}
            </div>
            <div style={{
              fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.85)',
              marginTop: 2, fontWeight: FONT_WEIGHT.medium,
            }}>
              {game.subtitle}
            </div>
            <div style={{
              fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.65)',
              marginTop: 4, fontWeight: FONT_WEIGHT.normal,
            }}>
              {game.hint}
            </div>
          </div>
        </div>

        {/* Stats row */}
        {game.stats && (
          <div style={{
            marginTop: 14,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}>
            {game.stats.map((s, i) => (
              <div key={i} style={{
                padding: '5px 10px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                fontSize: '0.7rem',
                fontWeight: FONT_WEIGHT.semibold,
                color: '#fff',
                display: 'flex', alignItems: 'center', gap: 4,
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                {s.icon && <span aria-hidden="true">{s.icon}</span>}
                <span style={{ color: 'rgba(255,255,255,0.70)' }}>{s.label}:</span>
                <span>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA row */}
        <div style={{
          marginTop: game.stats ? 14 : 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
            color: '#fff', letterSpacing: '0.01em',
          }}>
            {game.stats ? 'Berdewam bike' : 'Dest pê bike'}
          </span>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <IconArrowRight size={16} color="#fff" />
          </div>
        </div>
      </div>
    </button>
  );
}
