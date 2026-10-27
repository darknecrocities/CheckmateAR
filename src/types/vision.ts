import { SquareCoord, PieceColor, PieceType } from './chess';

export interface Point2D {
  x: number;
  y: number;
}

export interface QuadPoints {
  topLeft: Point2D;
  topRight: Point2D;
  bottomRight: Point2D;
  bottomLeft: Point2D;
}

export type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export interface DetectedSquare {
  coord: SquareCoord;
  fileIndex: number; // 0 to 7 (a to h)
  rankIndex: number; // 0 to 7 (8 down to 1 or 1 up to 8)
  screenPolygon: [Point2D, Point2D, Point2D, Point2D];
  screenCenter: Point2D;
  isOccupied: boolean;
  occupancyConfidence: number;
  detectedColor?: PieceColor;
  colorConfidence?: number;
  detectedPiece?: PieceType;
  pieceConfidence?: number;
  isUncertain: boolean;
}

export interface BoardDetectionResult {
  corners: QuadPoints;
  homography: Matrix3x3;
  invHomography: Matrix3x3;
  squares: Record<SquareCoord, DetectedSquare>;
  detectedFen: string;
  isLegalFen: boolean;
  overallConfidence: number;
  isWhiteBottom: boolean;
  timestamp: number;
}
