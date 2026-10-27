import { getPixelLuminance, sampleRegionLuminance, DecodedImage } from '../../src/services/vision/pixelDecoder';
import { detectBoardCornersFromPixels } from '../../src/services/vision/autoBoardDetector';
import { classifyPiecesFromPixels } from '../../src/services/vision/pixelPieceClassifier';
import { registerBoardFromCorners } from '../../src/services/vision/boardDetector';
import { QuadPoints } from '../../src/types/vision';

describe('Pixel Vision Engine & Real-Time Classifier', () => {
  // Create a synthetic 160x160 checkerboard image
  const width = 160;
  const height = 160;
  const data = new Uint8Array(width * height * 4);

  // Fill synthetic 8x8 checkerboard
  const tileSize = 20;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tx = Math.floor(x / tileSize);
      const ty = Math.floor(y / tileSize);
      const isLight = (tx + ty) % 2 === 0;
      const lum = isLight ? 220 : 40;

      const idx = (y * width + x) * 4;
      data[idx] = lum;     // R
      data[idx + 1] = lum; // G
      data[idx + 2] = lum; // B
      data[idx + 3] = 255; // A
    }
  }

  const syntheticImage: DecodedImage = { width, height, data };

  it('correctly calculates luminance and variance across checkerboard tiles', () => {
    const lightLum = getPixelLuminance(syntheticImage, 10, 10);
    const darkLum = getPixelLuminance(syntheticImage, 30, 10);

    expect(lightLum).toBeGreaterThan(200);
    expect(darkLum).toBeLessThan(60);

    // Region spanning a boundary has high variance
    const { variance } = sampleRegionLuminance(syntheticImage, 0, 0, 40, 40);
    expect(variance).toBeGreaterThan(50);
  });

  it('automatically detects outer corners from checkerboard contrast transitions', () => {
    const corners = detectBoardCornersFromPixels(syntheticImage, {
      screenWidth: 400,
      screenHeight: 800,
    });

    expect(corners.topLeft.x).toBeLessThan(corners.topRight.x);
    expect(corners.topLeft.y).toBeLessThan(corners.bottomLeft.y);
    expect(corners.topRight.x).toBeGreaterThan(200);
    expect(corners.bottomRight.y).toBeGreaterThan(200);
  });

  it('classifies pieces and generates FEN from decoded pixels', () => {
    const corners: QuadPoints = {
      topLeft: { x: 20, y: 150 },
      topRight: { x: 380, y: 150 },
      bottomRight: { x: 380, y: 550 },
      bottomLeft: { x: 20, y: 550 },
    };

    const { homography, squares } = registerBoardFromCorners(corners, true);
    const result = classifyPiecesFromPixels(syntheticImage, squares, homography, 400, 800);

    expect(result.fen).toBeDefined();
    expect(typeof result.confidence).toBe('number');
  });
});
