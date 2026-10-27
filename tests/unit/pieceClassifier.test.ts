import {
  classifyOccupancy,
  classifyPieceColor,
  classifyPieceType,
  assembleFenFromSquares,
} from '../../src/services/vision/pieceClassifier';
import { registerBoardFromCorners } from '../../src/services/vision/boardDetector';
import { MoveDifferenceTracker } from '../../src/services/vision/moveDifferenceTracker';
import { QuadPoints, DetectedSquare } from '../../src/types/vision';
import { SquareCoord } from '../../src/types/chess';

describe('Piece Classifier & Board Detection', () => {
  const dummyCorners: QuadPoints = {
    topLeft: { x: 50, y: 50 },
    topRight: { x: 450, y: 50 },
    bottomRight: { x: 450, y: 450 },
    bottomLeft: { x: 50, y: 450 },
  };

  it('registers all 64 squares with correct algebraic coordinates and screen polygons', () => {
    const { squares } = registerBoardFromCorners(dummyCorners, true);

    expect(Object.keys(squares)).toHaveLength(64);
    expect(squares['e4']).toBeDefined();
    expect(squares['a1']).toBeDefined();
    expect(squares['h8']).toBeDefined();

    // Verify e4 screen center is inside the bounding box
    const e4 = squares['e4'];
    expect(e4.screenCenter.x).toBeGreaterThan(50);
    expect(e4.screenCenter.x).toBeLessThan(450);
    expect(e4.screenCenter.y).toBeGreaterThan(50);
    expect(e4.screenCenter.y).toBeLessThan(450);
  });

  it('correctly classifies piece color using luminance thresholding', () => {
    const whitePieceFeatures = {
      meanLuminance: 210,
      variance: 45,
      heightRatio: 0.4,
      contourAsymmetry: 0.1,
      hasCrownFinial: false,
      topWidthRatio: 0.3,
    };
    const blackPieceFeatures = {
      meanLuminance: 40,
      variance: 50,
      heightRatio: 0.4,
      contourAsymmetry: 0.1,
      hasCrownFinial: false,
      topWidthRatio: 0.3,
    };

    const whiteResult = classifyPieceColor(whitePieceFeatures);
    expect(whiteResult.color).toBe('w');
    expect(whiteResult.confidence).toBeGreaterThan(0.85);

    const blackResult = classifyPieceColor(blackPieceFeatures);
    expect(blackResult.color).toBe('b');
    expect(blackResult.confidence).toBeGreaterThan(0.85);
  });

  it('correctly identifies knight based on silhouette asymmetry', () => {
    const knightFeatures = {
      meanLuminance: 200,
      variance: 60,
      heightRatio: 0.6,
      contourAsymmetry: 0.45, // Distinctive snout/ear protrusion
      hasCrownFinial: false,
      topWidthRatio: 0.4,
    };

    const result = classifyPieceType(knightFeatures, 'f3', 'w');
    expect(result.type).toBe('n');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('detects physical moves from frame delta sequence', () => {
    const { squares: frameA } = registerBoardFromCorners(dummyCorners, true);
    // Mark e2 as occupied by white pawn
    frameA['e2'].isOccupied = true;
    frameA['e2'].detectedColor = 'w';
    frameA['e2'].detectedPiece = 'p';

    const tracker = new MoveDifferenceTracker();
    // First frame initializes baseline
    expect(tracker.processFrame(frameA)).toBeNull();

    // Create frame B where e2 is empty, e4 is occupied
    const frameB: Record<SquareCoord, DetectedSquare> = JSON.parse(JSON.stringify(frameA));
    frameB['e2'].isOccupied = false;
    frameB['e4'].isOccupied = true;
    frameB['e4'].detectedColor = 'w';
    frameB['e4'].detectedPiece = 'p';

    // Must see move for 3 stable frames
    expect(tracker.processFrame(frameB)).toBeNull();
    expect(tracker.processFrame(frameB)).toBeNull();
    const move = tracker.processFrame(frameB);

    expect(move).not.toBeNull();
    expect(move?.from).toBe('e2');
    expect(move?.to).toBe('e4');
  });
});
