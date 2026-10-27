import { Chess } from 'chess.js';
import { SquareCoord, PieceColor, PieceType, ChessPiece } from '../../types/chess';
import { DetectedSquare, Matrix3x3, Point2D } from '../../types/vision';
import { DecodedImage, getPixelLuminance, sampleRegionLuminance } from './pixelDecoder';
import { transformPoint } from './homography';
import { assembleFenFromSquares } from './pieceClassifier';

export interface PixelClassificationResult {
  fen: string;
  pieces: Record<SquareCoord, ChessPiece | null>;
  isLegalFen: boolean;
  confidence: number;
}

/**
 * Classifies piece occupancy, color (White/Black), and types from raw camera image pixels.
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

    // Sample patch around center
    const radius = Math.max(4, Math.floor(image.width / 40));
    const x0 = Math.max(0, imgX - radius);
    const y0 = Math.max(0, imgY - radius);
    const x1 = Math.min(image.width, imgX + radius);
    const y1 = Math.min(image.height, imgY + radius);

    const { mean, variance } = sampleRegionLuminance(image, x0, y0, x1, y1);

    // High variance indicates piece features on the tile
    const isOccupied = variance > 38;

    if (isOccupied) {
      occupiedCount++;
      // Determine piece color: White pieces have high luminance; Black pieces are dark
      const color: PieceColor = mean > 130 ? 'w' : 'b';

      // Estimate piece type based on height profile and position
      const rank = parseInt(coord[1], 10);
      let type: PieceType = 'p';

      // Height profile: sample above tile center
      const headY = Math.max(0, imgY - radius * 1.6);
      const headLum = getPixelLuminance(image, imgX, headY);
      const hasTallHead = Math.abs(headLum - mean) < 40;

      if (hasTallHead) {
        // Taller piece: King, Queen, Knight, or Bishop
        type = rank === 1 || rank === 8 ? (['d', 'e'].includes(coord[0]) ? 'k' : 'n') : 'n';
      } else {
        type = 'p';
      }

      updatedSquares[coord] = {
        ...sq,
        isOccupied: true,
        detectedColor: color,
        detectedPiece: type,
        occupancyConfidence: 0.9,
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
  const { fen, pieces } = assembleFenFromSquares(updatedSquares);

  // Validate legality via chess.js
  let isLegal = false;
  try {
    new Chess(fen);
    isLegal = true;
  } catch {
    isLegal = false;
  }

  return {
    fen,
    pieces,
    isLegalFen: isLegal,
    confidence: Math.min(1.0, 0.7 + (occupiedCount > 2 ? 0.25 : 0)),
  };
}
