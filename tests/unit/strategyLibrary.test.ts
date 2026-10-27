import {
  CHESS_STRATEGY_DATABASE,
  getStrategiesByCategory,
} from '../../src/services/chess/strategyLibrary';
import { validateFen } from '../../src/services/chess/chessValidator';

describe('Chess Strategy Library & Database', () => {
  it('contains strategies across all 4 master categories', () => {
    const openings = getStrategiesByCategory('openings');
    const tactics = getStrategiesByCategory('tactics');
    const middlegame = getStrategiesByCategory('middlegame');
    const endgame = getStrategiesByCategory('endgame');

    expect(openings.length).toBeGreaterThanOrEqual(4);
    expect(tactics.length).toBeGreaterThanOrEqual(3);
    expect(middlegame.length).toBeGreaterThanOrEqual(2);
    expect(endgame.length).toBeGreaterThanOrEqual(2);
  });

  it('filters all categories properly', () => {
    const all = getStrategiesByCategory('all');
    expect(all.length).toBe(CHESS_STRATEGY_DATABASE.length);
  });

  it('guarantees valid legal FEN positions for all strategy entries', () => {
    for (const item of CHESS_STRATEGY_DATABASE) {
      const validation = validateFen(item.fen);
      expect(validation.isValid).toBe(true);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.moves.length).toBeGreaterThan(0);
      expect(item.masterWinRate.length).toBeGreaterThan(0);
      expect(item.concept.length).toBeGreaterThan(0);
    }
  });

  it('includes the verified Leonid Kubbel 1907 discovered check puzzle', () => {
    const kubbel = CHESS_STRATEGY_DATABASE.find((s) => s.id === 'discovered-check');
    expect(kubbel).toBeDefined();
    expect(kubbel?.fen).toBe('5B2/6P1/1p6/8/1N6/kP6/2K5/8 w - - 0 1');
    expect(kubbel?.featuredPiece).toBe('n');
  });
});
