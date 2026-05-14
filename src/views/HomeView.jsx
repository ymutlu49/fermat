// ─── FerMat — HomeView (rich landing) ──────────────────────────────────────
// Goal: give a single-glance picture of where the learner is, what they can do
// next, and a small surprise (today's concept) to invite exploration.
import { useMemo } from 'react';
import {
  ALL_CONCEPTS, SECTIONS, LEITNER_KNOWN_BOX,
  FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS,
} from '@data';
import { getSectionColor } from '@utils/helpers.js';
import { PageContainer } from '@components/ui';
import { ConceptVisual } from '@components/visuals';
import {
  IconBook, IconCards, IconGamepad, IconChevronRight, IconArrowRight,
} from '@components/icons';

// Deterministic "concept of the day" — same concept all day, rotates daily.
function pickConceptOfTheDay(concepts) {
  const today = new Date();
  const dayKey = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
  const idx = dayKey % concepts.length;
  return concepts[idx];
}

export default function HomeView({ theme, isDark, progress, setView, gamification }) {
  const t = theme;
  const flashcardBoxes = progress.flashcardBoxes || {};
  const totalConcepts = ALL_CONCEPTS.length;
  const knownCount = useMemo(
    () => Object.values(flashcardBoxes).filter(v => v >= LEITNER_KNOWN_BOX).length,
    [flashcardBoxes]
  );
  const learningCount = useMemo(
    () => Object.values(flashcardBoxes).filter(v => v === 1).length,
    [flashcardBoxes]
  );
  const conceptOfDay = useMemo(() => pickConceptOfTheDay(ALL_CONCEPTS), []);
  const sectionMeta = SECTIONS[conceptOfDay.s];
  const sectionColors = getSectionColor(conceptOfDay.s, isDark);
  const knownPct = totalConcepts > 0 ? Math.round((knownCount / totalConcepts) * 100) : 0;

  // Gamification might be undefined on first render — render lite version
  const level = gamification?.level?.current;
  const next = gamification?.level?.next;
  const xp = gamification?.xp ?? 0;
  const streak = gamification?.streak ?? 0;
  const daily = gamification?.dailyProgress;

  return (
    <PageContainer>
      {/* ── HERO — gradient card with level, XP progress, streak ── */}
      <div
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0D3D4A 0%, #0F4C5C 60%, #EA580C 130%)'
            : 'linear-gradient(135deg, #0F4C5C 0%, #1A6B7F 55%, #EA580C 130%)',
          borderRadius: 20,
          padding: '18px 18px 16px',
          color: '#fff',
          boxShadow: isDark
            ? '0 6px 20px rgba(0,0,0,0.35)'
            : '0 6px 20px rgba(15,76,92,0.20)',
          marginBottom: SPACING.lg,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blob */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -40, right: -40,
            width: 140, height: 140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            filter: 'blur(2px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div
            aria-hidden="true"
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {level?.icon ?? '🌱'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: FONT_WEIGHT.bold,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.65)',
            }}>
              Asta {level?.level ?? 1}
            </div>
            <div style={{
              fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.extrabold,
              lineHeight: 1.15, color: '#fff',
            }}>
              {level?.title ?? 'Destpêk'}
            </div>
          </div>
          <div style={{
            fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
            color: '#fff', textAlign: 'right',
          }}>
            {xp} XP
          </div>
        </div>
        {/* XP progress bar */}
        {next && (
          <div style={{ marginTop: 14, position: 'relative' }}>
            <div style={{
              height: 6, borderRadius: 99,
              background: 'rgba(255,255,255,0.18)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: Math.round((gamification?.level?.progressToNext || 0) * 100) + '%',
                background: 'linear-gradient(90deg, #FCD34D, #FB923C)',
                transition: 'width 0.6s ease-out',
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginTop: 4,
              fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)',
            }}>
              <span>{xp} XP</span>
              <span>{next.xpRequired} XP · {next.title}</span>
            </div>
          </div>
        )}
        {/* Streak + daily goal chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, position: 'relative' }}>
          <div style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold,
          }}>
            <span aria-hidden="true">🔥</span>
            <span>{streak === 1 ? '1 roj' : `${streak} roj`}</span>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: FONT_WEIGHT.medium }}>
              {streak >= 2 ? 'li pey hev' : 'destpêkir'}
            </span>
          </div>
          {daily && (
            <div style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 10,
              background: daily.isComplete
                ? 'rgba(252,211,77,0.25)'
                : 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold,
            }}>
              <span aria-hidden="true">{daily.isComplete ? '🎯' : '⚡'}</span>
              <span>{daily.xp}/{daily.xpTarget} XP</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: FONT_WEIGHT.medium }}>
                îro
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── PROGRESS RING — compact, integrated ── */}
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: SPACING.lg,
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        <CompactRing pct={knownPct} isDark={isDark} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: FONT_SIZE.sm, color: t.textMuted, fontWeight: FONT_WEIGHT.medium }}>
            Pêşketin
          </div>
          <div style={{
            fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.extrabold,
            color: t.text, lineHeight: 1.1, marginTop: 2,
          }}>
            {knownCount}<span style={{ color: t.textMuted, fontWeight: FONT_WEIGHT.medium }}> / {totalConcepts}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: FONT_SIZE.xs, color: t.success, fontWeight: FONT_WEIGHT.semibold }}>
              ● {knownCount} zanî
            </span>
            <span style={{ fontSize: FONT_SIZE.xs, color: t.warning, fontWeight: FONT_WEIGHT.semibold }}>
              ● {learningCount} fêrbûn
            </span>
          </div>
        </div>
      </div>

      {/* ── ACTION CARDS — large, colourful ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <ActionCard
          icon={IconBook}
          label="Ferheng"
          desc={`${totalConcepts} têgeh`}
          tint="#0D9488"
          bg={isDark ? 'rgba(13,148,136,0.18)' : 'rgba(13,148,136,0.08)'}
          onClick={() => setView('dict')}
          t={t} isDark={isDark}
        />
        <ActionCard
          icon={IconCards}
          label="Fêrbûn"
          desc="Bi kartan fêr bibe"
          tint="#EA580C"
          bg={isDark ? 'rgba(234,88,12,0.18)' : 'rgba(234,88,12,0.08)'}
          onClick={() => setView('flash')}
          t={t} isDark={isDark}
        />
      </div>
      <button
        onClick={() => setView('games')}
        aria-label="Lîstik"
        style={{
          width: '100%',
          background: isDark
            ? 'linear-gradient(135deg, rgba(21,128,61,0.22) 0%, rgba(21,128,61,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(21,128,61,0.10) 0%, rgba(21,128,61,0.04) 100%)',
          border: `1px solid ${isDark ? 'rgba(21,128,61,0.30)' : 'rgba(21,128,61,0.18)'}`,
          borderRadius: 16,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'left',
          marginBottom: SPACING.lg,
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(21,128,61,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <IconGamepad size={22} color="#15803D" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold, color: t.text }}>
            Lîstik
          </div>
          <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 2 }}>
            Azmûn · Cot Bîne · Binivîse
          </div>
        </div>
        <IconChevronRight size={18} color={t.textMuted} />
      </button>

      {/* ── CONCEPT OF THE DAY ── */}
      <div style={{
        fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
        color: t.textMuted, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: 8,
      }}>
        Têgeha îro
      </div>
      <button
        onClick={() => setView('dict')}
        aria-label={`Têgeha îro: ${conceptOfDay.ku}`}
        style={{
          width: '100%',
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: 14,
          background: sectionColors.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {conceptOfDay.visual
            ? <ConceptVisual visual={conceptOfDay.visual} theme={t} size={54} />
            : <span style={{ fontSize: '1.8rem' }}>{sectionMeta?.icon}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold,
            color: sectionColors.text, lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {conceptOfDay.ku}
          </div>
          <div style={{
            fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {conceptOfDay.tr} · {sectionMeta?.short}
          </div>
          <div style={{
            fontSize: FONT_SIZE.xs, color: t.textSecondary,
            marginTop: 4, lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {conceptOfDay.df}
          </div>
        </div>
        <IconArrowRight size={16} color={t.textMuted} />
      </button>
    </PageContainer>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ActionCard({ icon: Icon, label, desc, tint, bg, onClick, t, isDark }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: 14,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minHeight: 110,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 6px 16px rgba(0,0,0,0.30)'
          : '0 6px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={tint} />
      </div>
      <div>
        <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.extrabold, color: t.text, lineHeight: 1.2 }}>
          {label}
        </div>
        <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 2 }}>
          {desc}
        </div>
      </div>
    </button>
  );
}

function CompactRing({ pct, isDark }) {
  const size = 52, stroke = 5;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (pct / 100) * C;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}
        strokeWidth={stroke}
      />
      <circle cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke="#0D9488"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${C}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x={size/2} y={size/2}
        textAnchor="middle" dominantBaseline="central"
        fontSize="13" fontWeight="800"
        fill={isDark ? '#E8ECF1' : '#1A2332'}
      >
        {pct}%
      </text>
    </svg>
  );
}
