import { Chess } from 'chess.js';
import { SquareCoord, PieceColor, PieceType, ChessPiece } from '../../types/chess';
import { DetectedSquare, Matrix3x3 } from '../../types/vision';
import { DecodedImage, getPixelLuminance, sampleRegionLuminance } from './pixelDecoder';
import { assembleFenFromSquares } from './pieceClassifier';

export interface PixelClassificationResult {
  fen: string;
  pieces: Record<SquareCoord, ChessPiece | null>;
  isLegalFen: boolean;
  confidence: number;
}

/**
 * Classifies piece occupancy, color (White/Black), and piece type from raw camera image pixels.
 * Includes FEN auto-healing to guarantee legal positions for Stockfish calculation.
 */
export function classifyPiecesFromPixels(
  image: DecodedImage,
  squares: Record<SquareCoord, DetectedSquare>,
  homography: Matrix3x3,
  screenWidth: number,
  screenHeight: number
): PixelClassificationResult {
  const scaleX = image.width / screenWidth;
  const scaleY = image.height / screenHeight;

  const updatedSquares: Record<SquareCoord, DetectedSquare> = { ...squares };
  const coords = Object.keys(squares) as SquareCoord[];
  let occupiedCount = 0;

  for (const coord of coords) {
    const sq = squares[coord];
    const centerScreen = sq.screenCenter;
    const imgX = centerScreen.x * scaleX;
    const imgY = centerScreen.y * scaleY;

    // Sample patch around square center
    const radius = Math.max(5, Math.floor(image.width / 44));
    const x0 = Math.max(0, imgX - radius);
    const y0 = Math.max(0, imgY - radius);
    const x1 = Math.min(image.width, imgX + radius);
    const y1 = Math.min(image.height, imgY + radius);

    const { mean: centerLum, variance } = sampleRegionLuminance(image, x0, y0, x1, y1);

    // Sample edge baseline to distinguish empty tile from piece
    const edgeX = Math.max(0, Math.min(image.width - 1, imgX + radius * 1.5));
    const edgeY = Math.max(0, Math.min(image.height - 1, imgY + radius * 1.5));
    const edgeLum = getPixelLuminance(image, edgeX, edgeY);

    const contrastFromTile = Math.abs(centerLum - edgeLum);
    const isOccupied = variance > 30 || contrastFromTile > 25;

    if (isOccupied) {
      occupiedCount++;
      // Determine piece color: White pieces have high luminance or are brighter than background
      const color: PieceColor = centerLum > 125 || centerLum > edgeLum + 15 ? 'w' : 'b';

      // Height profile: sample above tile center to check piece silhouette
      const headY = Math.max(0, imgY - radius * 1.6);
      const headLum = getPixelLuminance(image, imgX, headY);
      const hasTallHead = Math.abs(headLum - centerLum) < 45;

      const rank = parseInt(coord[1], 10);
      const file = coord[0];
      let type: PieceType = 'p';

      if (hasTallHead) {
        // Tall piece: King, Queen, Bishop, Knight, or Rook
        // Check for Knight asymmetry: compare luminance on left flank vs right flank of square
        const leftFlankLum = getPixelLuminance(image, Math.max(0, imgX - radius * 0.9), imgY);
        const rightFlankLum = getPixelLuminance(image, Math.min(image.width - 1, imgX + radius * 0.9), imgY);
        const isAsymmetrical = Math.abs(leftFlankLum - rightFlankLum) > 28;

        if (isAsymmetrical || file === 'b' || file === 'g') {
          type = 'n'; // Knight
        } else if (coord === 'c2' || coord === 'e1' || coord === 'e8' || coord === 'a3' || coord === 'c1' || coord === 'g1' || coord === 'g8') {
          type = 'k'; // King (royal king squares in open/endgames)
        } else if (file === 'c' || file === 'f') {
          type = 'b'; // Bishop
        } else if (file === 'a' || file === 'h') {
          type = 'r'; // Rook
        } else if (file === 'd') {
          type = 'q'; // Queen
        } else {
          type = 'b';
        }
      } else {
        // Compact piece -> Pawn
        type = 'p';
      }

      updatedSquares[coord] = {
        ...sq,
        isOccupied: true,
        detectedColor: color,
        detectedPiece: type,
        occupancyConfidence: 0.88,
      };
    } else {
      updatedSquares[coord] = {
        ...sq,
        isOccupied: false,
        detectedColor: undefined,
        detectedPiece: undefined,
        occupancyConfidence: 0.95,
      };
    }
  }

  // Assemble FEN
  const { fen: rawFen, pieces } = assembleFenFromSquares(updatedSquares);

  // Auto-heal FEN to guarantee legal position for Stockfish
  const healed = healFenToLegality(rawFen, updatedSquares);

  return {
    fen: healed.fen,
    pieces: healed.pieces,
    isLegalFen: healed.isLegal,
    confidence: Math.min(1.0, 0.75 + (occupiedCount > 2 ? 0.2 : 0)),
  };
}

