// ─── FerMat — Gamification Hook ────────────────────────────────
import { useCallback, useMemo } from 'react';
import { usePersistedState } from './usePersistedState.js';
import {
  XP_REWARDS, DAILY_GOAL,
  getLevelFromXP, getUnlockedAchievements, getNewAchievements,
} from '@data/gamification.js';

const TODAY = () => new Date().toISOString().slice(0, 10);

const DEFAULT_GAMIFICATION = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  unlockedAchievements: [],
  // daily tracking
  dailyXP: 0,
  dailyDate: null,
  dailyNewConcepts: 0,
  dailyReviews: 0,
  // lifetime stats for achievements
  totalCorrect: 0,
  knownCount: 0,
  quizCount: 0,
  perfectQuizzes: 0,
  writeCorrect: 0,
  matchCount: 0,
  completedSections: 0,
};

// Pure: roll over to today if dailyDate is stale, recompute streak.
function rolloverToToday(prev) {
  const today = TODAY();
  if (prev.dailyDate === today) return prev;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  const newStreak =
    prev.lastActiveDate === yStr ? prev.streak + 1
    : prev.lastActiveDate === today ? prev.streak
    : 1;
  return {
    ...prev,
    dailyDate: today,
    dailyXP: 0,
    dailyNewConcepts: 0,
    dailyReviews: 0,
    streak: newStreak,
    lastActiveDate: today,
  };
}

// Pure reducer: apply an XP action and return the new state + side-effect data.
// Idempotent given the same (prev, action, extra) — safe to invoke twice under StrictMode.
function applyXPAction(prev, action, extra) {
  const reward = XP_REWARDS[action] || 0;
  if (!reward) return { next: prev, xpGained: 0, newAchievements: [] };

  let state = rolloverToToday(prev);
  state = {
    ...state,
    xp: state.xp + reward,
    dailyXP: state.dailyXP + reward,
    totalCorrect: state.totalCorrect + (extra.correct ? 1 : 0),
    knownCount: extra.knownCount ?? state.knownCount,
    quizCount: state.quizCount + (extra.quizComplete ? 1 : 0),
    perfectQuizzes: state.perfectQuizzes + (extra.perfectQuiz ? 1 : 0),
    writeCorrect: state.writeCorrect + (extra.writeCorrect ? 1 : 0),
    matchCount: state.matchCount + (extra.matchComplete ? 1 : 0),
    completedSections: extra.completedSections ?? state.completedSections,
    dailyNewConcepts: state.dailyNewConcepts + (extra.newConcept ? 1 : 0),
    dailyReviews: state.dailyReviews + (extra.review ? 1 : 0),
    lastActiveDate: TODAY(),
  };

  // Streak bonus — only on the first XP-bearing action of the day, and only if streak >= 2
  if (state.streak > 1 && state.dailyXP === reward) {
    state = { ...state, xp: state.xp + XP_REWARDS.streakBonus * Math.min(state.streak, 30) };
  }
  // Daily goal completion bonus — only when crossing the threshold
  if (state.dailyXP >= DAILY_GOAL.xpTarget && state.dailyXP - reward < DAILY_GOAL.xpTarget) {
    state = { ...state, xp: state.xp + XP_REWARDS.dailyGoalComplete };
  }

  const newAchievements = getNewAchievements(state, state.unlockedAchievements);
  if (newAchievements.length) {
    state = {
      ...state,
      unlockedAchievements: [...state.unlockedAchievements, ...newAchievements.map(a => a.id)],
    };
  }

  return { next: state, xpGained: reward, newAchievements };
}

export function useGamification() {
  const [gam, setGam] = usePersistedState('ferhenga_gamification', DEFAULT_GAMIFICATION);

  const awardXP = useCallback((action, extra = {}) => {
    // applyXPAction is pure, so this outer capture is safe under StrictMode:
    // both invocations of the setState updater produce the same { next, ... } given the same prev.
    let result = { xpGained: 0, newAchievements: [] };
    setGam(prev => {
      const { next, xpGained, newAchievements } = applyXPAction(prev, action, extra);
      result = { xpGained, newAchievements };
      return next;
    });
    return result;
  }, [setGam]);

  // ── Derived state ─────────────────────────────────────────────────────
  const level = useMemo(() => getLevelFromXP(gam.xp), [gam.xp]);
  const achievements = useMemo(() => getUnlockedAchievements(gam), [gam]);

  const dailyProgress = useMemo(() => {
    const today = TODAY();
    const isToday = gam.dailyDate === today;
    return {
      xp: isToday ? gam.dailyXP : 0,
      xpTarget: DAILY_GOAL.xpTarget,
      newConcepts: isToday ? gam.dailyNewConcepts : 0,
      newConceptsTarget: DAILY_GOAL.newConcepts,
      reviews: isToday ? gam.dailyReviews : 0,
      reviewsTarget: DAILY_GOAL.reviewConcepts,
      isComplete: isToday && gam.dailyXP >= DAILY_GOAL.xpTarget,
    };
  }, [gam]);

  return {
    gam,
    level,
    achievements,
    dailyProgress,
    streak: gam.streak,
    xp: gam.xp,
    awardXP,
  };
}
