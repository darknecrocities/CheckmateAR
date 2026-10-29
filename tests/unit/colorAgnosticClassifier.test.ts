import { classifyGridToFen } from '../../src/services/vision/colorAgnosticClassifier';

describe('colorAgnosticClassifier', () => {
  it('correctly partitions standard black and white piece luminance', () => {
    // 64 squares: standard opening layout
    const occupancy = new Array(64).fill(0);
    const luminance = new Array(64).fill(128);

    // Rank 0 (black officers) & Rank 1 (black pawns)
    for (let i = 0; i < 16; i++) {
      occupancy[i] = 1;
      luminance[i] = 45; // Dark / Black pieces
    }

    // Rank 6 (white pawns) & Rank 7 (white officers)
    for (let i = 48; i < 64; i++) {
      occupancy[i] = 1;
      luminance[i] = 220; // Light / White pieces
    }

    const result = classifyGridToFen(occupancy, luminance, true);

    expect(result.whiteCount).toBeGreaterThan(0);
    expect(result.blackCount).toBeGreaterThan(0);
    expect(result.isLegal).toBe(true);
    expect(result.fen).toContain('r');
    expect(result.fen).toContain('R');
  });

  it('correctly classifies wooden chess sets with beige and walnut pieces', () => {
    const occupancy = new Array(64).fill(0);
    const luminance = new Array(64).fill(120); // Wood board background

    // Walnut pieces (dark brown, lum ~70)
    for (let i = 0; i < 16; i++) {
      occupancy[i] = 1;
      luminance[i] = 70;
    }

    // Birch / maple pieces (cream/beige, lum ~175)
    for (let i = 48; i < 64; i++) {
      occupancy[i] = 1;
      luminance[i] = 175;
    }

    const result = classifyGridToFen(occupancy, luminance, true);

    expect(result.detectedColors.darkArmyCentroid).toBeCloseTo(70, 0);
    expect(result.detectedColors.lightArmyCentroid).toBeCloseTo(175, 0);
    expect(result.isLegal).toBe(true);
  });

  it('correctly classifies red and black or custom themed sets', () => {
    const occupancy = new Array(64).fill(0);
    const luminance = new Array(64).fill(100);

    // Red pieces (lum ~90) vs Black pieces (lum ~30)
    for (let i = 0; i < 16; i++) {
      occupancy[i] = 1;
      luminance[i] = 30;
    }
    for (let i = 48; i < 64; i++) {
      occupancy[i] = 1;
      luminance[i] = 140;
    }

    const result = classifyGridToFen(occupancy, luminance, true);

    expect(result.isLegal).toBe(true);
    expect(result.fen).toBeDefined();
  });

  it('adapts when playing from Black perspective', () => {
    const occupancy = new Array(64).fill(0);
    const luminance = new Array(64).fill(128);

    // When Black is at bottom: bottom ranks are Black
    for (let i = 48; i < 64; i++) {
      occupancy[i] = 1;
      luminance[i] = 40; // Dark pieces at bottom
    }
    for (let i = 0; i < 16; i++) {
      occupancy[i] = 1;
      luminance[i] = 230; // White pieces at top
    }

    const result = classifyGridToFen(occupancy, luminance, false);

    expect(result.isLegal).toBe(true);
    expect(result.fen).toContain('b'); // Active turn is Black
  });
});
