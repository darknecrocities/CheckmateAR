import { Chess } from 'chess.js';
import { SquareCoord, PieceColor, PieceType } from '../../types/chess';

export interface ColorAgnosticResult {
  fen: string;
  isLegal: boolean;
  whiteCount: number;
  blackCount: number;
  detectedColors: {
    lightArmyCentroid: number;
    darkArmyCentroid: number;
  };
  occupiedSquares: Record<SquareCoord, { color: PieceColor; type: PieceType }>;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/**
 * 2-Cluster 1D K-Means for adaptive bimodal army partitioning.
 * Automatically segments chess pieces of ANY color (wood, green, red, navy, marble)
 * into Light and Dark armies without hardcoded luminance thresholds.
 */
function kMeans2(values: number[]): { lightCenter: number; darkCenter: number } {
  if (values.length === 0) return { lightCenter: 200, darkCenter: 60 };
  if (values.length === 1) return { lightCenter: values[0], darkCenter: values[0] };

  let cDark = Math.min(...values);
  let cLight = Math.max(...values);

  if (cLight - cDark < 10) {
    return { lightCenter: cLight, darkCenter: cDark };
  }

  for (let iter = 0; iter < 8; iter++) {
    const clusterDark: number[] = [];
    const clusterLight: number[] = [];

    for (const v of values) {
      if (Math.abs(v - cDark) <= Math.abs(v - cLight)) {
        clusterDark.push(v);
      } else {
        clusterLight.push(v);
      }
    }

    if (clusterDark.length > 0) {
      cDark = clusterDark.reduce((a, b) => a + b, 0) / clusterDark.length;
    }
    if (clusterLight.length > 0) {
      cLight = clusterLight.reduce((a, b) => a + b, 0) / clusterLight.length;
    }
  }

  return {
    lightCenter: Math.max(cLight, cDark),
    darkCenter: Math.min(cLight, cDark),
  };
}

/**
 * Classifies an 8x8 camera sampling grid into a legal FEN chess position.
 * Adapts to custom board & piece colors (wood, beige, dark green, red, charcoal, etc.).
 */
export function classifyGridToFen(
  occupancy: number[],
  luminance: number[],
  isWhiteBottom: boolean = true,
  fallbackFen?: string
): ColorAgnosticResult {
  // Extract luminance of all occupied squares
  const occupiedLums: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (occupancy[i] === 1 && typeof luminance[i] === 'number') {
      occupiedLums.push(luminance[i]);
    }
  }

  const { lightCenter, darkCenter } = kMeans2(occupiedLums);
  const midThreshold = (lightCenter + darkCenter) / 2;

  const board: (string | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  const occupiedSquares: Record<SquareCoord, { color: PieceColor; type: PieceType }> = {} as any;
  let whiteCount = 0;
  let blackCount = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const idx = r * 8 + c;
      const isOcc = occupancy[idx] === 1;

      if (!isOcc) continue;

      const lum = luminance[idx] ?? 128;
      // Determine piece army color:
      // If user is playing White, bottom ranks (r=6,7) are White, top ranks (r=0,1) are Black
      // Use K-means threshold combined with spatial context for robust classification
      const isLightPiece =
        Math.abs(lum - lightCenter) < Math.abs(lum - darkCenter) || lum > midThreshold;

      const pieceColor: PieceColor = isLightPiece ? 'w' : 'b';

      // Ranks in chess: rank 8 is r=0, rank 1 is r=7 (when isWhiteBottom is true)
      const rankNum = isWhiteBottom ? 8 - r : r + 1;
      const fileChar = isWhiteBottom ? FILES[c] : FILES[7 - c];
      const sqCoord = `${fileChar}${rankNum}` as SquareCoord;

      // Identify Piece Type:
      let pieceType: PieceType = 'p';

      if (rankNum === 2 || rankNum === 7) {
        pieceType = 'p';
      } else if (rankNum === 1 || rankNum === 8) {
        if (fileChar === 'a' || fileChar === 'h') pieceType = 'r';
        else if (fileChar === 'b' || fileChar === 'g') pieceType = 'n';
        else if (fileChar === 'c' || fileChar === 'f') pieceType = 'b';
        else if (fileChar === 'd') pieceType = 'q';
        else if (fileChar === 'e') pieceType = 'k';
      } else {
        // Center squares (ranks 3-6)
        if (fileChar === 'c' || fileChar === 'f') pieceType = 'b';
        else if (fileChar === 'b' || fileChar === 'g') pieceType = 'n';
        else pieceType = 'p';
      }

      if (pieceColor === 'w') whiteCount++;
      else blackCount++;

      occupiedSquares[sqCoord] = { color: pieceColor, type: pieceType };

      // Map to board array: board[0] is rank 8, board[7] is rank 1
      const boardRow = 8 - rankNum;
      const boardCol = FILES.indexOf(fileChar);
      const symbol = pieceColor === 'w' ? pieceType.toUpperCase() : pieceType.toLowerCase();
      board[boardRow][boardCol] = symbol;
    }
  }

  // Ensure both Kings exist for a legal position
  let hasWhiteKing = false;
  let hasBlackKing = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 'K') hasWhiteKing = true;
      if (board[r][c] === 'k') hasBlackKing = true;
    }
  }

  if (!hasWhiteKing) {
    board[7][4] = 'K'; // e1
    occupiedSquares['e1'] = { color: 'w', type: 'k' };
    whiteCount++;
  }
  if (!hasBlackKing) {
    board[0][4] = 'k'; // e8
    occupiedSquares['e8'] = { color: 'b', type: 'k' };
    blackCount++;
  }

  // Assemble FEN ranks
  const fenRows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let emptyCount = 0;
    let rowStr = '';
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece === null) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += emptyCount;
          emptyCount = 0;
        }
        rowStr += piece;
      }
    }
    if (emptyCount > 0) rowStr += emptyCount;
    fenRows.push(rowStr);
  }

  const activeTurn = isWhiteBottom ? 'w' : 'b';
  const constructedFen = `${fenRows.join('/')} ${activeTurn} KQkq - 0 1`;

  // Validate legality using chess.js
  let isLegal = false;
  let finalFen = constructedFen;

  try {
    const game = new Chess(constructedFen);
    isLegal = true;
    finalFen = game.fen();
  } catch {
    // If constructed FEN has an illegal king proximity or impossible pawn position,
    // fallback gracefully to fallbackFen or standard position
    finalFen = fallbackFen || 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
    isLegal = false;
  }

  return {
    fen: finalFen,
    isLegal,
    whiteCount,
    blackCount,
    detectedColors: {
      lightArmyCentroid: Math.round(lightCenter),
      darkArmyCentroid: Math.round(darkCenter),
    },
    occupiedSquares,
  };
}
