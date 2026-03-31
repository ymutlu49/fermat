// ─── Ferhenga Matematîkê — HomeView (Warm & Vibrant Redesign) ────────────────
import { useState, useMemo } from 'react';
import { ALL_CONCEPTS, SECTIONS, LEITNER_KNOWN_BOX, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN, MOTIVATIONAL_QUOTES, getDailyConceptIndex, SYLLABLES } from '@data';
import { getSectionColor } from '@utils/helpers.js';
import { useMediaQuery, useSpeech } from '@hooks';
import { ProgressBar, SpeakButton, ScoreCircle } from '@components/ui';
import {
  IconBook, IconCards, IconQuizIcon, IconPuzzle,
  IconPencil, IconLightbulb, IconMap, IconClipboard,
} from '@components/icons';

// ── Primary actions with gradient colors ────────────────────────────────────
const PRIMARY_ACTIONS = [
  { id: 'dict',  icon: IconBook,     label: 'Ferheng',       desc: 'Hemû têgehan bibîne',    color: '#0F766E', colorEnd: '#0D9488', emoji: '📖' },
  { id: 'flash', icon: IconCards,    label: 'Pirs û Bersiv', desc: 'Bi kartan fêr bibe',     color: '#C2410C', colorEnd: '#EA580C', emoji: '🃏' },
  { id: 'quiz',  icon: IconQuizIcon, label: 'Azmûn',         desc: 'Zanîna xwe biceribîne',  color: '#166534', colorEnd: '#15803D', emoji: '❓' },
  { id: 'match', icon: IconPuzzle,   label: 'Cot Bike',      desc: 'Peyv û wateyan bide hev', color: '#5B21B6', colorEnd: '#7C3AED', emoji: '🧩' },
];

// ── Secondary actions ───────────────────────────────────────────────────────
const SECONDARY_ACTIONS = [
  { id: 'write',      icon: IconPencil,    label: 'Binivîse',        color: '#1D4ED8' },
  { id: 'exercise',   icon: IconLightbulb, label: 'Hîndarî',         color: '#0E7490' },
  { id: 'conceptmap', icon: IconMap,        label: 'Nexşe',           color: '#7E22CE' },
  { id: 'worksheet',  icon: IconClipboard,  label: 'Rûpelên Xebatê', color: '#B45309' },
];

