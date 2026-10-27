import { SquareCoord, PieceColor, PieceType, ChessPiece } from '../../types/chess';
import { DetectedSquare } from '../../types/vision';

export interface VisualTileFeatures {
  meanLuminance: number; // 0..255
  variance: number; // gradient texture variance
  heightRatio: number; // estimated piece height relative to square width
  contourAsymmetry: number; // 0..1 (high for knights)
  hasCrownFinial: boolean; // true for king/queen
  topWidthRatio: number; // ratio of piece top width to base width
}

/**
 * Classifies square occupancy based on tile visual features.
 */
export function classifyOccupancy(features: VisualTileFeatures, tileIsDark: boolean): { isOccupied: boolean; confidence: number } {
  // Empty squares have low texture variance and luminance close to baseline
  const isOccupied = features.variance > 32 || features.heightRatio > 0.25;
  const confidence = isOccupied
    ? Math.min(1.0, 0.7 + (features.variance / 100) * 0.3)
    : Math.min(1.0, 0.7 + (1 - features.variance / 32) * 0.3);

  return { isOccupied, confidence: Number(confidence.toFixed(2)) };
}

/**
 * Classifies piece color (White vs Black).
 */
export function classifyPieceColor(features: VisualTileFeatures): { color: PieceColor; confidence: number } {
  // White pieces reflect high luminance, Black pieces have low luminance
  if (features.meanLuminance > 140) {
    const conf = Math.min(1.0, 0.8 + ((features.meanLuminance - 140) / 115) * 0.2);
    return { color: 'w', confidence: Number(conf.toFixed(2)) };
  } else {
    const conf = Math.min(1.0, 0.8 + ((140 - features.meanLuminance) / 140) * 0.2);
    return { color: 'b', confidence: Number(conf.toFixed(2)) };
  }
}

/**
 * Classifies piece type based on contour, height, and geometric features.
 */
export function classifyPieceType(
  features: VisualTileFeatures,
  square: SquareCoord,
  color: PieceColor
): { type: PieceType; confidence: number } {
  const rank = parseInt(square[1], 10);

  // High asymmetry is the distinctive hallmark of a Knight
  if (features.contourAsymmetry > 0.32) {
    return { type: 'n', confidence: 0.92 };
  }

  // Tallest pieces with crown/cross
  if (features.heightRatio > 0.75) {
    if (features.hasCrownFinial) {
      // King vs Queen distinction: King has cross/finial, Queen has coronet
      return { type: features.topWidthRatio > 0.4 ? 'q' : 'k', confidence: 0.88 };
    }
    return { type: 'q', confidence: 0.82 };
  }

  // Medium pieces: Rook vs Bishop
  if (features.heightRatio > 0.5) {
    if (features.topWidthRatio > 0.55) {
      // Flat top / crenellations -> Rook
      return { type: 'r', confidence: 0.86 };
    }
    // Pointed mitre -> Bishop
    return { type: 'b', confidence: 0.85 };
  }

  // Short piece or on pawn rank -> Pawn
  const isPawnRank = (color === 'w' && rank === 2) || (color === 'b' && rank === 7);
  return { type: 'p', confidence: isPawnRank ? 0.95 : 0.84 };
}

/**
 * Reconstructs a full FEN string from 64 detected squares.
 */
export function assembleFenFromSquares(
  squares: Record<SquareCoord, DetectedSquare>,
  turn: PieceColor = 'w',
  castling: string = 'KQkq',
  enPassant: string = '-'
): { fen: string; pieces: Record<SquareCoord, ChessPiece | null> } {
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const fenRows: string[] = [];
  const pieceMap: Partial<Record<SquareCoord, ChessPiece | null>> = {};

  for (const r of ranks) {
    let emptyCount = 0;
    let rowStr = '';

    for (const f of files) {
      const coord = `${f}${r}` as SquareCoord;
      const sq = squares[coord];

      if (sq && sq.isOccupied && sq.detectedPiece && sq.detectedColor) {
        if (emptyCount > 0) {
          rowStr += emptyCount.toString();
          emptyCount = 0;
        }
        const char = sq.detectedColor === 'w' ? sq.detectedPiece.toUpperCase() : sq.detectedPiece.toLowerCase();
        rowStr += char;

        pieceMap[coord] = {
          type: sq.detectedPiece,
          color: sq.detectedColor,
          square: coord,
          confidence: Math.min(sq.occupancyConfidence, sq.colorConfidence ?? 1.0, sq.pieceConfidence ?? 1.0),
        };
      } else {
        emptyCount++;
        pieceMap[coord] = null;
      }
    }

    if (emptyCount > 0) {
      rowStr += emptyCount.toString();
    }
    fenRows.push(rowStr);
  }

  const piecePlacement = fenRows.join('/');
  const fullFen = `${piecePlacement} ${turn} ${castling} ${enPassant} 0 1`;

  return {
    fen: fullFen,
    pieces: pieceMap as Record<SquareCoord, ChessPiece | null>,
  };
}
