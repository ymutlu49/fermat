// ─── FerMat — Root Application Component ───────────────────────
import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import '@/styles/animations.css';

import { ALL_CONCEPTS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN } from '@data';
import { useTheme, useSoundManager, useToast, useMediaQuery, usePersistedState, useGamification, useHashRouter, useBackgroundMusic } from '@hooks';
import { ToastContainer } from '@components/ui';
import { Confetti, AchievementPopup, XPToast } from '@components/Confetti.jsx';
import {
  IconVolume, IconVolumeMute, IconSun, IconMoon,
  IconHome, IconBook, IconCards, IconBarChart,
  IconMoreHorizontal, IconGamepad,
} from '@components/icons';

// Eager: shown on first paint (Splash) and primary landing (Home).
import SplashView from '@views/SplashView.jsx';
import HomeView from '@views/HomeView.jsx';

// Lazy: loaded on first navigation. Each is its own chunk.
const DictionaryView = lazy(() => import('@views/DictionaryView.jsx'));
const FlashcardView  = lazy(() => import('@views/FlashcardView.jsx'));
const QuizGame       = lazy(() => import('@views/QuizGame.jsx'));
const MatchingGame   = lazy(() => import('@views/MatchingGame.jsx'));
const WriteGame      = lazy(() => import('@views/WriteGame.jsx'));
const StatsView      = lazy(() => import('@views/StatsView.jsx'));
const NexşeView      = lazy(() => import('@views/NexseView.jsx'));
const ExerciseView   = lazy(() => import('@views/ExerciseView.jsx'));
const ConceptMapView = lazy(() => import('@views/ConceptMapView.jsx'));
const WorksheetView  = lazy(() => import('@views/WorksheetView.jsx'));
const FeedbackView   = lazy(() => import('@views/FeedbackView.jsx'));
const AboutView      = lazy(() => import('@views/AboutView.jsx'));
const GamesHubView   = lazy(() => import('@views/GamesHubView.jsx'));
const MoreHubView    = lazy(() => import('@views/MoreHubView.jsx'));

import { trackEvent, trackSession } from '@utils/analytics.js';

// ─── Nav items ────────────────────────────────────────────────────────────────
// Logo colors: Teal #0D9488, Coral #EA580C, Green #15803D, Dark #0F4C5C
const NAV_ITEMS = [
  { id: 'home',     icon: IconHome,      label: 'Malper' },
  { id: 'dict',     icon: IconBook,      label: 'Ferheng' },
  { id: 'flash',    icon: IconCards,     label: 'Fêrbûn' },
  { id: 'games',    icon: IconGamepad,   label: 'Lîstik' },
  { id: 'stats',    icon: IconBarChart,  label: 'Agahî' },
  { id: 'more',     icon: IconMoreHorizontal, label: 'Zêdetir' },
];

// Views that belong to "games" and "more" hub tabs
const GAMES_VIEWS = ['quiz', 'match', 'write'];
const MORE_VIEWS = ['exercise', 'about', 'feedback', 'conceptmap', 'worksheet'];