export default function HomeView({ theme, isDark, progress, setView, setActiveSectionFilter, gamification }) {
  const t = theme;
  const { isMobile, isTablet, isDesktop } = useMediaQuery();
  const { speak, isSpeaking } = useSpeech();
  const px = isMobile ? SPACING.md : isTablet ? SPACING.lg : SPACING.xl;

  // ── Gamification ──────────────────────────────────────────────────────────
  const { level, dailyProgress, streak, xp } = gamification || {};

  // ── Progress ──────────────────────────────────────────────────────────────
  const flashcardBoxes = progress.flashcardBoxes || {};
  const totalConcepts = ALL_CONCEPTS.length;
  const knownCount = useMemo(
    () => Object.values(flashcardBoxes).filter(v => v >= LEITNER_KNOWN_BOX).length,
    [flashcardBoxes]
  );

  // ── Section stats ─────────────────────────────────────────────────────────
  const sectionStats = useMemo(() => {
    return Object.entries(SECTIONS).map(([id, sec]) => {
      const sid = parseInt(id);
      const concepts = ALL_CONCEPTS.filter(c => c.s === sid);
      const known = concepts.filter(c => (flashcardBoxes[c.ku + '_' + c.s] || 0) >= LEITNER_KNOWN_BOX).length;
      return { sid, sec, total: concepts.length, known, pct: concepts.length > 0 ? Math.round((known / concepts.length) * 100) : 0 };
    });
  }, [flashcardBoxes]);

  // ── Daily concept ─────────────────────────────────────────────────────────
  const dailyConcept = ALL_CONCEPTS[getDailyConceptIndex(totalConcepts)];
  const dailySyllable = SYLLABLES[dailyConcept?.ku] || '';
  const dailyColors = dailyConcept ? getSectionColor(dailyConcept.s, isDark) : null;

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 6 ? 'Şevbaş' : hour < 18 ? 'Rojbaş' : 'Êvarbaş';
  const greetEmoji = hour < 6 ? '🌙' : hour < 18 ? '☀️' : '🌆';
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Date.now() / 86400000) % MOTIVATIONAL_QUOTES.length];

  const contentMax = 720;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>

      {/* ═══ ZONE 1 — HERO BANNER ═══ */}
      <div style={{
        padding: `${SPACING.md}px ${px}px ${SPACING.lg}px`,
        marginBottom: SPACING.sm,
      }}>
      <div style={{ maxWidth: contentMax, margin: '0 auto' }}>
        {/* Gamification bar */}
        {level && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: SPACING.sm,
            marginBottom: SPACING.md,
            padding: `${SPACING.sm}px ${SPACING.sm + 2}px`,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,76,92,0.05)',
            borderRadius: RADIUS.lg,
          }}>
            <span style={{ fontSize: '1.3rem' }}>{level.current.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: t.text }}>
                  {level.current.title}
                </span>
                <span style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, fontWeight: FONT_WEIGHT.semibold }}>
                  {xp} XP
                </span>
              </div>
              <ProgressBar value={level.progressToNext * 100} max={100} color={t.primary} bgColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,76,92,0.12)'} height={5} />
            </div>
            <div style={{
              padding: `3px ${SPACING.sm + 2}px`, borderRadius: RADIUS.full,
              background: streak >= 3
                ? (isDark ? 'rgba(255,107,107,0.2)' : 'rgba(231,111,81,0.15)')
                : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
              color: streak >= 3 ? t.accent : t.textMuted,
            }}>
              🔥 {streak || 0}
            </div>
            <div style={{
              padding: `3px ${SPACING.sm + 2}px`, borderRadius: RADIUS.full,
              background: dailyProgress?.isComplete
                ? (isDark ? 'rgba(82,183,136,0.2)' : 'rgba(45,106,79,0.12)')
                : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
              color: dailyProgress?.isComplete ? t.success : t.textMuted,
            }}>
              {dailyProgress?.xp || 0}/{dailyProgress?.xpTarget || 100}
            </div>
          </div>
        )}

        {/* Greeting + Quote */}
        <div style={{ marginBottom: SPACING.md }}>
          <div style={{
            fontSize: isMobile ? FONT_SIZE.xl : FONT_SIZE.xxl,
            fontWeight: FONT_WEIGHT.black, color: t.text,
            lineHeight: 1.2, marginBottom: SPACING.xs,
          }}>
            {greetEmoji} {greeting}!
          </div>
          <div style={{
            fontSize: FONT_SIZE.sm, fontStyle: 'italic', color: t.textSecondary,
            lineHeight: 1.5,
          }}>
            "{quote}"
          </div>
        </div>

        {/* Têgeha Rojê */}
        {dailyConcept && (
          <div
            onClick={() => { setActiveSectionFilter(dailyConcept.s); setView('dict'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: SPACING.md,
              padding: `${SPACING.md}px ${SPACING.lg}px`,
              background: dailyColors
                ? (isDark ? dailyColors.bg : dailyColors.bg)
                : t.surface,
              border: `2px solid ${dailyColors?.accent || t.primary}30`,
              borderRadius: RADIUS.xl,
              cursor: 'pointer',
              transition: `all ${DURATION.normal}`,
              boxShadow: isDark
                ? `0 4px 16px ${dailyColors?.accent || t.primary}15`
                : `0 4px 20px ${dailyColors?.accent || t.primary}12`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: SPACING.xs,
                padding: `2px ${SPACING.sm + 2}px`,
                borderRadius: RADIUS.full,
                background: dailyColors?.accent + '20',
                marginBottom: SPACING.xs,
              }}>
                <span style={{
                  fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
                  color: dailyColors?.accent || t.primary,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  ✦ Têgeha Rojê
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs + 2 }}>
                <span style={{
                  fontSize: isMobile ? FONT_SIZE.lg : FONT_SIZE.xl,
                  fontWeight: FONT_WEIGHT.black,
                  color: dailyColors?.text || t.text,
                }}>
                  {dailyConcept.ku.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                </span>
                <SpeakButton text={dailyConcept.ku} speak={speak} isSpeaking={isSpeaking} theme={t} size={24} />
              </div>
              {dailySyllable && (
                <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, letterSpacing: '0.06em', marginTop: 2 }}>
                  {dailySyllable}
                </div>
              )}
              <div style={{ fontSize: FONT_SIZE.sm, color: dailyColors?.text || t.textSecondary, opacity: 0.75, marginTop: SPACING.xs }}>
                {dailyConcept.tr} · {dailyConcept.en}
              </div>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: RADIUS.lg,
              background: dailyColors?.accent + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', flexShrink: 0,
            }}>
              {SECTIONS[dailyConcept.s]?.icon || '📘'}
            </div>
          </div>
        )}
      </div>{/* /inner max-width */}
      </div>{/* /hero banner */}

      {/* ═══ ZONE 2 — ACTIONS ═══ */}
      <div style={{ padding: `0 ${px}px`, maxWidth: contentMax, margin: '0 auto' }}>
        <SectionLabel label="Dest bi fêrbûnê bike" theme={t} />

        {/* Primary Actions — Colored Gradient Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: SPACING.sm + 2,
          marginBottom: SPACING.md,
        }}>
          {PRIMARY_ACTIONS.map(action => (
            <PrimaryActionCard
              key={action.id}
              action={action}
              theme={t}
              isDark={isDark}
              isMobile={isMobile}
              onClick={() => setView(action.id)}
            />
          ))}
        </div>

        {/* Secondary Actions — Tinted Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: SPACING.sm + 2,
        }}>
          {SECONDARY_ACTIONS.map(action => (
            <SecondaryActionCard
              key={action.id}
              action={action}
              theme={t}
              isDark={isDark}
              onClick={() => setView(action.id)}
            />
          ))}
        </div>
      </div>

      {/* ═══ ZONE 3 — SECTION EXPLORER ═══ */}
      <div style={{ padding: `${SPACING.lg}px ${px}px 0`, maxWidth: contentMax, margin: '0 auto' }}>
        <SectionLabel label="Beşên Ferhengê" theme={t} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: SPACING.sm + 2,
        }}>
          {sectionStats.map(({ sid, sec, total, known, pct }) => {
            const colors = getSectionColor(sid, isDark);
            return (
              <SectionChip
                key={sid}
                sec={sec} pct={pct} known={known} total={total}
                colors={colors} theme={t} isDark={isDark}
                onClick={() => { setActiveSectionFilter(sid); setView('dict'); }}
              />
            );
          })}
        </div>
      </div>

      {/* ═══ ZONE 4 — PROGRESS DASHBOARD ═══ */}
      <div style={{
        margin: `${SPACING.md}px auto`,
        maxWidth: contentMax,
        marginLeft: 'auto', marginRight: 'auto',
        padding: `0 ${px}px`,
      }}>
      <div style={{
        padding: `${SPACING.lg}px`,
        background: isDark
          ? 'linear-gradient(135deg, rgba(82,183,136,0.08), rgba(78,205,196,0.06))'
          : 'linear-gradient(135deg, rgba(45,106,79,0.06), rgba(15,76,92,0.04))',
        borderRadius: RADIUS.xl,
        border: `1px solid ${isDark ? 'rgba(82,183,136,0.15)' : 'rgba(45,106,79,0.12)'}`,
        display: 'flex', alignItems: 'center', gap: SPACING.lg,
      }}>
        <ScoreCircle
          score={knownCount}
          total={totalConcepts}
          theme={t}
          size={isMobile ? 72 : 84}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
            color: t.text, marginBottom: SPACING.xs + 2,
          }}>
            Pêşketin
          </div>
          <ProgressBar
            value={knownCount} max={totalConcepts}
            color={t.success} bgColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
            height={8}
          />
          <div style={{
            fontSize: FONT_SIZE.xs, color: t.textMuted,
            marginTop: SPACING.xs + 2, fontWeight: FONT_WEIGHT.medium,
          }}>
            {knownCount} ji {totalConcepts} têgehan hatine fêrkirin
          </div>
        </div>
      </div>
      </div>{/* /zone4 max-width wrapper */}

      {/* Bottom spacer */}
      <div style={{ height: isMobile ? 80 : 60 }} />
    </div>
  );
}

// ── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, theme: t }) {
  return (
    <div style={{
      fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.extrabold,
      color: t.textMuted, letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: SPACING.sm + 2,
    }}>
      {label}
    </div>
  );
}

// ── Primary Action Card — Full Gradient ─────────────────────────────────────
function PrimaryActionCard({ action, theme: t, isDark, isMobile, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = action.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: `linear-gradient(135deg, ${action.color}, ${action.colorEnd})`,
        borderRadius: RADIUS.xl,
        padding: isMobile ? `${SPACING.md + 2}px ${SPACING.md}px` : `${SPACING.lg}px`,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: SPACING.md,
        boxShadow: hovered
          ? `0 8px 24px ${action.color}50`
          : `0 4px 16px ${action.color}30`,
        transform: hovered ? 'translateY(-2px) scale(1.01)' : 'none',
        filter: hovered ? 'brightness(1.08)' : 'none',
        transition: `all ${DURATION.normal}`,
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
        minHeight: isMobile ? 76 : 88,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', right: -12, top: -12,
        width: 60, height: 60, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 16, bottom: -8,
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: isMobile ? 44 : 48, height: isMobile ? 44 : 48,
        borderRadius: RADIUS.lg,
        background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        backdropFilter: 'blur(4px)',
      }}>
        <Icon size={isMobile ? 22 : 24} color="#FFFFFF" />
      </div>

      {/* Text */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: isMobile ? FONT_SIZE.base : FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.bold, color: '#FFFFFF',
          lineHeight: 1.2,
          textShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}>
          {action.label}
        </div>
        {!isMobile && (
          <div style={{
            fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.8)',
            marginTop: 3, fontWeight: FONT_WEIGHT.medium,
          }}>
            {action.desc}
          </div>
        )}
      </div>
    </button>
  );
}

