// ─── Ferhenga Matematîkê — Root Application Component ───────────────────────
import { useState, useCallback, useEffect } from 'react';
import '@/styles/animations.css';

import { ALL_CONCEPTS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN } from '@data';
import { useTheme, useSoundManager, useToast, useMediaQuery, usePersistedState, useGamification, useHashRouter, useBackgroundMusic } from '@hooks';
import { ToastContainer } from '@components/ui';
import { Confetti, AchievementPopup, XPToast } from '@components/Confetti.jsx';
import {
  IconVolume, IconVolumeMute, IconSun, IconMoon, IconMusic, IconMusicOff,
  IconHome, IconBook, IconCards, IconQuizIcon, IconPuzzle,
  IconPencil, IconBarChart, IconLightbulb, IconMessage, IconInfo,
} from '@components/icons';
import {
  SplashView, HomeView, DictionaryView, FlashcardView,
  QuizGame, MatchingGame, WriteGame, StatsView, NexşeView, ExerciseView,
  ConceptMapView, WorksheetView, FeedbackView, AboutView,
} from '@views';
import { trackEvent, trackSession } from '@utils/analytics.js';

// ─── Background decoration — child-friendly emojis + Kurdish math terms ──────
const BG_ITEMS = [
  // Emojis — shapes, numbers, school items (age 4-9 friendly)
  { t: '🔢', x:  3, y:  4, r: -10, s: 2.2 },
  { t: '📐', x: 22, y:  2, r:  12, s: 2.0 },
  { t: '✏️', x: 42, y:  5, r: -8,  s: 1.8 },
  { t: '🌟', x: 62, y:  3, r:  15, s: 2.0 },
  { t: '📏', x: 82, y:  6, r: -12, s: 1.9 },
  { t: '🎯', x: 95, y:  2, r:   8, s: 1.7 },
  // Kurdish terms — row 2
  { t: 'HEJMAR',    x:  8, y: 14, r:   6, s: 1.0 },
  { t: '🍕', x: 30, y: 16, r: -15, s: 2.1 },
  { t: 'GILOVER',   x: 50, y: 13, r:   9, s: 0.95 },
  { t: '🔵', x: 72, y: 18, r: -6,  s: 2.0 },
  { t: 'SÊGOŞE',   x: 88, y: 15, r:  12, s: 0.95 },
  // Emojis + terms — row 3
  { t: '🧩', x:  2, y: 28, r:  10, s: 2.0 },
  { t: 'PÎVANDIN',  x: 18, y: 30, r:  -7, s: 0.95 },
  { t: '➕', x: 38, y: 26, r:  18, s: 2.2 },
  { t: 'ÇARÇIK',    x: 56, y: 32, r:  -5, s: 0.95 },
  { t: '🎲', x: 78, y: 28, r:  14, s: 2.0 },
  { t: '✖️', x: 93, y: 33, r: -10, s: 1.8 },
  // Row 4
  { t: '🍎', x:  5, y: 42, r:  -8, s: 1.9 },
  { t: 'KIRARÎ',    x: 22, y: 45, r:  10, s: 0.95 },
  { t: '🔺', x: 42, y: 40, r: -14, s: 2.1 },
  { t: 'PARJIMAR',  x: 60, y: 44, r:   7, s: 0.95 },
  { t: '📊', x: 80, y: 42, r: -12, s: 1.8 },
  // Row 5
  { t: '1️⃣', x:  8, y: 56, r:  12, s: 1.6 },
  { t: 'HEJMARDAN', x: 28, y: 58, r:  -6, s: 0.95 },
  { t: '🌈', x: 48, y: 54, r:  16, s: 2.0 },
  { t: 'REQEM',     x: 68, y: 57, r:  -9, s: 0.95 },
  { t: '⭐', x: 88, y: 55, r:   8, s: 2.0 },
  // Row 6
  { t: '🎓', x:  3, y: 70, r: -10, s: 1.9 },
  { t: 'CÎYOMETRÎ', x: 20, y: 72, r:   8, s: 0.95 },
  { t: '🧮', x: 42, y: 68, r: -16, s: 2.0 },
  { t: 'DANE',      x: 60, y: 73, r:   5, s: 0.95 },
  { t: '🔷', x: 80, y: 70, r: -8,  s: 1.8 },
  // Row 7
  { t: '📖', x:  6, y: 84, r:  14, s: 1.8 },
  { t: 'ZANIST',    x: 25, y: 86, r:  -7, s: 0.95 },
  { t: '🎨', x: 45, y: 82, r:  10, s: 2.0 },
  { t: 'MATEMATÎK', x: 65, y: 85, r: -12, s: 0.95 },
  { t: '💡', x: 85, y: 83, r:   6, s: 1.9 },
  // Bottom
  { t: '🏆', x: 12, y: 94, r:  -8, s: 1.8 },
  { t: '➗', x: 35, y: 96, r:  12, s: 2.0 },
  { t: '🌍', x: 55, y: 93, r: -10, s: 1.9 },
  { t: '➖', x: 75, y: 95, r:   8, s: 2.0 },
  { t: '🎈', x: 92, y: 92, r: -14, s: 1.8 },
];

