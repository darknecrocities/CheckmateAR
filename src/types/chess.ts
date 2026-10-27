export type FileLetter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type RankNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type SquareCoord = `${FileLetter}${RankNumber}`;

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  square: SquareCoord;
  confidence: number;
}

export type BoardMatrix = (ChessPiece | null)[][]; // 8x8 matrix [rank 0..7][file 0..7]

export interface BoardState {
  fen: string;
  turn: PieceColor;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  halfMoves: number;
  fullMoves: number;
  pieces: Record<SquareCoord, ChessPiece | null>;
}

export interface LegalMove {
  from: SquareCoord;
  to: SquareCoord;
  san: string;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PieceType;
  isCheck?: boolean;
}
