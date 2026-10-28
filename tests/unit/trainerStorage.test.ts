import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadTrainerProfile,
  recordPuzzleOutcome,
  toggleStrategyBookmark,
} from '../../src/services/storage/trainerStorage';

describe('Tactical Trainer Persistent Storage (ELO, Streaks & Bookmarks)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('initializes with default 1200 ELO and zero streak', async () => {
    const profile = await loadTrainerProfile();
    expect(profile.eloRating).toBe(1200);
    expect(profile.currentStreak).toBe(0);
    expect(profile.solvedStrategyIds).toEqual([]);
    expect(profile.bookmarkedStrategyIds).toEqual([]);
  });

  it('awards ELO and increments streak on solved Master and Intermediate puzzles', async () => {
    const afterFirst = await recordPuzzleOutcome('discovered-check', true, 'Master');
    expect(afterFirst.eloRating).toBeGreaterThan(1220);
    expect(afterFirst.currentStreak).toBe(1);
    expect(afterFirst.bestStreak).toBe(1);
    expect(afterFirst.solvedStrategyIds).toContain('discovered-check');

    const afterSecond = await recordPuzzleOutcome('morphy-opera-sacrifice', true, 'Intermediate');
    expect(afterSecond.eloRating).toBeGreaterThan(afterFirst.eloRating);
    expect(afterSecond.currentStreak).toBe(2);
    expect(afterSecond.bestStreak).toBe(2);
  });

  it('resets currentStreak while preserving bestStreak on an incorrect attempt', async () => {
    await recordPuzzleOutcome('discovered-check', true, 'Master');
    const afterWrong = await recordPuzzleOutcome('greek-gift', false, 'Intermediate');

    expect(afterWrong.currentStreak).toBe(0);
    expect(afterWrong.bestStreak).toBe(1);
    expect(afterWrong.totalAttempts).toBe(2);
  });

  it('toggles strategy bookmarks persistently in AsyncStorage', async () => {
    const added = await toggleStrategyBookmark('morphy-opera-sacrifice');
    expect(added.bookmarkedStrategyIds).toContain('morphy-opera-sacrifice');

    const removed = await toggleStrategyBookmark('morphy-opera-sacrifice');
    expect(removed.bookmarkedStrategyIds).not.toContain('morphy-opera-sacrifice');
  });
});
