import { Point2D, QuadPoints } from '../../types/vision';
import { DecodedImage, getPixelLuminance } from './pixelDecoder';

export interface BoardDetectionOptions {
  screenWidth: number;
  screenHeight: number;
  prevCorners?: QuadPoints;
  smoothingAlpha?: number;
}

/**
 * Robust multi-modal chessboard detector.
 * Detects 8x8 alternating grid periodicity on 2D screens (SparkChess, web puzzles),
 * 3D rendered boards, and real physical chessboards.
 */
export function detectBoardCornersFromPixels(
  image: DecodedImage,
  options: BoardDetectionOptions
): QuadPoints {
  const { screenWidth, screenHeight, prevCorners, smoothingAlpha = 0.35 } = options;

  const w = image.width;
  const h = image.height;

  // Scan grid resolution (48x48 offers high spatial fidelity at < 2ms execution time)
  const gridW = 48;
  const gridH = 48;
  const stepX = w / gridW;
  const stepY = h / gridH;

  // 1. Build luminance map
  const lumMap: number[][] = [];
  for (let gy = 0; gy < gridH; gy++) {
    const row: number[] = [];
    const py = (gy + 0.5) * stepY;
    for (let gx = 0; gx < gridW; gx++) {
      const px = (gx + 0.5) * stepX;
      row.push(getPixelLuminance(image, px, py));
    }
    lumMap.push(row);
  }

  // 2. Measure alternating transition frequency across rows and columns
  // An 8x8 chessboard row alternates ~7-8 times between dark and light
  const rowTransitions: number[] = new Array(gridH).fill(0);
  const colTransitions: number[] = new Array(gridW).fill(0);

  for (let gy = 0; gy < gridH; gy++) {
    let trans = 0;
    for (let gx = 1; gx < gridW; gx++) {
      const diff = Math.abs(lumMap[gy][gx] - lumMap[gy][gx - 1]);
      if (diff > 22) {
        trans++;
      }
    }
    rowTransitions[gy] = trans;
  }

  for (let gx = 0; gx < gridW; gx++) {
    let trans = 0;
    for (let gy = 1; gy < gridH; gy++) {
      const diff = Math.abs(lumMap[gy][gx] - lumMap[gy - 1][gx]);
      if (diff > 22) {
        trans++;
      }
    }
    colTransitions[gx] = trans;
  }

  // 3. Find vertical span where row transitions indicate an 8-column checkerboard (typically 6-16 transitions)
  let bestMinY = -1;
  let bestMaxY = -1;
  let maxConsecutiveRows = 0;
  let curMinY = -1;

  for (let gy = 2; gy < gridH - 2; gy++) {
    if (rowTransitions[gy] >= 5 && rowTransitions[gy] <= 24) {
      if (curMinY === -1) curMinY = gy;
    } else {
      if (curMinY !== -1) {
        const count = gy - curMinY;
        if (count > maxConsecutiveRows) {
          maxConsecutiveRows = count;
          bestMinY = curMinY;
          bestMaxY = gy;
        }
        curMinY = -1;
      }
    }
  }
  if (curMinY !== -1 && gridH - 2 - curMinY > maxConsecutiveRows) {
    bestMinY = curMinY;
    bestMaxY = gridH - 2;
  }

  // 4. Find horizontal span where column transitions indicate an 8-rank checkerboard
  let bestMinX = -1;
  let bestMaxX = -1;
  let maxConsecutiveCols = 0;
  let curMinX = -1;

  for (let gx = 2; gx < gridW - 2; gx++) {
    if (colTransitions[gx] >= 5 && colTransitions[gx] <= 24) {
      if (curMinX === -1) curMinX = gx;
    } else {
      if (curMinX !== -1) {
        const count = gx - curMinX;
        if (count > maxConsecutiveCols) {
          maxConsecutiveCols = count;
          bestMinX = curMinX;
          bestMaxX = gx;
        }
        curMinX = -1;
      }
    }
  }
  if (curMinX !== -1 && gridW - 2 - curMinX > maxConsecutiveCols) {
    bestMinX = curMinX;
    bestMaxX = gridW - 2;
  }

  // 5. Validate detected board dimensions and aspect ratio
  const detectedWidth = (bestMaxX - bestMinX) * stepX;
  const detectedHeight = (bestMaxY - bestMinY) * stepY;
  const aspectRatio = detectedWidth / (detectedHeight || 1);

  const isValidDetection =
    bestMinX >= 0 &&
    bestMaxX > bestMinX &&
    bestMinY >= 0 &&
    bestMaxY > bestMinY &&
    bestMaxX - bestMinX >= 10 && // At least ~20% of image width
    bestMaxY - bestMinY >= 10 && // At least ~20% of image height
    aspectRatio >= 0.72 &&
    aspectRatio <= 1.38;

  const scaleX = screenWidth / w;
  const scaleY = screenHeight / h;

  let rawCorners: QuadPoints;

  if (isValidDetection) {
    // Map grid bounding box to screen viewport
    const leftPx = bestMinX * stepX * scaleX;
    const rightPx = (bestMaxX + 1) * stepX * scaleX;
    const topPx = bestMinY * stepY * scaleY;
    const bottomPx = (bestMaxY + 1) * stepY * scaleY;

    // Slight trapezoidal perspective tolerance for physical board angle
    const insetTop = (rightPx - leftPx) * 0.04;

    rawCorners = {
      topLeft: { x: Math.max(8, leftPx + insetTop), y: topPx },
      topRight: { x: Math.min(screenWidth - 8, rightPx - insetTop), y: topPx },
      bottomRight: { x: Math.min(screenWidth - 4, rightPx), y: bottomPx },
      bottomLeft: { x: Math.max(4, leftPx), y: bottomPx },
    };
  } else {
    // Fallback: Centered viewfinder quad with natural perspective angle
    const boardSize = Math.min(screenWidth * 0.84, screenHeight * 0.42);
    const centerX = screenWidth / 2;
    const centerY = screenHeight * 0.51;

    const halfW = boardSize / 2;
    const halfH = boardSize / 2;

    rawCorners = {
      topLeft: { x: centerX - halfW * 0.95, y: centerY - halfH },
      topRight: { x: centerX + halfW * 0.95, y: centerY - halfH },
      bottomRight: { x: centerX + halfW, y: centerY + halfH },
      bottomLeft: { x: centerX - halfW, y: centerY + halfH },
    };
  }

  // Smooth corners using Exponential Moving Average if previous corners exist
  if (!prevCorners) return rawCorners;

  return {
    topLeft: smoothPoint(prevCorners.topLeft, rawCorners.topLeft, smoothingAlpha),
    topRight: smoothPoint(prevCorners.topRight, rawCorners.topRight, smoothingAlpha),
    bottomRight: smoothPoint(prevCorners.bottomRight, rawCorners.bottomRight, smoothingAlpha),
    bottomLeft: smoothPoint(prevCorners.bottomLeft, rawCorners.bottomLeft, smoothingAlpha),
  };
}

function smoothPoint(prev: Point2D, target: Point2D, alpha: number): Point2D {
  return {
    x: prev.x * (1 - alpha) + target.x * alpha,
    y: prev.y * (1 - alpha) + target.y * alpha,
  };
}
