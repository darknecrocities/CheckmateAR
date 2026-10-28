import { Chess } from 'chess.js';
import {
  CHESS_STRATEGY_DATABASE,
  getStrategiesByCategory,
  filterStrategies,
} from '../../src/services/chess/strategyLibrary';
import { validateFen } from '../../src/services/chess/chessValidator';

describe('Expanded 25-Strategy Grandmaster Library & Replayer Sequences', () => {
  it('contains 25 verified strategies across all 5 master categories', () => {
    const openings = getStrategiesByCategory('openings');
    const tactics = getStrategiesByCategory('tactics');
    const attack = getStrategiesByCategory('attack');
    const middlegame = getStrategiesByCategory('middlegame');
    const endgame = getStrategiesByCategory('endgame');

    expect(CHESS_STRATEGY_DATABASE.length).toBe(25);
    expect(openings.length).toBeGreaterThanOrEqual(8);
    expect(tactics.length).toBeGreaterThanOrEqual(6);
    expect(attack.length).toBeGreaterThanOrEqual(4);
    expect(middlegame.length).toBeGreaterThanOrEqual(4);
    expect(endgame.length).toBeGreaterThanOrEqual(3);
  });

  it('guarantees legal FENs and legal step-by-step uciMoves sequences for all 25 entries', () => {
    for (const item of CHESS_STRATEGY_DATABASE) {
      const validation = validateFen(item.fen);
      expect(validation.isValid).toBe(true);
      expect(item.uciMoves.length).toBeGreaterThanOrEqual(2);

      // Verify every step in uciMoves is 100% legal in chess.js
      const game = new Chess(item.fen);
      for (const uci of item.uciMoves) {
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const moveObj =
          uci.length > 4
            ? game.move({ from, to, promotion: uci[4] })
            : game.move({ from, to });
        expect(moveObj).not.toBeNull();
      }
    }
  });

  it('filters strategies by query, category, difficulty, and bookmarked IDs', () => {
    const morphy = filterStrategies({ query: 'morphy' });
    expect(morphy.length).toBe(1);
    expect(morphy[0].id).toBe('morphy-opera-sacrifice');

    const masterAttacks = filterStrategies({
      category: 'attack',
      difficulty: 'Master',
    });
    expect(masterAttacks.length).toBeGreaterThanOrEqual(2);

    const bookmarked = filterStrategies({
      bookmarkedIds: ['ruy-lopez', 'lucena-bridge'],
      onlyBookmarked: true,
    });
    expect(bookmarked.length).toBe(2);
  });

  it('includes the verified Leonid Kubbel 1907 discovered check puzzle', () => {
    const kubbel = CHESS_STRATEGY_DATABASE.find((s) => s.id === 'discovered-check');
    expect(kubbel).toBeDefined();
    expect(kubbel?.fen).toBe('5B2/6P1/1p6/8/1N6/kP6/2K5/8 w - - 0 1');
    expect(kubbel?.uciMoves[0]).toBe('b4d5');
  });
});