const VIEW_TITLES = {
  home:       'FerMat',
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
  const navHeight = isMobile ? 50 : 52;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      height: '100dvh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: t.bg,
      color: t.text,
      transition: `background ${DURATION.normal}, color ${DURATION.normal}`,
    }}>
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
            padding: `0 ${isMobile ? SPACING.md : SPACING.lg}px`,
            background: isDark ? '#0D3D4A' : '#0F4C5C',
            flexShrink: 0, zIndex: 10,
            minHeight: 48,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={import.meta.env.BASE_URL + 'favicon.svg'}
                alt="FerMat"
                style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }}
              />
              <span style={{
                fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: '#FFFFFF',
              }}>
                {VIEW_TITLES[view] || 'FerMat'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBtn onClick={toggleSound} label={isSoundEnabled ? 'Dengê daxe' : 'Deng veke'} theme={t}>
                {isSoundEnabled
                  ? <IconVolume size={18} color="rgba(255,255,255,0.7)" />
                  : <IconVolumeMute size={18} color="rgba(255,255,255,0.5)" />
                }
              </IconBtn>
              <IconBtn onClick={toggleTheme} label={isDark ? 'Ronahîyê veke' : 'Tarîyê veke'} theme={t}>
                {isDark
                  ? <IconSun size={18} color="rgba(255,255,255,0.7)" />
                  : <IconMoon size={18} color="rgba(255,255,255,0.7)" />
                }
              </IconBtn>
            </div>
          </header>

          {/* View content */}
          <main style={{
            flex: 1, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            background: isDark
              ? 'radial-gradient(ellipse at 20% 0%, rgba(13,148,136,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(234,88,12,0.04) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 20% 0%, rgba(13,148,136,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(234,88,12,0.03) 0%, transparent 50%)',
          }}>
            <Suspense fallback={<ViewLoadingFallback theme={t} />}>
            {view === 'home' && (
              <HomeView
                theme={theme} isDark={isDark}
                progress={progress}
                setView={handleSetView}
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
              <GamesHubView
                theme={theme} isDark={isDark}
                setView={handleSetView}
                progress={progress}
                gamification={gamification}
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
            {view === 'more' && (
              <MoreHubView theme={theme} isDark={isDark} setView={handleSetView} />
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
            </Suspense>
          </main>

          {/* Bottom navigation — semantic <nav>, modernised pill row with sliding
              indicator above the active tab. Logo palette: teal #0D9488 + coral
              #EA580C. Inactive tabs stay quiet so the active one pops. */}
          <nav
            aria-label="Rêgeza jêrîn"
            style={{
              position: 'relative',
              display: 'flex',
              background: isDark
                ? 'linear-gradient(to top, rgba(15,76,92,0.04), transparent), ' + t.surface
                : 'linear-gradient(to top, rgba(13,148,136,0.025), transparent), ' + t.surface,
              borderTop: '1px solid ' + t.border,
              flexShrink: 0,
              zIndex: 10,
              padding: '6px 6px',
              paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
              boxShadow: isDark
                ? '0 -1px 0 rgba(255,255,255,0.02)'
                : '0 -1px 0 rgba(0,0,0,0.02)',
            }}
          >
            {/* Sliding indicator bar above active tab */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: `calc(${NAV_ITEMS.findIndex(it => (
                  view === it.id
                  || (it.id === 'games' && GAMES_VIEWS.includes(view))
                  || (it.id === 'more' && MORE_VIEWS.includes(view))
                )) * (100 / NAV_ITEMS.length)}% + ${100 / NAV_ITEMS.length / 2}%)`,
                transform: 'translateX(-50%)',
                width: `calc(${100 / NAV_ITEMS.length}% - 24px)`,
                height: 3,
                borderRadius: '0 0 3px 3px',
                background: 'linear-gradient(90deg, #0D9488, #EA580C)',
                transition: 'left 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)',
                opacity: 0.92,
              }}
            />
            {NAV_ITEMS.map(item => {
              const isActive = view === item.id
                || (item.id === 'games' && GAMES_VIEWS.includes(view))
                || (item.id === 'more' && MORE_VIEWS.includes(view));
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSetView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 0 4px',
                    minHeight: navHeight,
                    background: 'transparent',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                    transition: 'transform 0.18s ease',
                    transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                >
                  {/* Icon container — active wears a soft tinted circle */}
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 28,
                      borderRadius: 10,
                      marginBottom: 2,
                      background: isActive
                        ? (isDark
                            ? 'linear-gradient(135deg, rgba(13,148,136,0.30), rgba(234,88,12,0.20))'
                            : 'linear-gradient(135deg, rgba(13,148,136,0.16), rgba(234,88,12,0.12))')
                        : 'transparent',
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <Icon size={20} color={isActive ? '#0D9488' : t.textMuted} />
                  </span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: isActive ? FONT_WEIGHT.bold : FONT_WEIGHT.medium,
                    color: isActive ? '#0D9488' : t.textMuted,
                    lineHeight: 1,
                    letterSpacing: isActive ? '0.01em' : '0.005em',
                    transition: 'color 0.2s ease, font-weight 0.2s ease',
                  }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}

// ── Suspense loading fallback (theme-aware spinner) ──────────────────────────
function ViewLoadingFallback({ theme: t }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Tê barkirin"
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          border: `3px solid ${t.border}`,
          borderTopColor: t.primary,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block',
        }}
      />
      <span style={{ fontSize: '0.85rem', color: t.textMuted, fontWeight: 500 }}>
        Tê barkirin…
      </span>
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
        width: 36, height: 36,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.textMuted,
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}
