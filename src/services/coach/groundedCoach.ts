import { Chess } from 'chess.js';
import { EngineEvaluation } from '../../types/stockfish';
import { SquareCoord } from '../../types/chess';
import { formatEvaluationScore } from '../stockfish/uciProtocol';

export type CoachingLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CoachAdvice {
  headline: string;
  explanation: string;
  tacticalMotif?: string;
  keyThreat?: string;
  suggestedPlan: string;
}

/**
 * Analyzes tactical motifs present in a move.
 */
function identifyTacticalMotif(chess: Chess, from: SquareCoord, to: SquareCoord, san: string): string | undefined {
  const piece = chess.get(from as any);
  if (!piece) return undefined;

  // Check checkmate
  if (san.includes('#')) {
    return 'Checkmate Attack';
  }
  // Check check
  if (san.includes('+')) {
    return 'Checking Attack';
  }

  // Knight fork detection
  if (piece.type === 'n') {
    // Clone chess, make move and check how many high-value pieces are attacked
    const clone = new Chess(chess.fen());
    clone.move({ from, to });
    const attacks = clone.moves({ verbose: true }).filter((m) => m.from === to);
    const valuableTargets = attacks.filter((m) => m.captured && ['q', 'r', 'k'].includes(m.captured));
    if (valuableTargets.length >= 2) {
      return 'Knight Fork';
    }
  }

  // Pawn capture or break
  if (piece.type === 'p') {
    if (san.includes('x')) return 'Pawn Capture';
    if (['d4', 'e4', 'd5', 'e5'].includes(to)) return 'Center Control Advance';
  }

  // Piece development
  if (['n', 'b'].includes(piece.type) && ['f3', 'c3', 'f6', 'c6', 'e2', 'd2', 'e7', 'd7'].includes(to)) {
    return 'Active Piece Development';
  }

  return undefined;
}

/**
 * Generates natural language coaching advice strictly grounded in the engine's evaluation.
 */
export function generateGroundedCoachAdvice(
  fen: string,
  evaluation: EngineEvaluation,
  level: CoachingLevel = 'intermediate'
): CoachAdvice {
  const chess = new Chess(fen);
  const bestMove = evaluation.bestMove;

  if (!bestMove || bestMove.length < 4) {
    return {
      headline: 'Position Analyzed',
      explanation: 'No legal moves available or game has ended.',
      suggestedPlan: 'Review previous moves in study history.',
    };
  }

  const from = bestMove.slice(0, 2) as SquareCoord;
  const to = bestMove.slice(2, 4) as SquareCoord;
  const san = evaluation.bestMoveSan;
  const evalStr = formatEvaluationScore(evaluation.scoreCp, evaluation.mateIn);

  const motif = identifyTacticalMotif(chess, from, to, san);

  let headline = `Play ${san} (Eval: ${evalStr})`;
  let explanation = '';
  let suggestedPlan = '';

  if (evaluation.mateIn !== undefined) {
    headline = `Forced Mate in ${Math.abs(evaluation.mateIn)} with ${san}`;
    explanation = `The engine calculates a definitive winning sequence starting with ${san}. Every defensive resource by your opponent is strictly parried.`;
    suggestedPlan = 'Follow through with the forcing moves to deliver checkmate.';
  } else if (motif === 'Knight Fork') {
    headline = `Tactical Opportunity: ${san} Forks Opponent Pieces`;
    explanation = `Moving the knight to ${to} simultaneously attacks two or more enemy pieces, guaranteeing a material advantage.`;
    suggestedPlan = 'Execute the fork and capture the higher-value piece on the following move.';
  } else if (motif === 'Active Piece Development') {
    headline = `Develop with ${san} (${evalStr})`;
    explanation =
      level === 'beginner'
        ? `Moving your piece to ${to} brings it into the action and helps control the center of the board.`
        : `Developing to ${to} maximizes square mobility and coordinates with your remaining minor pieces while preserving king safety.`;
    suggestedPlan = 'Complete minor piece development, prepare castling, and secure pawn structure.';
  } else if (motif === 'Center Control Advance') {
    headline = `Control the Center with ${san} (${evalStr})`;
    explanation = `Pushing to ${to} stakes a firm claim on the central squares, restricting enemy piece movement and opening lines for your bishops.`;
    suggestedPlan = 'Support the center pawn with adjacent pieces and prevent counter-breaks.';
  } else {
    headline = `Best Move: ${san} (${evalStr})`;
    if (level === 'beginner') {
      explanation = `${san} is the most solid option here, improving your position and maintaining material balance.`;
      suggestedPlan = 'Keep your pieces defended and look for active squares.';
    } else if (level === 'advanced') {
      explanation = `The engine prefers ${san} at depth ${evaluation.depth}, generating an evaluation of ${evalStr}. Alternative candidate lines offer less pressure or concede initiative.`;
      suggestedPlan = `Follow the principal variation: ${evaluation.pv.slice(0, 3).join(' ')}.`;
    } else {
      explanation = `${san} places your piece on an optimal square, applying pressure while parrying opponent threats.`;
      suggestedPlan = 'Consolidate piece placement and maintain active pressure.';
    }
  }

  return {
    headline,
    explanation,
    tacticalMotif: motif,
    suggestedPlan,
  };
}
