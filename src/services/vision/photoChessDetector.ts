import { Chess } from 'chess.js';
import { DecodedImage } from './pixelDecoder';
import { detectBoardCornersFromPixels } from './autoBoardDetector';
import { registerBoardFromCorners } from './boardDetector';
import { classifyPiecesFromPixels, PixelClassificationResult } from './pixelPieceClassifier';
import { StockfishEngine } from '../stockfish/stockfishEngine';
import { EngineEvaluation } from '../../types/stockfish';
import { QuadPoints } from '../../types/vision';

export interface PhotoDetectionResult {
  fen: string;
  isLegalFen: boolean;
  corners: QuadPoints;
  confidence: number;
  evaluation?: EngineEvaluation;
  bestMoveSan?: string;
  bestMoveUci?: string;
}

/**
 * High-precision photo chessboard detector and Stockfish move analyzer.
 * Processes an input chess photo, detects corners, classifies piece pixels,
 * validates legality, and computes the optimal strategic response.
 */
export async function detectAndAnalyzeChessPhoto(
  image: DecodedImage,
  options?: {
    knownCorners?: QuadPoints;
    engine?: StockfishEngine;
    depth?: number;
  }
): Promise<PhotoDetectionResult> {
  const screenWidth = image.width;
  const screenHeight = image.height;

  // 1. Detect Outer Board Corners
  const corners =
    options?.knownCorners ||
    detectBoardCornersFromPixels(image, {
      screenWidth,
      screenHeight,
    });

  // 2. Compute 3x3 Projective Homography and 64 Tiles
  const registered = registerBoardFromCorners(corners, true);

  // 3. Classify Pieces from Raw Pixel Luminance
  const classification: PixelClassificationResult = classifyPiecesFromPixels(
    image,
    registered.squares,
    registered.homography,
    screenWidth,
    screenHeight
  );

  let finalFen = classification.fen;
  let isLegal = classification.isLegalFen;

  // Verify legality with chess.js
  try {
    new Chess(finalFen);
    isLegal = true;
  } catch {
    isLegal = false;
  }

  // 4. Run Stockfish UCI Engine Analysis if legal
  let evaluation: EngineEvaluation | undefined;
  let bestMoveSan: string | undefined;
  let bestMoveUci: string | undefined;

  if (isLegal) {
    try {
      const engine =
        options?.engine ||
        new StockfishEngine({ depth: options?.depth || 14, multiPv: 3 });
      evaluation = await engine.analyzePosition(finalFen);
      bestMoveSan = evaluation.bestMoveSan;
      bestMoveUci = evaluation.bestMove;
    } catch {
      // Safe fallback if engine is busy
    }
  }

  return {
    fen: finalFen,
    isLegalFen: isLegal,
    corners,
    confidence: classification.confidence,
    evaluation,
    bestMoveSan,
    bestMoveUci,
  };
}
