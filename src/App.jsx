// ─── FerMat — Root Application Component ───────────────────────
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
  IconMoreHorizontal, IconGamepad, IconMap, IconClipboard, IconChevronRight,
} from '@components/icons';
import {
  SplashView, HomeView, DictionaryView, FlashcardView,
  QuizGame, MatchingGame, WriteGame, StatsView, NexşeView, ExerciseView,
  ConceptMapView, WorksheetView, FeedbackView, AboutView,
} from '@views';
import { trackEvent, trackSession } from '@utils/analytics.js';

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
            padding: `${SPACING.sm}px ${isMobile ? SPACING.md : SPACING.lg}px`,
            background: t.surface,
            borderBottom: '1px solid ' + t.border,
            flexShrink: 0, zIndex: 10,
            minHeight: TOUCH_MIN,
          }}>
            <div style={{
              fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: t.text,
            }}>
              {VIEW_TITLES[view] || 'FerMat'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBtn onClick={toggleSound} label={isSoundEnabled ? 'Dengê daxe' : 'Deng veke'} theme={t}>
                {isSoundEnabled
                  ? <IconVolume size={18} color={t.textMuted} />
                  : <IconVolumeMute size={18} color={t.textMuted} />
                }
              </IconBtn>
              <IconBtn onClick={toggleTheme} label={isDark ? 'Ronahîyê veke' : 'Tarîyê veke'} theme={t}>
                {isDark
                  ? <IconSun size={18} color={t.textMuted} />
                  : <IconMoon size={18} color={t.textMuted} />
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
                    padding: `${SPACING.sm}px 0`,
                    minHeight: navHeight,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? t.primary : t.textMuted,
                    fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ display: 'flex', marginBottom: 3 }}>
                    <Icon size={20} color={isActive ? t.primary : t.textMuted} />
                  </span>
                  <span style={{
                    fontSize: '0.58rem',
                    fontWeight: isActive ? FONT_WEIGHT.bold : FONT_WEIGHT.medium,
                    lineHeight: 1,
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

// ── Games Hub View ───────────────────────────────────────────────────────────
function GamesHubView({ theme: t, isDark, isMobile, setView }) {
  const games = [
    { id: 'quiz',  icon: IconQuizIcon, label: 'Azmûn',    desc: 'Zanîna xwe biceribîne',  color: '#16A34A' },
    { id: 'match', icon: IconPuzzle,   label: 'Cot Bike',  desc: 'Peyv û wateyan bide hev', color: '#7C3AED' },
    { id: 'write', icon: IconPencil,   label: 'Binivîse',  desc: 'Têgehan bi rêk binivîse', color: '#1D4ED8' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: `${SPACING.xl}px ${isMobile ? SPACING.md : SPACING.xl}px` }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          background: t.surface, borderRadius: RADIUS.xl,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          overflow: 'hidden',
        }}>
          {games.map((g, i) => {
            const Icon = g.icon;
            return (
              <button key={g.id} onClick={() => setView(g.id)} style={{
                display: 'flex', alignItems: 'center', gap: SPACING.md, width: '100%',
                padding: `${SPACING.lg}px`,
                background: 'transparent',
                borderBottom: i < games.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` : 'none',
                border: 'none', borderBottomStyle: i < games.length - 1 ? 'solid' : 'none',
                borderBottomWidth: i < games.length - 1 ? 1 : 0,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: g.color + (isDark ? '20' : '10'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={22} color={g.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: t.text }}>{g.label}</div>
                  <div style={{ fontSize: FONT_SIZE.xs, color: t.textMuted, marginTop: 1 }}>{g.desc}</div>
                </div>
                <IconChevronRight size={18} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
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
