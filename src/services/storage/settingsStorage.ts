import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../../types/study';

const SETTINGS_STORAGE_KEY = '@checkmatear_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  engineDepth: 14,
  engineMultiPv: 3,
  engineTimeLimitMs: 1500,
  enableHaptics: true,
  enableSounds: false,
  enableReducedMotion: false,
  autoDetectMoves: true,
  coachingLevel: 'intermediate',
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getAppSettings();
  const merged = { ...current, ...settings };
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
