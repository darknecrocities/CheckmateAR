import {
  getPieceNameFromFen,
  formatTacticalMoveAction,
  parseBoardFenWithVisionAi,
} from '../../src/services/vision/multimodalChessVision';
import { Chess } from 'chess.js';

describe('AR Tactical Leader Callout & Physical Object Geometry', () => {
  const sampleFen = 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';

  it('correctly resolves piece names from physical board coordinates and FEN', () => {
    expect(getPieceNameFromFen(sampleFen, 'd1')).toBe('QUEEN');
    expect(getPieceNameFromFen(sampleFen, 'e1')).toBe('KING');
    expect(getPieceNameFromFen(sampleFen, 'c4')).toBe('BISHOP');
    expect(getPieceNameFromFen(sampleFen, 'f3')).toBe('KNIGHT');
    expect(getPieceNameFromFen(sampleFen, 'a1')).toBe('ROOK');
    expect(getPieceNameFromFen(sampleFen, 'e4')).toBe('PAWN');
  });

  it('formats tactical next move action with piece name and trajectory', () => {
    // White plays d2d3
    const action = formatTacticalMoveAction(sampleFen, 'd2d3');
    expect(action.pieceName).toBe('PAWN');
    expect(action.from).toBe('d2');
    expect(action.to).toBe('d3');
    expect(action.displayText).toBe('PAWN d2 ➔ d3');
  });

  it('formats a Queen tactical move matching reference image (QUEEN d8 -> g5)', () => {
    // Position where black Queen is on d8
    const queenFen = 'r1bqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';
    const action = formatTacticalMoveAction(queenFen, 'd8g5');
    expect(action.pieceName).toBe('QUEEN');
    expect(action.from).toBe('d8');
    expect(action.to).toBe('g5');
    expect(action.displayText).toContain('QUEEN d8 ➔ g5');
  });

  it('handles invalid or empty UCI moves gracefully without crashing', () => {
    const fallback = formatTacticalMoveAction(sampleFen, '');
    expect(fallback.pieceName).toBe('PIECE');
    expect(fallback.displayText).toBe('CALCULATING BEST MOVE');
  });

  it('safely validates multimodal vision offline fallback to legal FEN', async () => {
    const result = await parseBoardFenWithVisionAi('data:image/jpeg;base64,12345');
    expect(result.isLegal).toBe(true);
    expect(result.source).toBe('local');

    // Verify legal with chess.js
    const chess = new Chess(result.fen);
    expect(chess.moves().length).toBeGreaterThan(0);
  });
});
