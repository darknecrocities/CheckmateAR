import AsyncStorage from '@react-native-async-storage/async-storage';
import { StrategyDifficulty } from '../chess/strategyLibrary';

const TRAINER_STORAGE_KEY = '@checkmate_ar_trainer_profile_v1';

export interface TrainerProfile {
  eloRating: number;
  currentStreak: number;
  bestStreak: number;
  solvedStrategyIds: string[];
  bookmarkedStrategyIds: string[];
  totalAttempts: number;
}

export const DEFAULT_TRAINER_PROFILE: TrainerProfile = {
  eloRating: 1200,
  currentStreak: 0,
  bestStreak: 0,
  solvedStrategyIds: [],
  bookmarkedStrategyIds: [],
  totalAttempts: 0,
};

export async function loadTrainerProfile(): Promise<TrainerProfile> {
  try {
    const raw = await AsyncStorage.getItem(TRAINER_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TRAINER_PROFILE };
    const parsed = JSON.parse(raw) as Partial<TrainerProfile>;
    return {
      eloRating: typeof parsed.eloRating === 'number' ? parsed.eloRating : 1200,
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
      solvedStrategyIds: Array.isArray(parsed.solvedStrategyIds) ? parsed.solvedStrategyIds : [],
      bookmarkedStrategyIds: Array.isArray(parsed.bookmarkedStrategyIds)
        ? parsed.bookmarkedStrategyIds
        : [],
      totalAttempts: typeof parsed.totalAttempts === 'number' ? parsed.totalAttempts : 0,
    };
  } catch {
    return { ...DEFAULT_TRAINER_PROFILE };
  }
}

export async function saveTrainerProfile(profile: TrainerProfile): Promise<void> {
  await AsyncStorage.setItem(TRAINER_STORAGE_KEY, JSON.stringify(profile));
}

export async function recordPuzzleOutcome(
  strategyId: string,
  solved: boolean,
  difficulty: StrategyDifficulty
): Promise<TrainerProfile> {
  const profile = await loadTrainerProfile();
  const baseGain =
    difficulty === 'Master' ? 24 : difficulty === 'Intermediate' ? 18 : 12;

  if (solved) {
    const nextStreak = profile.currentStreak + 1;
    const streakBonus = Math.min(nextStreak * 2, 10);
    const updatedSolved = profile.solvedStrategyIds.includes(strategyId)
      ? profile.solvedStrategyIds
      : [...profile.solvedStrategyIds, strategyId];

    const updated: TrainerProfile = {
      ...profile,
      eloRating: profile.eloRating + baseGain + streakBonus,
      currentStreak: nextStreak,
      bestStreak: Math.max(profile.bestStreak, nextStreak),
      solvedStrategyIds: updatedSolved,
      totalAttempts: profile.totalAttempts + 1,
    };
    await saveTrainerProfile(updated);
    return updated;
  }

  const penalty = difficulty === 'Beginner' ? 14 : 10;
  const updated: TrainerProfile = {
    ...profile,
    eloRating: Math.max(800, profile.eloRating - penalty),
    currentStreak: 0,
    totalAttempts: profile.totalAttempts + 1,
  };
  await saveTrainerProfile(updated);
  return updated;
}

export async function toggleStrategyBookmark(
  strategyId: string
): Promise<TrainerProfile> {
  const profile = await loadTrainerProfile();
  const exists = profile.bookmarkedStrategyIds.includes(strategyId);
  const nextBookmarks = exists
    ? profile.bookmarkedStrategyIds.filter((id) => id !== strategyId)
    : [...profile.bookmarkedStrategyIds, strategyId];

  const updated: TrainerProfile = {
    ...profile,
    bookmarkedStrategyIds: nextBookmarks,
  };
  await saveTrainerProfile(updated);
  return updated;
}
