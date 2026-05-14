import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamification } from '../hooks/useGamification.js';
import { XP_REWARDS, DAILY_GOAL } from '../data/gamification.js';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-14T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useGamification — XP awarding', () => {
  it('returns 0 XP for unknown action', () => {
    const { result } = renderHook(() => useGamification());
    let returned;
    act(() => { returned = result.current.awardXP('unknown_action_xyz'); });
    expect(returned.xpGained).toBe(0);
    expect(returned.newAchievements).toEqual([]);
    expect(result.current.xp).toBe(0);
  });

  it('adds XP for a known action', () => {
    const { result } = renderHook(() => useGamification());
    act(() => { result.current.awardXP('flashcardCorrect', { correct: true }); });
    expect(result.current.xp).toBe(XP_REWARDS.flashcardCorrect);
  });

  it('unlocks first_word achievement on first correct answer', () => {
    const { result } = renderHook(() => useGamification());
    let returned;
    act(() => { returned = result.current.awardXP('flashcardCorrect', { correct: true }); });
    const ids = returned.newAchievements.map(a => a.id);
    expect(ids).toContain('first_word');
    // Achievement should only fire once
    act(() => { returned = result.current.awardXP('flashcardCorrect', { correct: true }); });
    expect(returned.newAchievements.map(a => a.id)).not.toContain('first_word');
  });

  it('initialises streak to 1 on first activity', () => {
    const { result } = renderHook(() => useGamification());
    act(() => { result.current.awardXP('flashcardCorrect', { correct: true }); });
    expect(result.current.streak).toBe(1);
  });

  it('daily XP target completion awards the bonus exactly once', () => {
    const { result } = renderHook(() => useGamification());
    // Each quizCorrect = 15 XP. 7 of them = 105 XP, crossing the 100 XP daily goal.
    const beforeXp = 0;
    act(() => {
      for (let i = 0; i < 7; i++) result.current.awardXP('quizCorrect', { correct: true });
    });
    const sevenRewards = XP_REWARDS.quizCorrect * 7;
    // Bonus should have been added exactly once on the crossing call
    expect(result.current.xp).toBe(beforeXp + sevenRewards + XP_REWARDS.dailyGoalComplete);
    // Crossing again on later calls should NOT re-trigger the bonus
    const xpAfterCrossing = result.current.xp;
    act(() => { result.current.awardXP('quizCorrect', { correct: true }); });
    expect(result.current.xp).toBe(xpAfterCrossing + XP_REWARDS.quizCorrect);
  });

  it('persists progress across hook remounts (localStorage)', () => {
    const { result: first, unmount } = renderHook(() => useGamification());
    act(() => { first.current.awardXP('flashcardCorrect', { correct: true }); });
    const xpBefore = first.current.xp;
    unmount();
    const { result: second } = renderHook(() => useGamification());
    expect(second.current.xp).toBe(xpBefore);
  });
});

describe('useGamification — daily progress derived state', () => {
  it('reports today\'s XP under dailyProgress', () => {
    const { result } = renderHook(() => useGamification());
    act(() => { result.current.awardXP('quizCorrect', { correct: true }); });
    expect(result.current.dailyProgress.xp).toBe(XP_REWARDS.quizCorrect);
    expect(result.current.dailyProgress.xpTarget).toBe(DAILY_GOAL.xpTarget);
  });
});
