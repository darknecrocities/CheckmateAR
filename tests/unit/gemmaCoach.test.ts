import { askGemmaCoach, CoachContext } from '../../src/services/coach/gemmaCoachService';
import { EngineEvaluation } from '../../src/types/stockfish';

describe('Gemma AI Chess Coach & Conversational Intelligence', () => {
  const dummyEval: EngineEvaluation = {
    bestMove: 'e2e4',
    bestMoveSan: 'e4',
    scoreCp: 35,
    depth: 14,
    nodesSearched: 50000,
    pv: ['e2e4', 'e7e5'],
    isThinking: false,
    timestamp: Date.now(),
    candidates: [
      { uci: 'e2e4', san: 'e4', from: 'e2', to: 'e4', depth: 14, scoreCp: 35, pv: ['e2e4', 'e7e5'] },
      { uci: 'd2d4', san: 'd4', from: 'd2', to: 'd4', depth: 14, scoreCp: 28, pv: ['d2d4', 'd7d5'] },
    ],
  };

  const baseContext: CoachContext = {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    evaluation: dummyEval,
    level: 'intermediate',
  };

  it('responds warmly to conversational greetings with active board grounding', async () => {
    const res = await askGemmaCoach('Hello coach!', baseContext);
    expect(res.reply).toBeDefined();
    expect(res.reply.length).toBeGreaterThan(20);
    expect(res.source).toBe('local-gemma-engine');
  });

  it('answers identity inquiries about CheckmateAR and capabilities', async () => {
    const res = await askGemmaCoach('Who are you and what can you do?', baseContext);
    expect(res.headline).toContain('Meet Your Gemma AI Coach');
    expect(res.reply).toContain('Stockfish');
  });

  it('provides actionable grandmaster study advice for improvement questions', async () => {
    const res = await askGemmaCoach('How can I improve my chess rating?', baseContext);
    expect(res.headline).toContain('Grandmaster Improvement Guide');
    expect(res.reply.length).toBeGreaterThan(40);
  });

  it('retrieves detailed opening theory for the Sicilian Defense', async () => {
    const res = await askGemmaCoach('Can you explain the Sicilian Defense?', baseContext);
    expect(res.headline).toContain('Sicilian Defense');
    expect(res.reply).toContain('1. e4 c5');
    expect(res.reply).toContain('Key Plans');
  });

  it('explains tactical motifs such as Knight Fork and Pin', async () => {
    const forkRes = await askGemmaCoach('Tell me about a Knight Fork', baseContext);
    expect(forkRes.headline).toContain('Knight Fork');
    expect(forkRes.tacticalMotif).toBe('Knight Fork');
    expect(forkRes.reply).toContain('simultaneously');

    const pinRes = await askGemmaCoach('What is an Absolute Pin?', baseContext);
    expect(pinRes.headline).toContain('Absolute Pin');
    expect(pinRes.reply).toContain('King');
  });

  it('explains endgame masterclass concepts such as Opposition', async () => {
    const res = await askGemmaCoach('How does the Opposition work in the endgame?', baseContext);
    expect(res.headline).toContain('Opposition');
    expect(res.reply).toContain('Principle');
    expect(res.reply).toContain('Technique');
  });

  it('explains opponent threats grounded in the active position', async () => {
    const res = await askGemmaCoach('What is my opponent threatening here?', baseContext);
    expect(res.headline).toContain('Threats');
    expect(res.reply).toContain('e4');
  });

  it('adapts advice according to the coaching level', async () => {
    const begRes = await askGemmaCoach('Why is this move good?', {
      ...baseContext,
      level: 'beginner',
    });
    expect(begRes.reply).toContain('controls important central squares');

    const advRes = await askGemmaCoach('Why is this move good?', {
      ...baseContext,
      level: 'advanced',
    });
    expect(advRes.reply).toContain('depth 14');
  });
});
