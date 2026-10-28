import { SquareCoord } from '../../types/chess';
import { EXTENDED_STRATEGY_CATALOG } from './strategyCatalogExtended';

export type StrategyCategory =
  | 'all'
  | 'openings'
  | 'tactics'
  | 'attack'
  | 'middlegame'
  | 'endgame';

export type StrategyDifficulty = 'Beginner' | 'Intermediate' | 'Master';

export interface StrategyItem {
  id: string;
  title: string;
  category: Exclude<StrategyCategory, 'all'>;
  moves: string;
  uciMoves: string[];
  fen: string;
  concept: string;
  tacticalGoal: string;
  masterWinRate: string;
  difficulty: StrategyDifficulty;
  featuredPiece: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  keySquare: SquareCoord;
}

const CORE_STRATEGIES: StrategyItem[] = [
  // --- OPENINGS ---
  {
    id: 'ruy-lopez',
    title: 'Ruy Lopez: Spanish Opening',
    category: 'openings',
    moves: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1',
    uciMoves: ['e1g1', 'f8e7', 'f1e1'],
    fen: 'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5',
    concept: 'Classical kingside pressure targeting the c6 knight defender to exert long-term central tension on e5.',
    tacticalGoal: 'Rapid castling and prepared d4 central strike with sustained spatial dominance.',
    masterWinRate: '56% White',
    difficulty: 'Intermediate',
    featuredPiece: 'b',
    keySquare: 'b5',
  },
  {
    id: 'sicilian-najdorf',
    title: 'Sicilian Defense: Najdorf',
    category: 'openings',
    moves: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5',
    uciMoves: ['c1e3', 'e7e5', 'd4b3'],
    fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    concept: 'The weapon of Fischer and Kasparov. Asymmetrical counter-attack fighting for the c-file and e5 outposts.',
    tacticalGoal: 'Prevent Bb5+ / Nb5 probes with 5...a6 and initiate dynamic counterplay with ...e5.',
    masterWinRate: '54% Dynamic',
    difficulty: 'Master',
    featuredPiece: 'n',
    keySquare: 'c5',
  },
  {
    id: 'queens-gambit',
    title: "Queen's Gambit Declined",
    category: 'openings',
    moves: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3',
    uciMoves: ['e2e3', 'e8g8', 'g1f3'],
    fen: 'rnbqk2r/ppp1bppp/4pn2/6B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 2 5',
    concept: 'Classical positional struggle. White offers the c-pawn to establish a dominant pawn center on d4/e4.',
    tacticalGoal: 'Black maintains a rock-solid pawn on d5 while White prepares central and queenside pressure.',
    masterWinRate: '55% White',
    difficulty: 'Intermediate',
    featuredPiece: 'q',
    keySquare: 'd5',
  },
  {
    id: 'kings-indian',
    title: "King's Indian Defense",
    category: 'openings',
    moves: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2',
    uciMoves: ['g1f3', 'e8g8', 'f1e2'],
    fen: 'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5',
    concept: 'Hypermodern masterpiece. Black concedes the spatial center to launch a vicious kingside pawn avalanche.',
    tacticalGoal: 'Lock the center with ...e5 and unleash the f7-f5 strike supported by the g7 bishop.',
    masterWinRate: '52% Dynamic',
    difficulty: 'Master',
    featuredPiece: 'k',
    keySquare: 'g7',
  },

  // --- TACTICS ---
  {
    id: 'discovered-check',
    title: 'Discovered Check (Kubbel 1907)',
    category: 'tactics',
    moves: '1. Nd5+ Ka2 2. Nb4+ Ka3 3. Bc5!',
    uciMoves: ['b4d5', 'a3a2', 'd5b4'],
    fen: '5B2/6P1/1p6/8/1N6/kP6/2K5/8 w - - 0 1',
    concept: 'Moving a masking piece unmasks an unblockable line-of-sight attack from a sniper Bishop behind it.',
    tacticalGoal: 'White moves the b4 Knight to d5, unleashing discovered check from the f8 Bishop.',
    masterWinRate: '100% Forced Win',
    difficulty: 'Master',
    featuredPiece: 'n',
    keySquare: 'd5',
  },
  {
    id: 'royal-knight-fork',
    title: 'The Royal Knight Fork',
    category: 'tactics',
    moves: '1. Nc7+ Qxc7 2. dxe5',
    uciMoves: ['b5c7', 'e7c7', 'd4e5'],
    fen: 'r1b1k2r/pp2qppp/5n2/1N2p3/3P4/8/PPP2PPP/R1BQK2R w KQkq - 0 1',
    concept: 'Exploiting the geometric L-jump of the Knight to attack King, Queen, and Rook simultaneously.',
    tacticalGoal: 'Jump Nb5-c7+ delivering check to the e8 King while forking the Queen and a8 Rook.',
    masterWinRate: '88% Decisive',
    difficulty: 'Beginner',
    featuredPiece: 'n',
    keySquare: 'c7',
  },
  {
    id: 'greek-gift',
    title: 'Greek Gift Sacrifice (Bxh7+)',
    category: 'tactics',
    moves: '1. Bxh7+ Kxh7 2. Ng5+ Kg8 3. Qh5',
    uciMoves: ['d3h7', 'g8h7', 'f3g5'],
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/8/3P4/2PB1N2/PP3PPP/R1BQK2R w KQ - 0 1',
    concept: 'The quintessential Bishop sacrifice blowing open the g- and h-files against the castled monarch.',
    tacticalGoal: 'Sacrifice Bxh7+ followed by Ng5+ and Qh5 to construct a mating net on h7.',
    masterWinRate: '82% Decisive',
    difficulty: 'Intermediate',
    featuredPiece: 'b',
    keySquare: 'h7',
  },

  // --- MIDDLEGAME ---
  {
    id: 'iqp-dynamics',
    title: 'Isolated Queen Pawn (IQP) Break',
    category: 'middlegame',
    moves: '1. d5! exd5 2. Bg5',
    uciMoves: ['d4d5', 'e6d5', 'c1g5'],
    fen: 'r1bqr1k1/pp3ppp/2n1pn2/8/3P4/2NB1N2/PP3PPP/R1BQ1RK1 w - - 0 1',
    concept: 'Liquidate the isolated d4 pawn at the right moment with d4-d5 to unleash diagonal piece energy.',
    tacticalGoal: 'Push d5 to open lines for the c3 Knight and dark-squared Bishop against f6/h7.',
    masterWinRate: '61% Dynamic',
    difficulty: 'Master',
    featuredPiece: 'p',
    keySquare: 'd5',
  },
  {
    id: 'pigs-on-7th',
    title: 'Doubled Rooks on 7th Rank',
    category: 'middlegame',
    moves: '1. Rbb7 Rf8 2. g3',
    uciMoves: ['b2b7', 'e8f8', 'g2g3'],
    fen: '4r1k1/3R1ppp/8/8/8/8/1R3PPP/6K1 w - - 0 1',
    concept: 'Connected Rooks on the 7th rank decimate the enemy pawn structure and paralyze the defending King.',
    tacticalGoal: 'Double on b7 and d7 to force passive defense and harvest kingside pawns.',
    masterWinRate: '84% Winning',
    difficulty: 'Intermediate',
    featuredPiece: 'r',
    keySquare: 'b7',
  },

  // --- ENDGAME ---
  {
    id: 'lucena-bridge',
    title: 'Lucena Bridge Building',
    category: 'endgame',
    moves: '1. Rg4 Rb1+ 2. Ka7',
    uciMoves: ['f4g4', 'd1b1', 'b8a7'],
    fen: '1K1k4/1P6/8/8/5R2/8/8/3r4 w - - 0 1',
    concept: 'The essential winning technique for Rook and Pawn endgames when the pawn reaches the 7th rank.',
    tacticalGoal: 'Keep the Rook on the 4th rank to build a shield (bridge) blocking vertical checks.',
    masterWinRate: '100% Theoretical Win',
    difficulty: 'Intermediate',
    featuredPiece: 'r',
    keySquare: 'g4',
  },
  {
    id: 'philidor-defense',
    title: 'Philidor Rook Endgame Draw',
    category: 'endgame',
    moves: '1... Ra1! 2. Kd6 Ra6+',
    uciMoves: ['a6a1', 'd5d6', 'a1a6'],
    fen: '3k4/7R/r7/3KP3/8/8/8/8 b - - 0 1',
    concept: 'The fundamental drawing technique in Rook endings by dropping the Rook to the 1st rank to check from behind.',
    tacticalGoal: 'Swing the Rook to a1 so the advancing White King has no shelter from checks.',
    masterWinRate: '100% Theoretical Draw',
    difficulty: 'Intermediate',
    featuredPiece: 'r',
    keySquare: 'a1',
  },
];

