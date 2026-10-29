import { Chess } from 'chess.js';
import { SAMPLE_CHESS_GAMES } from '../../src/services/chess/samplePhotoGames';
import { detectAndAnalyzeChessPhoto } from '../../src/services/vision/photoChessDetector';
import { DecodedImage } from '../../src/services/vision/pixelDecoder';
import { StockfishEngine } from '../../src/services/stockfish/stockfishEngine';

describe('Photo Chess Game Detection & Stockfish Strategy Verification', () => {
  it('verifies that all curated sample games contain legal FENs and valid moves', () => {
    for (const game of SAMPLE_CHESS_GAMES) {
      const chess = new Chess(game.fen);
      expect(chess.isGameOver()).toBe(false);

      const legalMoves = chess.moves({ verbose: true });
      expect(legalMoves.length).toBeGreaterThan(0);

      const legalSans = legalMoves.map((m) => m.san);
      expect(legalSans).toContain(game.expectedBestMoveSan);
    }
  });

  it('runs Stockfish analysis on the Opera Game position and identifies the decisive pin attack', async () => {
    const operaGame = SAMPLE_CHESS_GAMES.find((g) => g.id === 'opera_game_1858')!;
    const engine = new StockfishEngine({ depth: 14, multiPv: 3 });

    const evalResult = await engine.analyzePosition(operaGame.fen);
    expect(evalResult.bestMoveSan).toBe('Bxd7+');
    expect(evalResult.scoreCp).toBeGreaterThan(500); // Decisive winning advantage
  });

  it('processes a synthetic chess photo buffer and outputs legal FEN and tactical evaluation', async () => {
    // Generate a 160x160 checkerboard image buffer
    const width = 160;
    const height = 160;
    const data = new Uint8Array(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tx = Math.floor(x / 20);
        const ty = Math.floor(y / 20);
        const isLight = (tx + ty) % 2 === 0;
        const lum = isLight ? 210 : 45;

        const idx = (y * width + x) * 4;
        data[idx] = lum;
        data[idx + 1] = lum;
        data[idx + 2] = lum;
        data[idx + 3] = 255;
      }
    }

    const image: DecodedImage = { width, height, data };
    const result = await detectAndAnalyzeChessPhoto(image);

    expect(result.isLegalFen).toBe(true);
    expect(result.fen.split(' ').length).toBe(6);
    expect(result.confidence).toBeGreaterThan(0.5);

    // Chess.js validates legal FEN
    const chess = new Chess(result.fen);
    expect(chess.moves().length).toBeGreaterThanOrEqual(0);
  });
});