function BackgroundDecoration({ isDark }) {
  const textColor = isDark ? 'rgba(78,205,196,0.10)' : 'rgba(15,118,110,0.07)';
  const emojiOpacity = isDark ? 0.08 : 0.12;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      overflow: 'hidden', pointerEvents: 'none',
    }}>
      {BG_ITEMS.map((item, i) => {
        const isEmoji = /\p{Emoji}/u.test(item.t) && item.t.length <= 3;
        return (
          <span key={i} style={{
            position: 'absolute',
            left: item.x + '%', top: item.y + '%',
            transform: `rotate(${item.r}deg)`,
            fontSize: (isEmoji ? item.s * 1.2 : item.s) + 'rem',
            color: isEmoji ? undefined : textColor,
            opacity: isEmoji ? emojiOpacity : 1,
            fontWeight: FONT_WEIGHT.black,
            userSelect: 'none',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            letterSpacing: isEmoji ? 0 : '0.04em',
          }}>
            {item.t}
          </span>
        );
      })}
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',     icon: IconHome,      label: 'Malper',    color: '#0F766E' },
  { id: 'dict',     icon: IconBook,      label: 'Ferheng',   color: '#2563EB' },
  { id: 'flash',    icon: IconCards,     label: 'P û B',     color: '#EA580C' },
  { id: 'quiz',     icon: IconQuizIcon,  label: 'Azmûn',     color: '#16A34A' },
  { id: 'match',    icon: IconPuzzle,    label: 'Cot Bike',  color: '#7C3AED' },
  { id: 'write',    icon: IconPencil,    label: 'Binivîse',  color: '#1D4ED8' },
  { id: 'exercise', icon: IconLightbulb, label: 'Hîndarî',   color: '#0E7490' },
  { id: 'stats',    icon: IconBarChart,  label: 'Agahî',     color: '#B45309' },
  { id: 'about',    icon: IconInfo,       label: 'Derbarê',    color: '#0F4C5C' },
  { id: 'feedback', icon: IconMessage,   label: 'Pêşniyar',  color: '#059669' },
];

