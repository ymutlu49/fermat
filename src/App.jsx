// ─── FerMat — Root Application Component ───────────────────────
import { useState, useCallback, useEffect } from 'react';
import '@/styles/animations.css';

import { ALL_CONCEPTS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, DURATION, ICON_SIZE, TOUCH_MIN } from '@data';
import { useTheme, useSoundManager, useToast, useMediaQuery, usePersistedState, useGamification, useHashRouter, useBackgroundMusic } from '@hooks';
import { ToastContainer, PageContainer, SectionCard, ActionRow } from '@components/ui';
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
              <GamesHubView theme={theme} isDark={isDark} setView={handleSetView} />
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
              padding: `4px 8px`,
              paddingBottom: `calc(4px + env(safe-area-inset-bottom, 0px))`,
            }}
          >
            {NAV_ITEMS.map(item => {
              const isActive = view === item.id
                || (item.id === 'games' && GAMES_VIEWS.includes(view))
                || (item.id === 'more' && MORE_VIEWS.includes(view));
              const Icon = item.icon;
              const activeColor = '#0D9488'; // Logo teal
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
                    padding: `6px 0`,
                    minHeight: navHeight,
                    background: isActive
                      ? (isDark ? 'rgba(13,148,136,0.15)' : 'rgba(13,148,136,0.08)')
                      : 'none',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                    transition: `background ${DURATION.fast}`,
                  }}
                >
                  <span style={{ display: 'flex', marginBottom: 3 }}>
                    <Icon size={20} color={isActive ? activeColor : t.textMuted} />
                  </span>
                  <span style={{
                    fontSize: '0.58rem',
                    fontWeight: isActive ? FONT_WEIGHT.bold : FONT_WEIGHT.medium,
                    color: isActive ? activeColor : t.textMuted,
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
function GamesHubView({ theme: t, isDark, setView }) {
  const games = [
    { id: 'quiz',  icon: IconQuizIcon, label: 'Azmûn',    desc: 'Zanîna xwe biceribîne',  color: '#15803D' },
    { id: 'match', icon: IconPuzzle,   label: 'Cot Bîne',  desc: 'Peyv û wateyan bîne hev', color: '#0D9488' },
    { id: 'write', icon: IconPencil,   label: 'Binivîse',  desc: 'Têgehan bi rêk binivîse', color: '#EA580C' },
  ];
  return (
    <PageContainer>
      <SectionCard theme={t}>
        {games.map((g, i) => (
          <ActionRow key={g.id} icon={g.icon} iconColor={g.color} label={g.label} desc={g.desc}
            onClick={() => setView(g.id)} theme={t} isDark={isDark} isLast={i === games.length - 1} />
        ))}
      </SectionCard>
    </PageContainer>
  );
}

// ── More Hub View ────────────────────────────────────────────────────────────
function MoreHubView({ theme: t, isDark, setView }) {
  const items = [
    { id: 'exercise',   icon: IconLightbulb, label: 'Hîndarî',              desc: 'Temrîn û pratîk',    color: '#0E7490' },
    { id: 'conceptmap', icon: IconMap,        label: 'Nexşeya Têgehan',      desc: 'Têgehan bi nexşeyê bibîne', color: '#7E22CE' },
    { id: 'worksheet',  icon: IconClipboard,  label: 'Rûpelên Xebatê',       desc: 'Rûpelên çapkirî',    color: '#B45309' },
    { id: 'about',      icon: IconInfo,       label: 'Derbarê Ferhengê',      desc: 'Agahdarî û pêşgotin', color: '#0F4C5C' },
    { id: 'feedback',   icon: IconMessage,    label: 'Pêşniyar û Serrastkirin', desc: 'Pêşniyarên xwe bişîne', color: '#059669' },
  ];
  return (
    <PageContainer>
      <SectionCard theme={t}>
        {items.map((item, i) => (
          <ActionRow key={item.id} icon={item.icon} iconColor={item.color} label={item.label} desc={item.desc}
            onClick={() => setView(item.id)} theme={t} isDark={isDark} isLast={i === items.length - 1} />
        ))}
      </SectionCard>
    </PageContainer>
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
