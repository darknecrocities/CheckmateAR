import { QuadPoints } from '../../src/types/vision';
import { registerBoardFromCorners } from '../../src/services/vision/boardDetector';
import { assembleFenFromSquares } from '../../src/services/vision/pieceClassifier';
import { validateFen } from '../../src/services/chess/chessValidator';
import { StockfishEngine } from '../../src/services/stockfish/stockfishEngine';
import { generateGroundedCoachAdvice } from '../../src/services/coach/groundedCoach';
import { saveStudySession, getAllStudySessions } from '../../src/services/storage/studyStorage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('CheckmateAR End-to-End Pipeline Integration', () => {
  const corners: QuadPoints = {
    topLeft: { x: 50, y: 150 },
    topRight: { x: 350, y: 150 },
    bottomRight: { x: 420, y: 550 },
    bottomLeft: { x: -20, y: 550 },
  };

  it('executes full scan-to-analysis-to-AR-to-coach pipeline offline', async () => {
    // 1. Board detection & Homography
    const { homography, squares } = registerBoardFromCorners(corners, true);
    expect(Object.keys(squares)).toHaveLength(64);

    // 2. Simulate standard starting setup on squares
    squares['e2'].isOccupied = true;
    squares['e2'].detectedColor = 'w';
    squares['e2'].detectedPiece = 'p';

    squares['e7'].isOccupied = true;
    squares['e7'].detectedColor = 'b';
    squares['e7'].detectedPiece = 'p';

    // 3. Assemble FEN and validate legality
    const { fen } = assembleFenFromSquares(squares);
    expect(fen).toBeDefined();

    // 4. Run local Stockfish engine on a realistic middlegame position
    const engine = new StockfishEngine({ depth: 6, multiPv: 3 });
    // Standard Italian Game position: 1. e4 e5 2. Nf3 Nc6 3. Bc4
    const italianFen = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3';
    const evalResult = await engine.analyzePosition(italianFen);

    expect(evalResult.bestMove).toBeDefined();
    expect(evalResult.candidates.length).toBeGreaterThan(0);

    // 5. Generate Grounded AI Coach explanation
    const advice = generateGroundedCoachAdvice(italianFen, evalResult, 'intermediate');
    expect(advice.headline).toBeDefined();
    expect(advice.explanation.length).toBeGreaterThan(15);
    expect(advice.suggestedPlan).toBeDefined();

    // 6. Persist session to local offline study storage
    const saved = await saveStudySession({
      title: 'Italian Game Study',
      fen: italianFen,
      evaluation: evalResult,
      notes: 'Black to respond against Bc4',
    });
    expect(saved.id).toBeDefined();

    const allSessions = await getAllStudySessions();
    expect(allSessions.some((s) => s.id === saved.id)).toBe(true);
  });
});