const VIEW_TITLES = {
  home:     'Ferhenga Matematîkê',
  dict:     'Ferheng',
  flash:    'Pirs û Bersiv',
  quiz:     'Azmûn',
  match:    'Cot Bîne',
  write:    'Binivîse',
  exercise: 'Hîndarî',
  stats:    'Pêşketin',
  about:      'Derbarê Ferhengê',
  feedback:   'Pêşniyar û Serrastkirin',
  nexse:      'Nexşeya Têgehan',
  conceptmap: 'Nexşeya Têgehan',
  worksheet:  'Rûpelên Xebatê',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { sounds, isSoundEnabled, toggleSound } = useSoundManager();
  const { isMusicOn, toggleMusic } = useBackgroundMusic();
  const { toasts, showToast } = useToast();
  const { isMobile, isTablet, isDesktop } = useMediaQuery();
  const gamification = useGamification();

  const { view, setView } = useHashRouter('splash');
  const [activeSectionFilter, setActiveSectionFilter] = useState(null);
  const [progress, setProgress] = usePersistedState('ferhenga_progress_v2', {
    flashcardBoxes: {}, totalQuestions: 0, correctAnswers: 0, sessions: [],
  });

  // Gamification UI state
  const [showConfetti, setShowConfetti] = useState(false);
  const [pendingAchievement, setPendingAchievement] = useState(null);
  const [xpToastData, setXpToastData] = useState({ xp: 0, visible: false });

  const t = theme;

  // Track session on mount
  useEffect(() => { trackSession(); }, []);

  // Track page views
  useEffect(() => {
    if (view !== 'splash') trackEvent('view:' + view);
  }, [view]);

  const handleSetView = useCallback((newView) => {
    sounds?.click?.();
    setView(newView);
  }, [sounds]);

  // Wrapped awardXP that shows visual feedback
  const handleAwardXP = useCallback((action, extra = {}) => {
    const { xpGained, newAchievements } = gamification.awardXP(action, extra);
    if (xpGained > 0) {
      setXpToastData({ xp: xpGained, visible: true });
      setTimeout(() => setXpToastData(p => ({ ...p, visible: false })), 2000);
    }
    if (newAchievements?.length) {
      setShowConfetti(true);
      sounds?.complete?.();
      setPendingAchievement(newAchievements[0]);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    return { xpGained, newAchievements };
  }, [gamification, sounds]);

  // ── Derived layout values ─────────────────────────────────────────────────
  const showNavLabels = !isMobile;
  const navHeight = isMobile ? 52 : 56;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      height: '100dvh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: view === 'home'
        ? (isDark ? '#0F1419' : '#F5F0EB')
        : t.bg,
      color: t.text,
      transition: `background ${DURATION.normal}, color ${DURATION.normal}`,
    }}>
      <BackgroundDecoration isDark={isDark} />
      <ToastContainer toasts={toasts} theme={theme} />
      <Confetti active={showConfetti} />
      <XPToast xp={xpToastData.xp} visible={xpToastData.visible} />
      {pendingAchievement && (
        <AchievementPopup
          achievement={pendingAchievement}
          onClose={() => setPendingAchievement(null)}
        />
      )}

      {/* ── Splash ── */}
      {view === 'splash' && (
        <SplashView onStart={() => setView('home')} />
      )}

      {/* ── Main app ── */}
      {view !== 'splash' && (
        <>
          {/* Top bar */}
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isMobile
              ? `${SPACING.sm}px ${SPACING.md}px`
              : `${SPACING.sm + 2}px ${SPACING.lg}px`,
            background: view === 'home' ? 'transparent' : t.surface,
            borderBottom: view === 'home' ? 'none' : ('1px solid ' + t.border),
            boxShadow: view === 'home' ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
            flexShrink: 0, zIndex: 10,
            minHeight: isMobile ? TOUCH_MIN + 4 : TOUCH_MIN + 10,
          }}>
            {/* Logo + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? SPACING.sm : SPACING.sm + 2 }}>
              <img
                src={import.meta.env.BASE_URL + 'favicon.svg'}
                alt="Ferhenga Matematîkê"
                style={{
                  width: isMobile ? 32 : 36,
                  height: isMobile ? 32 : 36,
                  borderRadius: RADIUS.md,
                  flexShrink: 0,
                }}
              />
              <div style={{ lineHeight: 1.15 }}>
                <div style={{
                  fontSize: isMobile ? '0.8rem' : FONT_SIZE.base,
                  fontWeight: FONT_WEIGHT.extrabold, color: t.text,
                }}>
                  {VIEW_TITLES[view] || 'Ferhenga Matematîkê'}
                </div>
                {isDesktop && view === 'home' && (
                  <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 1 }}>
                    Pêşdibistanî – Dibistana Seretayî
                  </div>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm - 2 }}>
              <IconBtn onClick={toggleMusic} label={isMusicOn ? 'Muzîkê daxe' : 'Muzîk veke'} theme={t}>
                {isMusicOn
                  ? <IconMusic size={ICON_SIZE.md - 2} color={t.primary} />
                  : <IconMusicOff size={ICON_SIZE.md - 2} color={t.textMuted} />
                }
              </IconBtn>
              <IconBtn onClick={toggleSound} label={isSoundEnabled ? 'Dengê daxe' : 'Deng veke'} theme={t}>
                {isSoundEnabled
                  ? <IconVolume size={ICON_SIZE.md - 2} color={t.textMuted} />
                  : <IconVolumeMute size={ICON_SIZE.md - 2} color={t.textMuted} />
                }
              </IconBtn>
              <IconBtn onClick={toggleTheme} label={isDark ? 'Ronahîyê veke' : 'Tarîyê veke'} theme={t}>
                {isDark
                  ? <IconSun size={ICON_SIZE.md - 2} color={t.warning} />
                  : <IconMoon size={ICON_SIZE.md - 2} color={t.textSecondary} />
                }
              </IconBtn>
            </div>
          </header>

          {/* Slogan strip */}
          <div style={{
            textAlign: 'center',
            padding: isMobile
              ? `${SPACING.xs + 1}px ${SPACING.md}px`
              : `${SPACING.xs + 2}px ${SPACING.lg}px`,
            background: view === 'home'
              ? 'transparent'
              : (isDark
                ? 'linear-gradient(90deg, #0D4A55 0%, #0F2E3A 50%, #0D4A55 100%)'
                : 'linear-gradient(90deg, #F0FDFA 0%, #E6F7F5 50%, #F0FDFA 100%)'),
            borderBottom: view === 'home' ? 'none' : ('1px solid ' + (isDark ? 'rgba(78,205,196,0.15)' : 'rgba(15,118,110,0.12)')),
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: isMobile ? FONT_SIZE.xs : '0.72rem',
              fontStyle: 'italic',
              fontWeight: FONT_WEIGHT.medium,
              color: isDark ? 'rgba(78,205,196,0.85)' : '#0F766E',
              letterSpacing: '0.01em',
            }}>
              "Matematîk bi her zimanî diaxive, bi kurdî jî."
            </span>
          </div>

          {/* View content */}
          <main style={{
            flex: 1, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
          }}>
            {view === 'home' && (
              <HomeView
                theme={theme} isDark={isDark}
                progress={progress}
                setView={handleSetView}
                setActiveSectionFilter={setActiveSectionFilter}
                gamification={gamification}
              />
            )}
            {view === 'dict' && (
              <DictionaryView
                theme={theme} isDark={isDark}
                concepts={ALL_CONCEPTS}
                initialSection={activeSectionFilter}
              />
            )}
            {view === 'flash' && (
              <FlashcardView
                theme={theme} isDark={isDark}
                concepts={ALL_CONCEPTS}
                progress={progress}
                setProgress={setProgress}
                sounds={sounds}
                awardXP={handleAwardXP}
              />
            )}
            {view === 'quiz' && (
              <QuizGame
                theme={theme} isDark={isDark}
                concepts={ALL_CONCEPTS}
                progress={progress}
                setProgress={setProgress}
                sounds={sounds}
                awardXP={handleAwardXP}
              />
            )}
            {view === 'match' && (
              <MatchingGame
                theme={theme} isDark={isDark}
                concepts={ALL_CONCEPTS}
                sounds={sounds}
                awardXP={handleAwardXP}
              />
            )}
            {view === 'write' && (
              <WriteGame
                theme={theme} isDark={isDark}
                concepts={ALL_CONCEPTS}
                sounds={sounds}
                awardXP={handleAwardXP}
              />
            )}
            {view === 'exercise' && (
              <ExerciseView
                theme={theme} isDark={isDark}
                sounds={sounds}
              />
            )}
            {view === 'stats' && (
              <StatsView
                theme={theme} isDark={isDark}
                concepts={ALL_CONCEPTS}
                progress={progress}
                setProgress={setProgress}
                showToast={showToast}
                gamification={gamification}
              />
            )}
            {view === 'nexse' && (
              <NexşeView
                theme={theme} isDark={isDark}
                concepts={ALL_CONCEPTS}
              />
            )}
            {view === 'conceptmap' && (
              <ConceptMapView
                theme={theme} isDark={isDark}
                concepts={ALL_CONCEPTS}
              />
            )}
            {view === 'worksheet' && (
              <WorksheetView
                theme={theme} isDark={isDark}
              />
            )}
            {view === 'about' && (
              <AboutView
                theme={theme} isDark={isDark}
              />
            )}
            {view === 'feedback' && (
              <FeedbackView
                theme={theme} isDark={isDark}
              />
            )}
          </main>

          {/* Bottom navigation */}
          <nav
            role="navigation"
            aria-label="Rêgeza jêrîn"
            style={{
              display: 'flex',
              background: t.surface,
              borderTop: '1px solid ' + t.border,
              boxShadow: '0 -1px 8px rgba(0,0,0,0.06)',
              flexShrink: 0,
              zIndex: 10,
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {NAV_ITEMS.map(item => {
              const isActive = view === item.id;
              const Icon = item.icon;
              const activeColor = item.color;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSetView(item.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={item.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile
                      ? `${SPACING.sm + 2}px ${SPACING.xs - 2}px`
                      : `${SPACING.sm - 1}px ${SPACING.xs - 2}px ${SPACING.sm + 1}px`,
                    minHeight: navHeight,
                    background: isActive
                      ? (isDark ? activeColor + '18' : activeColor + '0C')
                      : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? activeColor : t.textMuted,
                    transition: `all ${DURATION.fast}`,
                    position: 'relative',
                    fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      top: 0, left: '50%',
                      transform: 'translateX(-50%)',
                      width: ICON_SIZE.xl, height: 3,
                      borderRadius: `0 0 ${RADIUS.sm}px ${RADIUS.sm}px`,
                      background: activeColor,
                    }} />
                  )}

                  {/* Icon */}
                  <span style={{
                    display: 'flex',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    transition: `transform ${DURATION.fast}`,
                    marginBottom: showNavLabels ? SPACING.xs - 1 : 0,
                  }}>
                    <Icon size={ICON_SIZE.md} color={isActive ? activeColor : t.textMuted} />
                  </span>

                  {/* Label — hidden on mobile */}
                  {showNavLabels && (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: isActive ? FONT_WEIGHT.bold : FONT_WEIGHT.medium,
                      letterSpacing: '-0.01em',
                      lineHeight: 1,
                      color: isActive ? activeColor : t.textMuted,
                    }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}

// ── Small icon button helper ──────────────────────────────────────────────────
function IconBtn({ children, onClick, label, theme: t }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: TOUCH_MIN, height: TOUCH_MIN,
        borderRadius: '50%',
        border: '1px solid ' + t.border,
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.textMuted,
        flexShrink: 0,
        transition: `background ${DURATION.fast}`,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}
