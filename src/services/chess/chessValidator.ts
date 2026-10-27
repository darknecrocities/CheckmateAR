import { Chess } from 'chess.js';
import { BoardState, ChessPiece, LegalMove, SquareCoord, PieceColor, PieceType } from '../../types/chess';

/**
 * Validates whether a FEN string represents a legal chess position.
 */
export function validateFen(fen: string): { isValid: boolean; error?: string } {
  try {
    const chess = new Chess(fen);
    return { isValid: true };
  } catch (err: any) {
    return { isValid: false, error: err?.message || 'Invalid FEN format' };
  }
}

/**
 * Parses a FEN into a full BoardState object with piece mappings and game flags.
 */
export function getBoardStateFromFen(fen: string): BoardState {
  const chess = new Chess(fen);
  const pieces: Partial<Record<SquareCoord, ChessPiece | null>> = {};

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const r of ranks) {
    for (const f of files) {
      const coord = `${f}${r}` as SquareCoord;
      const piece = chess.get(coord as any);
      if (piece) {
        pieces[coord] = {
          type: piece.type as PieceType,
          color: piece.color as PieceColor,
          square: coord,
          confidence: 1.0,
        };
      } else {
        pieces[coord] = null;
      }
    }
  }

  return {
    fen: chess.fen(),
    turn: chess.turn() as PieceColor,
    isCheck: chess.inCheck(),
    isCheckmate: chess.isCheckmate(),
    isDraw: chess.isDraw(),
    halfMoves: chess.history().length,
    fullMoves: Math.floor(chess.history().length / 2) + 1,
    pieces: pieces as Record<SquareCoord, ChessPiece | null>,
  };
}

/**
 * Retrieves all legal moves for the current side to move.
 */
export function getLegalMoves(fen: string): LegalMove[] {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    return moves.map((m) => ({
      from: m.from as SquareCoord,
      to: m.to as SquareCoord,
      san: m.san,
      piece: m.piece as PieceType,
      captured: m.captured as PieceType | undefined,
      promotion: m.promotion as PieceType | undefined,
      isCheck: m.san.includes('+') || m.san.includes('#'),
    }));
  } catch {
    return [];
  }
}

/**
 * Converts a UCI move string (e.g. "g8f6", "e7e8q") into Standard Algebraic Notation (SAN).
 */
export function uciToSan(fen: string, uciMove: string): string {
  try {
    const chess = new Chess(fen);
    const from = uciMove.slice(0, 2);
    const to = uciMove.slice(2, 4);
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

    const move = chess.move({
      from,
      to,
      promotion,
    });
    return move ? move.san : uciMove;
  } catch {
    return uciMove;
  }
}

/**
 * Executes a move on a given FEN and returns the new FEN and SAN.
 */
export function executeMove(
  fen: string,
  from: SquareCoord,
  to: SquareCoord,
  promotion?: PieceType
): { success: boolean; newFen?: string; san?: string; isCheck?: boolean; isCheckmate?: boolean } {
  try {
    const chess = new Chess(fen);
    const move = chess.move({ from, to, promotion });
    if (!move) {
      return { success: false };
    }
    return {
      success: true,
      newFen: chess.fen(),
      san: move.san,
      isCheck: chess.inCheck(),
      isCheckmate: chess.isCheckmate(),
    };
  } catch {
    return { success: false };
  }
}
