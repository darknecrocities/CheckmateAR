import { StockfishEngine } from '../../src/services/stockfish/stockfishEngine';
import { validateFen, executeMove, uciToSan } from '../../src/services/chess/chessValidator';
import { parseUciInfoLine, formatEvaluationScore } from '../../src/services/stockfish/uciProtocol';

describe('Stockfish Engine & Chess Rules Validator', () => {
  it('validates legal and illegal FEN positions', () => {
    const validStart = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(validateFen(validStart).isValid).toBe(true);

    const invalidFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/INVALID w KQkq - 0 1';
    expect(validateFen(invalidFen).isValid).toBe(false);
  });

  it('converts UCI moves to SAN accurately', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    // e7e5 should be "e5"
    expect(uciToSan(fen, 'e7e5')).toBe('e5');
    // g8f6 should be "Nf6"
    expect(uciToSan(fen, 'g8f6')).toBe('Nf6');
  });

  it('executes legal move and updates FEN state', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const result = executeMove(fen, 'e2', 'e4');

    expect(result.success).toBe(true);
    expect(result.san).toBe('e4');
    expect(result.newFen).toContain('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq');
  });

  it('parses UCI info lines into structured depth and evaluation', () => {
    const uciLine = 'info depth 14 seldepth 20 multipv 1 score cp 26 nodes 145020 pv g8f6 d2d4';
    const parsed = parseUciInfoLine(uciLine);

    expect(parsed?.depth).toBe(14);
    expect(parsed?.multipv).toBe(1);
    expect(parsed?.scoreCp).toBe(26);
    expect(parsed?.pv).toEqual(['g8f6', 'd2d4']);
    expect(formatEvaluationScore(parsed?.scoreCp)).toBe('+0.26');
  });

  it('runs local Stockfish analysis and returns best move with MultiPV candidates', async () => {
    const engine = new StockfishEngine({ depth: 4, multiPv: 3 });
    // Fool's mate position: White to play Qh5#
    const fen = 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2';
    const evalResult = await engine.analyzePosition(fen);

    console.log('SPARKCHESS PUZZLE BEST MOVE:', evalResult.bestMove, evalResult.bestMoveSan, 'SCORE:', evalResult.scoreCp);

    expect(evalResult.bestMove).toBeDefined();
    expect(evalResult.candidates.length).toBeGreaterThan(0);
    // Black's best move in this position is Qh4#
    expect(evalResult.bestMove).toBe('d8h4');
    expect(evalResult.bestMoveSan).toBe('Qh4#');
  });

  it('accurately evaluates endgame puzzle positions like SparkChess King+Knight+Bishop', async () => {
    const engine = new StockfishEngine({ depth: 8, multiPv: 3 });
    // SparkChess puzzle: White K at c2, N at b4, P at b3, B at f6, P at g5. Black K at a4, P at b6.
    const fen = '8/8/1p3B2/6P1/kN6/1P6/2K5/8 w - - 0 1';
    const evalResult = await engine.analyzePosition(fen);

    console.log('SPARKCHESS PUZZLE BEST MOVE:', evalResult.bestMove, evalResult.bestMoveSan, 'SCORE:', evalResult.scoreCp);

    expect(evalResult.bestMove).toBeDefined();
    expect(evalResult.bestMoveSan).toBeDefined();
    expect(evalResult.scoreCp).toBeGreaterThan(0); // White has decisive winning advantage
  });
});
