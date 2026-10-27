import { EngineEvaluation } from './stockfish';

export interface StudySession {
  id: string;
  title: string;
  fen: string;
  evaluation?: EngineEvaluation;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  pgn?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  engineDepth: number;
  engineMultiPv: number;
  engineTimeLimitMs: number;
  enableHaptics: boolean;
  enableSounds: boolean;
  enableReducedMotion: boolean;
  autoDetectMoves: boolean;
  coachingLevel: 'beginner' | 'intermediate' | 'advanced';
}
