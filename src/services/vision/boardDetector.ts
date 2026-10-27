import { Point2D, QuadPoints, Matrix3x3, DetectedSquare, BoardDetectionResult } from '../../types/vision';
import { SquareCoord, FileLetter, RankNumber } from '../../types/chess';
import {
  computeHomography,
  invert3x3,
  transformPoint,
  getCanonicalBoardCorners,
  CANONICAL_SQUARE_SIZE,
} from './homography';

export const FILES: FileLetter[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS: RankNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Converts file index (0..7) and rank index (0..7) to SquareCoord (e.g. 'e4').
 * If isWhiteBottom is true, rank 0 is rank 8 (top of board), rank 7 is rank 1 (bottom).
 */
export function getSquareCoord(fileIdx: number, rankIdx: number, isWhiteBottom: boolean = true): SquareCoord {
  const file = FILES[fileIdx];
  const rankNumber = (isWhiteBottom ? 8 - rankIdx : rankIdx + 1) as RankNumber;
  return `${file}${rankNumber}`;
}

/**
 * Computes canonical polygon for a given 0..7 grid square.
 */
export function getCanonicalSquarePolygon(fileIdx: number, rankIdx: number): [Point2D, Point2D, Point2D, Point2D] {
  const x0 = fileIdx * CANONICAL_SQUARE_SIZE;
  const y0 = rankIdx * CANONICAL_SQUARE_SIZE;
  const x1 = x0 + CANONICAL_SQUARE_SIZE;
  const y1 = y0 + CANONICAL_SQUARE_SIZE;

  return [
    { x: x0, y: y0 }, // top-left
    { x: x1, y: y0 }, // top-right
    { x: x1, y: y1 }, // bottom-right
    { x: x0, y: y1 }, // bottom-left
  ];
}

/**
 * Computes canonical center for a given 0..7 grid square.
 */
export function getCanonicalSquareCenter(fileIdx: number, rankIdx: number): Point2D {
  return {
    x: (fileIdx + 0.5) * CANONICAL_SQUARE_SIZE,
    y: (rankIdx + 0.5) * CANONICAL_SQUARE_SIZE,
  };
}

/**
 * Maps all 64 squares from physical camera corners into canonical chess coordinates.
 */
export function registerBoardFromCorners(
  corners: QuadPoints,
  isWhiteBottom: boolean = true
): {
  homography: Matrix3x3;
  invHomography: Matrix3x3;
  squares: Record<SquareCoord, DetectedSquare>;
} {
  const canonical = getCanonicalBoardCorners();
  const screenCornerArray: [Point2D, Point2D, Point2D, Point2D] = [
    corners.topLeft,
    corners.topRight,
    corners.bottomRight,
    corners.bottomLeft,
  ];

  const H = computeHomography(canonical, screenCornerArray);
  const H_inv = invert3x3(H);

  const squares: Partial<Record<SquareCoord, DetectedSquare>> = {};

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const coord = getSquareCoord(f, r, isWhiteBottom);
      const canonicalPoly = getCanonicalSquarePolygon(f, r);
      const canonicalCenter = getCanonicalSquareCenter(f, r);

      const screenPolygon: [Point2D, Point2D, Point2D, Point2D] = [
        transformPoint(H, canonicalPoly[0]),
        transformPoint(H, canonicalPoly[1]),
        transformPoint(H, canonicalPoly[2]),
        transformPoint(H, canonicalPoly[3]),
      ];

      const screenCenter = transformPoint(H, canonicalCenter);

      squares[coord] = {
        coord,
        fileIndex: f,
        rankIndex: r,
        screenPolygon,
        screenCenter,
        isOccupied: false,
        occupancyConfidence: 1.0,
        isUncertain: false,
      };
    }
  }

  return {
    homography: H,
    invHomography: H_inv,
    squares: squares as Record<SquareCoord, DetectedSquare>,
  };
}