export const CHESS_STRATEGY_DATABASE: StrategyItem[] = [
  ...CORE_STRATEGIES,
  ...EXTENDED_STRATEGY_CATALOG,
];

export function getStrategiesByCategory(category: StrategyCategory): StrategyItem[] {
  if (category === 'all') return CHESS_STRATEGY_DATABASE;
  return CHESS_STRATEGY_DATABASE.filter((item) => item.category === category);
}

export interface StrategyFilterOptions {
  category?: StrategyCategory;
  query?: string;
  difficulty?: StrategyDifficulty | 'all';
  bookmarkedIds?: string[];
  onlyBookmarked?: boolean;
}

export function filterStrategies(options: StrategyFilterOptions): StrategyItem[] {
  const {
    category = 'all',
    query = '',
    difficulty = 'all',
    bookmarkedIds = [],
    onlyBookmarked = false,
  } = options;

  const normalizedQuery = query.trim().toLowerCase();

  return CHESS_STRATEGY_DATABASE.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (difficulty !== 'all' && item.difficulty !== difficulty) return false;
    if (onlyBookmarked && !bookmarkedIds.includes(item.id)) return false;

    if (normalizedQuery.length > 0) {
      const searchable = `${item.title} ${item.concept} ${item.tacticalGoal} ${item.moves} ${item.category}`.toLowerCase();
      if (!searchable.includes(normalizedQuery)) return false;
    }

    return true;
  });
}
