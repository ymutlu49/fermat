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

export function useGamification() {
  const [gam, setGam] = usePersistedState('ferhenga_gamification', DEFAULT_GAMIFICATION);

  // ── Ensure daily counters are fresh ───────────────────────────────────
  const ensureToday = useCallback((prev) => {
    const today = TODAY();
    if (prev.dailyDate === today) return prev;
    // New day: check streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    const newStreak = prev.lastActiveDate === yStr ? prev.streak + 1 : (prev.lastActiveDate === today ? prev.streak : 1);
    return {
      ...prev,
      dailyDate: today,
      dailyXP: 0,
      dailyNewConcepts: 0,
      dailyReviews: 0,
      streak: newStreak,
      lastActiveDate: today,
    };
  }, []);

  // ── Award XP ──────────────────────────────────────────────────────────
  const awardXP = useCallback((action, extra = {}) => {
    const reward = XP_REWARDS[action] || 0;
    if (!reward) return { xpGained: 0, newAchievements: [] };

    let newAchievements = [];

    setGam(prev => {
      let state = ensureToday(prev);
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

      // Streak bonus
      if (state.streak > 1 && state.dailyXP === reward) {
        state.xp += XP_REWARDS.streakBonus * Math.min(state.streak, 30);
      }

      // Daily goal bonus
      if (state.dailyXP >= DAILY_GOAL.xpTarget && (state.dailyXP - reward) < DAILY_GOAL.xpTarget) {
        state.xp += XP_REWARDS.dailyGoalComplete;
      }

      // Check new achievements
      newAchievements = getNewAchievements(state, state.unlockedAchievements);
      if (newAchievements.length) {
        state.unlockedAchievements = [
          ...state.unlockedAchievements,
          ...newAchievements.map(a => a.id),
        ];
      }

      return state;
    });

    return { xpGained: reward, newAchievements };
  }, [setGam, ensureToday]);

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
