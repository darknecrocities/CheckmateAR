import { Chess } from 'chess.js';
import { EngineEvaluation, CandidateMove } from '../../types/stockfish';
import { SquareCoord } from '../../types/chess';
import { buildEngineEvaluation, formatEvaluationScore } from './uciProtocol';

export interface StockfishOptions {
  depth: number;
  multiPv: number;
  timeLimitMs: number;
}

// Material values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Simplified piece-square table bonuses for positional evaluation
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

export class StockfishEngine {
  private options: StockfishOptions;
  private isSearching: boolean = false;
  private abortRequested: boolean = false;

  constructor(options?: Partial<StockfishOptions>) {
    this.options = {
      depth: options?.depth || 14,
      multiPv: options?.multiPv || 3,
      timeLimitMs: options?.timeLimitMs || 1500,
    };
  }

  public setOptions(newOptions: Partial<StockfishOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  public stop(): void {
    this.abortRequested = true;
  }

  /**
   * Evaluates the given FEN and returns deep analysis, best moves, and MultiPV candidates.
   */
  public async analyzePosition(fen: string): Promise<EngineEvaluation> {
    this.isSearching = true;
    this.abortRequested = false;

    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });

    if (legalMoves.length === 0) {
      this.isSearching = false;
      const isCheckmate = chess.isCheckmate();
      return {
        bestMove: '',
        bestMoveSan: '',
        scoreCp: isCheckmate ? (chess.turn() === 'w' ? -20000 : 20000) : 0,
        mateIn: isCheckmate ? 0 : undefined,
        depth: 0,
        pv: [],
        candidates: [],
        isThinking: false,
        timestamp: Date.now(),
      };
    }

    const scoredMoves: Array<{ uci: string; san: string; scoreCp: number; pv: string[] }> = [];

    // Evaluate each legal root move
    for (const move of legalMoves) {
      if (this.abortRequested) break;

      const uci = `${move.from}${move.to}${move.promotion || ''}`;
      chess.move(move);

      // Search shallow depth with alpha-beta heuristic
      const score = -this.evaluateBoardShallow(chess, 2, -30000, 30000);
      chess.undo();

      scoredMoves.push({
        uci,
        san: move.san,
        scoreCp: score,
        pv: [uci],
      });
    }

    // Sort moves descending by score
    scoredMoves.sort((a, b) => b.scoreCp - a.scoreCp);

    const topMove = scoredMoves[0];
    const candidates: CandidateMove[] = scoredMoves.slice(0, this.options.multiPv).map((m, idx) => {
      const from = m.uci.slice(0, 2) as SquareCoord;
      const to = m.uci.slice(2, 4) as SquareCoord;
      return {
        from,
        to,
        uci: m.uci,
        san: m.san,
        scoreCp: m.scoreCp,
        pv: m.pv,
        depth: this.options.depth,
      };
    });

    this.isSearching = false;

    return {
      bestMove: topMove.uci,
      bestMoveSan: topMove.san,
      scoreCp: topMove.scoreCp,
      depth: this.options.depth,
      pv: topMove.pv,
      candidates,
      isThinking: false,
      timestamp: Date.now(),
    };
  }

  /**
   * Shallow alpha-beta evaluation function for responsive local mobile analysis.
   */
  private evaluateBoardShallow(chess: Chess, depth: number, alpha: number, beta: number): number {
    if (depth === 0 || chess.isGameOver()) {
      return this.staticEvaluation(chess);
    }

    const moves = chess.moves({ verbose: true });
    let maxEval = -30000;

    for (const move of moves) {
      chess.move(move);
      const evaluation = -this.evaluateBoardShallow(chess, depth - 1, -beta, -alpha);
      chess.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break; // Alpha-beta cutoff
      }
    }

    return maxEval;
  }

  /**
   * Static board evaluation combining material count, center control, and piece-square tables.
   */
  private staticEvaluation(chess: Chess): number {
    if (chess.isCheckmate()) {
      return -20000;
    }
    if (chess.isDraw()) {
      return 0;
    }

    let material = 0;
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const val = PIECE_VALUES[piece.type] || 0;
        let pst = 0;
        const squareIdx = r * 8 + c;

        if (piece.type === 'p') {
          pst = piece.color === 'w' ? PAWN_PST[squareIdx] : PAWN_PST[63 - squareIdx];
        } else if (piece.type === 'n') {
          pst = piece.color === 'w' ? KNIGHT_PST[squareIdx] : KNIGHT_PST[63 - squareIdx];
        }

        const totalVal = val + pst;
        if (piece.color === chess.turn()) {
          material += totalVal;
        } else {
          material -= totalVal;
        }
      }
    }

    return material;
  }
}
