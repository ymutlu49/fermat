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
  IconMoreHorizontal, IconGamepad, IconMap, IconClipboard,
} from '@components/icons';
import {
  SplashView, HomeView, DictionaryView, FlashcardView,
  QuizGame, MatchingGame, WriteGame, StatsView, NexşeView, ExerciseView,
  ConceptMapView, WorksheetView, FeedbackView, AboutView,
} from '@views';
import { trackEvent, trackSession } from '@utils/analytics.js';

// ─── Background decoration — subtle, sparse pattern ─────────────────────────
const BG_ITEMS = [
  { t: '🔢', x:  5, y:  4, r: -10, s: 1.8 },
  { t: '📐', x: 82, y:  6, r:  12, s: 1.6 },
  { t: 'HEJMAR',    x: 12, y: 16, r:   6, s: 0.85 },
  { t: 'SÊGOŞE',   x: 85, y: 18, r:  10, s: 0.85 },
  { t: '➕', x:  4, y: 30, r:  14, s: 1.8 },
  { t: 'PÎVANDIN',  x: 55, y: 28, r:  -5, s: 0.85 },
  { t: '🎲', x: 90, y: 35, r:  12, s: 1.6 },
  { t: 'KIRARÎ',    x: 20, y: 45, r:   8, s: 0.85 },
  { t: '🔺', x: 75, y: 42, r: -12, s: 1.7 },
  { t: 'HEJMARDAN', x: 30, y: 58, r:  -5, s: 0.85 },
  { t: '⭐', x: 88, y: 55, r:   8, s: 1.6 },
  { t: '🧮', x:  6, y: 70, r: -14, s: 1.6 },
  { t: 'CÎYOMETRÎ', x: 65, y: 72, r:   6, s: 0.85 },
  { t: '📖', x:  8, y: 84, r:  12, s: 1.5 },
  { t: 'MATEMATÎK', x: 60, y: 86, r: -10, s: 0.85 },
  { t: '🏆', x: 88, y: 92, r:  -6, s: 1.5 },
];

function BackgroundDecoration({ isDark }) {
  const textColor = isDark ? 'rgba(78,205,196,0.04)' : 'rgba(15,118,110,0.03)';
  const emojiOpacity = isDark ? 0.03 : 0.04;
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
  { id: 'flash',    icon: IconCards,     label: 'Fêrbûn',    color: '#EA580C' },
  { id: 'games',    icon: IconGamepad,   label: 'Lîstik',    color: '#16A34A' },
  { id: 'stats',    icon: IconBarChart,  label: 'Agahî',     color: '#B45309' },
  { id: 'more',     icon: IconMoreHorizontal, label: 'Zêdetir', color: '#64748B' },
];

// Views that belong to "games" and "more" hub tabs
const GAMES_VIEWS = ['quiz', 'match', 'write'];
const MORE_VIEWS = ['exercise', 'about', 'feedback', 'conceptmap', 'worksheet'];

const VIEW_TITLES = {
  home:       'Ferhenga Matematîkê',
  dict:       'Ferheng',
  flash:      'Pirs û Bersiv',
  games:      'Lîstik',
  quiz:       'Azmûn',
  match:      'Cot Bîne',
  write:      'Binivîse',
  more:       'Zêdetir',
  exercise:   'Hîndarî',
  stats:      'Pêşketin',
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
  const showNavLabels = true; // Always show labels with 6 tabs
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
            {view === 'games' && (
              <GamesHubView theme={theme} isDark={isDark} isMobile={isMobile} setView={handleSetView} />
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
            {view === 'more' && (
              <MoreHubView theme={theme} isDark={isDark} isMobile={isMobile} setView={handleSetView} />
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
              const isActive = view === item.id
                || (item.id === 'games' && GAMES_VIEWS.includes(view))
                || (item.id === 'more' && MORE_VIEWS.includes(view));
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

// ── Games Hub View ───────────────────────────────────────────────────────────
function GamesHubView({ theme: t, isDark, isMobile, setView }) {
  const games = [
    { id: 'quiz',  icon: IconQuizIcon, label: 'Azmûn',    desc: 'Zanîna xwe biceribîne',     color: '#166534', colorEnd: '#15803D' },
    { id: 'match', icon: IconPuzzle,   label: 'Cot Bike',  desc: 'Peyv û wateyan bide hev',   color: '#5B21B6', colorEnd: '#7C3AED' },
    { id: 'write', icon: IconPencil,   label: 'Binivîse',  desc: 'Têgehan bi rêk binivîse',   color: '#1D4ED8', colorEnd: '#3B82F6' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: `${SPACING.xl}px ${isMobile ? SPACING.md : SPACING.xl}px` }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: t.text, marginBottom: SPACING.xl }}>
          Lîstik
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.md }}>
          {games.map(g => {
            const Icon = g.icon;
            return (
              <button key={g.id} onClick={() => setView(g.id)} style={{
                display: 'flex', alignItems: 'center', gap: SPACING.lg,
                padding: `${SPACING.lg}px ${SPACING.xl}px`,
                background: `linear-gradient(135deg, ${g.color}, ${g.colorEnd})`,
                borderRadius: RADIUS.xl, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
                transition: `all ${DURATION.normal}`,
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: RADIUS.lg,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={24} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: '#fff' }}>{g.label}</div>
                  <div style={{ fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{g.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── More Hub View ────────────────────────────────────────────────────────────
function MoreHubView({ theme: t, isDark, isMobile, setView }) {
  const items = [
    { id: 'exercise',   icon: IconLightbulb, label: 'Hîndarî',              desc: 'Temrîn û pratîk',    color: '#0E7490' },
    { id: 'conceptmap', icon: IconMap,        label: 'Nexşeya Têgehan',      desc: 'Têgehan bi nexşeyê bibîne', color: '#7E22CE' },
    { id: 'worksheet',  icon: IconClipboard,  label: 'Rûpelên Xebatê',       desc: 'Rûpelên çapkirî',    color: '#B45309' },
    { id: 'about',      icon: IconInfo,       label: 'Derbarê Ferhengê',      desc: 'Agahdarî û pêşgotin', color: '#0F4C5C' },
    { id: 'feedback',   icon: IconMessage,    label: 'Pêşniyar û Serrastkirin', desc: 'Pêşniyarên xwe bişîne', color: '#059669' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: `${SPACING.xl}px ${isMobile ? SPACING.md : SPACING.xl}px` }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: t.text, marginBottom: SPACING.xl }}>
          Zêdetir
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setView(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: SPACING.md,
                padding: `${SPACING.md}px ${SPACING.lg}px`,
                background: t.surface, borderRadius: RADIUS.lg,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: `all ${DURATION.normal}`,
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: RADIUS.md,
                  background: item.color + (isDark ? '25' : '10'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: t.text }}>{item.label}</div>
                  <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 1 }}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
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
        border: 'none',
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