// ── Section Chip — Full Color ───────────────────────────────────────────────
function SectionChip({ sec, pct, known, total, colors, theme: t, isDark, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: SPACING.xs + 2,
        padding: `${SPACING.md}px ${SPACING.md}px ${SPACING.sm + 2}px`,
        borderRadius: RADIUS.xl,
        border: `2px solid ${colors.accent}30`,
        background: colors.bg,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: `all ${DURATION.normal}`,
        WebkitTapHighlightColor: 'transparent',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? `0 6px 20px ${colors.accent}25`
          : `0 2px 8px ${colors.accent}10`,
      }}
    >
      {/* Top: emoji badge + section name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
        <div style={{
          width: 34, height: 34, borderRadius: RADIUS.md + 2,
          background: colors.accent + '20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0,
        }}>
          {sec.icon}
        </div>
        <div style={{
          fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold,
          color: colors.text, lineHeight: 1.2, textAlign: 'left',
        }}>
          {sec.short}
        </div>
      </div>

      {/* Mini progress bar */}
      <div style={{
        width: '100%', height: 4, borderRadius: RADIUS.full,
        background: colors.accent + '18',
        overflow: 'hidden',
      }}>
        <div style={{
          width: pct + '%', height: '100%',
          borderRadius: RADIUS.full,
          background: colors.accent,
          transition: `width ${DURATION.slow}`,
        }} />
      </div>

      {/* Stats */}
      <div style={{
        fontSize: FONT_SIZE.xs, color: colors.text,
        fontWeight: FONT_WEIGHT.semibold, opacity: 0.7,
        textAlign: 'left',
      }}>
        {known}/{total} · {pct}%
      </div>
    </button>
  );
}

// ── Secondary Action Card — Tinted ──────────────────────────────────────────
function SecondaryActionCard({ action, theme: t, isDark, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = action.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: action.color + (isDark ? '18' : '0D'),
        borderRadius: RADIUS.lg,
        padding: `${SPACING.md}px ${SPACING.sm}px`,
        border: `1.5px solid ${action.color}${hovered ? '40' : '20'}`,
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: SPACING.xs + 2,
        transition: `all ${DURATION.normal}`,
        WebkitTapHighlightColor: 'transparent',
        minHeight: TOUCH_MIN + 8,
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? `0 4px 12px ${action.color}20` : 'none',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: RADIUS.md + 2,
        background: action.color + (isDark ? '25' : '15'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={ICON_SIZE.lg} color={action.color} />
      </div>
      <span style={{
        fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold,
        color: isDark ? action.color : t.textSecondary,
        lineHeight: 1.1, textAlign: 'center',
      }}>
        {action.label}
      </span>
    </button>
  );
}
