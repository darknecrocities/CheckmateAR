import { CandidateMove, EngineEvaluation } from '../../types/stockfish';
import { SquareCoord } from '../../types/chess';
import { uciToSan } from '../chess/chessValidator';

export interface ParsedUciInfo {
  depth?: number;
  seldepth?: number;
  multipv?: number;
  scoreCp?: number;
  mateIn?: number;
  nodes?: number;
  pv?: string[];
}

/**
 * Parses a single Stockfish UCI 'info' line into structured data.
 */
export function parseUciInfoLine(line: string): ParsedUciInfo | null {
  if (!line.startsWith('info ')) return null;

  const tokens = line.split(' ');
  const result: ParsedUciInfo = {};

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === 'depth' && tokens[i + 1]) {
      result.depth = parseInt(tokens[++i], 10);
    } else if (token === 'seldepth' && tokens[i + 1]) {
      result.seldepth = parseInt(tokens[++i], 10);
    } else if (token === 'multipv' && tokens[i + 1]) {
      result.multipv = parseInt(tokens[++i], 10);
    } else if (token === 'score') {
      const type = tokens[++i];
      const val = parseInt(tokens[++i], 10);
      if (type === 'cp') {
        result.scoreCp = val;
      } else if (type === 'mate') {
        result.mateIn = val;
      }
    } else if (token === 'nodes' && tokens[i + 1]) {
      result.nodes = parseInt(tokens[++i], 10);
    } else if (token === 'pv') {
      result.pv = tokens.slice(i + 1);
      break;
    }
  }

  return result;
}

/**
 * Formats centipawn or mate score for display (e.g. "+0.26", "-1.45", "M2").
 */
export function formatEvaluationScore(scoreCp?: number, mateIn?: number): string {
  if (mateIn !== undefined) {
    return mateIn > 0 ? `+M${mateIn}` : `-M${Math.abs(mateIn)}`;
  }
  if (scoreCp !== undefined) {
    const pawns = (scoreCp / 100).toFixed(2);
    return scoreCp > 0 ? `+${pawns}` : pawns;
  }
  return '0.00';
}

/**
 * Compiles parsed UCI lines and bestmove line into an EngineEvaluation.
 */
export function buildEngineEvaluation(
  fen: string,
  bestMoveUci: string,
  candidatesMap: Map<number, ParsedUciInfo>
): EngineEvaluation {
  const primaryLine = candidatesMap.get(1);
  const bestMoveSan = uciToSan(fen, bestMoveUci);

  const candidates: CandidateMove[] = [];
  candidatesMap.forEach((info) => {
    if (info.pv && info.pv.length > 0) {
      const uci = info.pv[0];
      const from = uci.slice(0, 2) as SquareCoord;
      const to = uci.slice(2, 4) as SquareCoord;
      candidates.push({
        from,
        to,
        uci,
        san: uciToSan(fen, uci),
        scoreCp: info.scoreCp,
        mateIn: info.mateIn,
        pv: info.pv,
        depth: info.depth || 1,
      });
    }
  });

  return {
    bestMove: bestMoveUci,
    bestMoveSan,
    scoreCp: primaryLine?.scoreCp,
    mateIn: primaryLine?.mateIn,
    depth: primaryLine?.depth || 1,
    nodesSearched: primaryLine?.nodes,
    pv: primaryLine?.pv || [bestMoveUci],
    candidates,
    isThinking: false,
    timestamp: Date.now(),
  };
}