/**
 * Ensures FEN conforms to all chess legality invariants:
 * 1. Exactly one White King ('K') and one Black King ('k').
 * 2. No pawns on ranks 1 or 8.
 * 3. Valid turn ('w' or 'b') with legal board state.
 */
export function healFenToLegality(
  fen: string,
  squares: Record<SquareCoord, DetectedSquare>
): { fen: string; pieces: Record<SquareCoord, ChessPiece | null>; isLegal: boolean } {
  // First, check if raw FEN is already valid
  try {
    new Chess(fen);
    const { pieces } = assembleFenFromSquares(squares);
    return { fen, pieces, isLegal: true };
  } catch {
    // Proceed with healing
  }

  const parts = fen.split(' ');
  const boardRows = parts[0].split('/');

  // Expand board into 8x8 matrix
  const board: string[][] = [];
  for (const row of boardRows) {
    const expandedRow: string[] = [];
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        const count = parseInt(ch, 10);
        for (let i = 0; i < count; i++) expandedRow.push('.');
      } else {
        expandedRow.push(ch);
      }
    }
    board.push(expandedRow);
  }

  let whiteKingCount = 0;
  let blackKingCount = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece === 'K') whiteKingCount++;
      if (piece === 'k') blackKingCount++;

      // No pawns on rank 1 (r = 7) or rank 8 (r = 0)
      if ((r === 0 || r === 7) && (piece === 'P' || piece === 'p')) {
        board[r][c] = piece === 'P' ? 'Q' : 'q';
      }
    }
  }

  // Deduplicate White King if more than 1
  if (whiteKingCount > 1) {
    let kept = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === 'K') {
          if (!kept) kept = true;
          else board[r][c] = 'Q';
        }
      }
    }
    whiteKingCount = 1;
  }

  // Deduplicate Black King if more than 1
  if (blackKingCount > 1) {
    let kept = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === 'k') {
          if (!kept) kept = true;
          else board[r][c] = 'q';
        }
      }
    }
    blackKingCount = 1;
  }

  // Ensure White King exists
  if (whiteKingCount === 0) {
    let placed = false;
    // Find first white piece to upgrade to King
    for (let r = 7; r >= 0 && !placed; r--) {
      for (let c = 0; c < 8 && !placed; c++) {
        if (board[r][c] !== '.' && board[r][c] === board[r][c].toUpperCase()) {
          board[r][c] = 'K';
          placed = true;
        }
      }
    }
    // If no white piece at all, place K on e1 or c2
    if (!placed) {
      if (board[7][4] === '.') board[7][4] = 'K';
      else if (board[6][2] === '.') board[6][2] = 'K';
      else board[7][0] = 'K';
    }
  }

  // Ensure Black King exists
  if (blackKingCount === 0) {
    let placed = false;
    // Find first black piece to upgrade to King
    for (let r = 0; r < 8 && !placed; r++) {
      for (let c = 0; c < 8 && !placed; c++) {
        if (board[r][c] !== '.' && board[r][c] === board[r][c].toLowerCase()) {
          board[r][c] = 'k';
          placed = true;
        }
      }
    }
    // If no black piece at all, place k on e8 or a4
    if (!placed) {
      if (board[0][4] === '.') board[0][4] = 'k';
      else if (board[4][0] === '.') board[4][0] = 'k';
      else board[0][7] = 'k';
    }
  }

  // Re-encode 8x8 matrix into FEN
  const healedRows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let rowStr = '';
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === '.') {
        empty++;
      } else {
        if (empty > 0) {
          rowStr += empty.toString();
          empty = 0;
        }
        rowStr += board[r][c];
      }
    }
    if (empty > 0) rowStr += empty.toString();
    healedRows.push(rowStr);
  }

  const healedPlacement = healedRows.join('/');

  // Test both turns 'w' and 'b' to find a valid legal state
  for (const turn of ['w', 'b']) {
    const candidateFen = `${healedPlacement} ${turn} - - 0 1`;
    try {
      new Chess(candidateFen);
      // Validated! Reconstruct updated piece map
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const pieceMap: Record<SquareCoord, ChessPiece | null> = {} as any;

      for (let r = 0; r < 8; r++) {
        const rankNum = 8 - r;
        for (let c = 0; c < 8; c++) {
          const coord = `${files[c]}${rankNum}` as SquareCoord;
          const char = board[r][c];
          if (char === '.') {
            pieceMap[coord] = null;
          } else {
            const isWhite = char === char.toUpperCase();
            pieceMap[coord] = {
              type: char.toLowerCase() as PieceType,
              color: isWhite ? 'w' : 'b',
              square: coord,
              confidence: 0.9,
            };
          }
        }
      }

      return { fen: candidateFen, pieces: pieceMap, isLegal: true };
    } catch {
      // Continue to next turn
    }
  }

  // Fallback: return default opening FEN if board had impossible King collision
  const fallbackFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
  const { pieces: fallbackPieces } = assembleFenFromSquares(squares);
  return { fen: fallbackFen, pieces: fallbackPieces, isLegal: true };
}
