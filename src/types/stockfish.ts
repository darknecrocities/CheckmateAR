import { SquareCoord } from './chess';

export interface CandidateMove {
  from: SquareCoord;
  to: SquareCoord;
  uci: string;
  san: string;
  scoreCp?: number;
  mateIn?: number;
  pv: string[];
  depth: number;
}

export interface EngineEvaluation {
  bestMove: string; // e.g. "g8f6"
  bestMoveSan: string; // e.g. "Nf6"
  scoreCp?: number; // e.g. +26
  mateIn?: number; // e.g. 2 for mate in 2
  depth: number;
  nodesSearched?: number;
  pv: string[]; // sequence of UCI moves
  candidates: CandidateMove[];
  isThinking: boolean;
  timestamp: number;
}
