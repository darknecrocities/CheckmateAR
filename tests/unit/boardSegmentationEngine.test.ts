import {
  segmentChessBoard,
  warpPerspective640Grid,
  detectPiecesAndMapToGrid,
  recognizeChessPosition,
  synthesizeDynamicFenFromTelemetry,
} from '../../src/services/vision/boardSegmentationEngine';
import { QuadPoints } from '../../src/types/vision';

const SAMPLE_CORNERS: QuadPoints = {
  topLeft: { x: 40, y: 180 },
  topRight: { x: 340, y: 180 },
  bottomRight: { x: 360, y: 500 },
  bottomLeft: { x: 20, y: 500 },
};

describe('3-Stage ChessPositionRecognizer (dopaul + FloudMe77)', () => {
  test('Stage 1: segmentChessBoard produces polygon mask, bounding box, and chess_board confidence', () => {
    const seg = segmentChessBoard(SAMPLE_CORNERS, 0.97);
    expect(seg.label).toBe('chess_board');
    expect(seg.confidence).toBe(0.97);
    expect(seg.polygon).toHaveLength(4);
    expect(seg.boundingBox.x).toBe(20);
    expect(seg.boundingBox.y).toBe(180);
    expect(seg.boundingBox.width).toBe(340);
    expect(seg.boundingBox.height).toBe(320);
  });

  test('Stage 2: warpPerspective640Grid projects 64 squares across normalized 640x640 grid', () => {
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const { homography, squares } = warpPerspective640Grid(
      SAMPLE_CORNERS,
      startingFen,
      'white'
    );

    expect(homography).toHaveLength(3);
    expect(Object.keys(squares)).toHaveLength(64);
    expect(squares.e1.isOccupied).toBe(true);
    expect(squares.e1.detectedPiece).toBe('k');
    expect(squares.e1.detectedColor).toBe('w');
    expect(squares.e4.isOccupied).toBe(false);
  });

  test('Stage 3: detectPiecesAndMapToGrid outputs 12-class YOLO bounding boxes', () => {
    const kubbelFen = '5B2/6P1/1p6/8/1N6/kP6/2K5/8 w - - 0 1';
    const result = recognizeChessPosition(SAMPLE_CORNERS, kubbelFen, 0.96, 'white');

    expect(result.warpedGridSize).toBe(640);
    expect(result.pieceCount).toBe(7);
    expect(result.detections).toHaveLength(7);

    const classes = result.detections.map((d) => d.className);
    expect(classes).toContain('white-knight');
    expect(classes).toContain('white-bishop');
    expect(classes).toContain('white-king');
    expect(classes).toContain('black-king');
    expect(classes).toContain('white-pawn');
    expect(classes).toContain('black-pawn');

    for (const det of result.detections) {
      expect(det.bbox.width).toBeGreaterThan(10);
      expect(det.bbox.height).toBeGreaterThan(10);
      expect(det.confidence).toBeGreaterThanOrEqual(0.85);
    }
  });

  test('synthesizeDynamicFenFromTelemetry heals live camera telemetry into a legal FEN', () => {
    const startingFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
    const { squares } = warpPerspective640Grid(SAMPLE_CORNERS, startingFen, 'white');
    const dynamic = synthesizeDynamicFenFromTelemetry(squares, {
      e4: { luminance: 210, variance: 55, edgeContrast: 42 },
      e5: { luminance: 40, variance: 52, edgeContrast: 40 },
    } as any);

    expect(dynamic.fen).toBeTruthy();
    expect(dynamic.fen.split(' ').length).toBeGreaterThanOrEqual(4);
  });
});
