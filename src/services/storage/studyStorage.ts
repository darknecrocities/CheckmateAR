import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudySession } from '../../types/study';

const STUDY_STORAGE_KEY = '@checkmatear_study_sessions_v1';

export async function saveStudySession(session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudySession> {
  const existing = await getAllStudySessions();
  const newSession: StudySession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updated = [newSession, ...existing];
  await AsyncStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(updated));
  return newSession;
}

export async function getAllStudySessions(): Promise<StudySession[]> {
  try {
    const raw = await AsyncStorage.getItem(STUDY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function deleteStudySession(id: string): Promise<void> {
  const existing = await getAllStudySessions();
  const filtered = existing.filter((s) => s.id !== id);
  await AsyncStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(filtered));
}

export async function clearAllStudySessions(): Promise<void> {
  await AsyncStorage.removeItem(STUDY_STORAGE_KEY);
}

export function exportSessionToPgn(session: StudySession): string {
  const dateStr = new Date(session.createdAt).toISOString().split('T')[0].replace(/-/g, '.');
  return `[Event "CheckmateAR Study Session"]
[Site "Mobile"]
[Date "${dateStr}"]
[Round "1"]
[White "Analysis"]
[Black "Physical Board"]
[Result "*"]
[SetUp "1"]
[FEN "${session.fen}"]

{ ${session.notes || 'Analyzed with CheckmateAR'} } *
`;
}
