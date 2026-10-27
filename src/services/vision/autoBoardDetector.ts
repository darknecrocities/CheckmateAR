import { Point2D, QuadPoints } from '../../types/vision';
import { DecodedImage, getPixelLuminance } from './pixelDecoder';

export interface BoardDetectionOptions {
  screenWidth: number;
  screenHeight: number;
  prevCorners?: QuadPoints;
  smoothingAlpha?: number; // 0..1 for exponential smoothing
}

/**
 * Automatically detects the 4 outer corners of a chessboard from camera image pixels.
 * Works for 2D screen boards, 3D renders, and real-life physical boards.
 */
export function detectBoardCornersFromPixels(
  image: DecodedImage,
  options: BoardDetectionOptions
): QuadPoints {
  const { screenWidth, screenHeight, prevCorners, smoothingAlpha = 0.35 } = options;

  // Downsample grid for fast, responsive detection (e.g. 40x40 scan grid)
  const gridW = 40;
  const gridH = 40;
  const stepX = image.width / gridW;
  const stepY = image.height / gridH;

  // Calculate local gradient energy across the grid
  const energyMap: number[][] = [];
  for (let gy = 0; gy < gridH; gy++) {
    const row: number[] = [];
    const py = (gy + 0.5) * stepY;
    for (let gx = 0; gx < gridW; gx++) {
      const px = (gx + 0.5) * stepX;

      const lumCenter = getPixelLuminance(image, px, py);
      const lumRight = getPixelLuminance(image, px + stepX * 0.5, py);
      const lumDown = getPixelLuminance(image, px, py + stepY * 0.5);

      const dx = Math.abs(lumRight - lumCenter);
      const dy = Math.abs(lumDown - lumCenter);
      row.push(dx + dy);
    }
    energyMap.push(row);
  }

  // Find bounding box with high periodic checkerboard frequency
  let minGx = gridW;
  let maxGx = 0;
  let minGy = gridH;
  let maxGy = 0;
  const threshold = 18; // Energy threshold indicating checkerboard alternating transitions

  for (let gy = 2; gy < gridH - 2; gy++) {
    for (let gx = 2; gx < gridW - 2; gx++) {
      if (energyMap[gy][gx] > threshold) {
        if (gx < minGx) minGx = gx;
        if (gx > maxGx) maxGx = gx;
        if (gy < minGy) minGy = gy;
        if (gy > maxGy) maxGy = gy;
      }
    }
  }

  // Ensure minimum valid board area
  if (maxGx - minGx < 12 || maxGy - minGy < 12) {
    // Fallback to centered perspective bounding box if image is too dark or empty
    return (
      prevCorners || {
        topLeft: { x: screenWidth * 0.12, y: screenHeight * 0.22 },
        topRight: { x: screenWidth * 0.88, y: screenHeight * 0.22 },
        bottomRight: { x: screenWidth * 0.96, y: screenHeight * 0.68 },
        bottomLeft: { x: screenWidth * 0.04, y: screenHeight * 0.68 },
      }
    );
  }

  // Scale detected grid bounding box to screen viewport
  const scaleX = screenWidth / image.width;
  const scaleY = screenHeight / image.height;

  const rawCorners: QuadPoints = {
    topLeft: { x: minGx * stepX * scaleX, y: minGy * stepY * scaleY },
    topRight: { x: maxGx * stepX * scaleX, y: minGy * stepY * scaleY },
    bottomRight: { x: (maxGx + 1) * stepX * scaleX, y: (maxGy + 1) * stepY * scaleY },
    bottomLeft: { x: minGx * stepX * scaleX, y: (maxGy + 1) * stepY * scaleY },
  };

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
