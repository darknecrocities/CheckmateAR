import {
  computeHomography,
  invert3x3,
  transformPoint,
  getCanonicalBoardCorners,
  CANONICAL_BOARD_SIZE,
} from '../../src/services/vision/homography';
import { Point2D } from '../../src/types/vision';

describe('Homography & Perspective Transformation', () => {
  it('computes exact identity homography when source and target match', () => {
    const canonical = getCanonicalBoardCorners();
    const H = computeHomography(canonical, canonical);

    const testPoint: Point2D = { x: 400, y: 400 };
    const projected = transformPoint(H, testPoint);

    expect(projected.x).toBeCloseTo(400, 2);
    expect(projected.y).toBeCloseTo(400, 2);
  });

  it('correctly maps canonical board corners to an angled perspective trapezoid', () => {
    const canonical = getCanonicalBoardCorners();
    // Simulate camera viewing board from bottom at an angle (trapezoid in screen space)
    const screenCorners: [Point2D, Point2D, Point2D, Point2D] = [
      { x: 100, y: 150 }, // Top-left
      { x: 300, y: 150 }, // Top-right
      { x: 380, y: 500 }, // Bottom-right (wider base)
      { x: 20, y: 500 },  // Bottom-left (wider base)
    ];

    const H = computeHomography(canonical, screenCorners);
    const H_inv = invert3x3(H);

    // Verify all 4 corners map precisely
    screenCorners.forEach((expected, i) => {
      const projected = transformPoint(H, canonical[i]);
      expect(projected.x).toBeCloseTo(expected.x, 1);
      expect(projected.y).toBeCloseTo(expected.y, 1);
    });

    // Test round-trip: screen point transformed back to canonical
    const centerScreen = { x: 200, y: 325 };
    const canonicalCenter = transformPoint(H_inv, centerScreen);
    const roundTripScreen = transformPoint(H, canonicalCenter);

    expect(roundTripScreen.x).toBeCloseTo(centerScreen.x, 1);
    expect(roundTripScreen.y).toBeCloseTo(centerScreen.y, 1);
  });
});
