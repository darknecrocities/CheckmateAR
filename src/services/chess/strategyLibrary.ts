import { SquareCoord } from '../../types/chess';

export type StrategyCategory = 'all' | 'openings' | 'tactics' | 'middlegame' | 'endgame';

export interface StrategyItem {
  id: string;
  title: string;
  category: 'openings' | 'tactics' | 'middlegame' | 'endgame';
  moves: string;
  fen: string;
  concept: string;
  tacticalGoal: string;
  masterWinRate: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
  featuredPiece: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  keySquare: SquareCoord;
}

export const CHESS_STRATEGY_DATABASE: StrategyItem[] = [
  // --- OPENINGS ---
  {
    id: 'ruy-lopez',
    title: 'Ruy Lopez: Spanish Opening',
    category: 'openings',
    moves: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6',
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
    moves: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6',
    fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    concept: 'The weapon of Fischer and Kasparov. Asymmetrical counter-attack fighting for the c-file and e5 outposts.',
    tacticalGoal: 'Prevent Bb5+ / Nb5 probes with 5...a6 and initiate queenside expansion with ...b5.',
    masterWinRate: '54% Dynamic',
    difficulty: 'Master',
    featuredPiece: 'n',
    keySquare: 'c5',
  },
  {
    id: 'queens-gambit',
    title: "Queen's Gambit Declined",
    category: 'openings',
    moves: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7',
    fen: 'rnbqk2r/ppp1bppp/4pn2/6B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq - 2 5',
    concept: 'Classical positional struggle. White offers the c-pawn to establish a dominant pawn center on d4/e4.',
    tacticalGoal: 'Black maintains a rock-solid pawn on d5 while White executes the Carlsbad minority attack.',
    masterWinRate: '55% White',
    difficulty: 'Intermediate',
    featuredPiece: 'q',
    keySquare: 'd5',
  },
  {
    id: 'kings-indian',
    title: "King's Indian Defense",
    category: 'openings',
    moves: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6',
    fen: 'rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5',
    concept: 'Hypermodern masterpiece. Black concedes the spatial center to launch a vicious kingside pawn avalanche.',
    tacticalGoal: 'Lock the center with ...e5 and unleash the f7-f5 strike supported by the dark-squared bishop.',
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
    fen: '5B2/6P1/1p6/8/1N6/kP6/2K5/8 w - - 0 1',
    concept: 'Moving a masking piece unmasks an unblockable line-of-sight attack from a second sniper piece behind it.',
    tacticalGoal: 'White moves the b4 Knight to deliver devastating check from the f8 Bishop with decisive advantage.',
    masterWinRate: '100% Mate in 2',
    difficulty: 'Master',
    featuredPiece: 'n',
    keySquare: 'd5',
  },
  {
    id: 'royal-knight-fork',
    title: 'The Royal Knight Fork',
    category: 'tactics',
    moves: '1. Nc7+ Qxc7 2. Qxc7',
    fen: 'r1b1k2r/ppN1qppp/5n2/4p3/3P4/8/PPP2PPP/R1BQK2R b KQkq - 0 1',
    concept: 'Exploiting the geometric unique L-jump of the knight to attack two or more high-value pieces simultaneously.',
    tacticalGoal: 'Simultaneous check on the enemy King while attacking the Queen or Rook with no defense.',
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
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/8/3P4/2PB1N2/PP3PPP/R1BQK2R w KQ - 0 1',
    concept: 'The quintessential bishop sacrifice blowing open the g- and h-files against the castled enemy monarch.',
    tacticalGoal: 'Follow up with Ng5+ and Qh5 bringing the Queen into the unprotected kingside for mate.',
    masterWinRate: '82% Decisive',
    difficulty: 'Intermediate',
    featuredPiece: 'b',
    keySquare: 'h7',
  },

  // --- MIDDLEGAME ---
  {
    id: 'iqp-dynamics',
    title: 'Isolated Queen Pawn (IQP)',
    category: 'middlegame',
    moves: '1. d5 exd5 2. Nxd5',
    fen: 'r1bqr1k1/pp3ppp/2n5/3P4/8/2N2N2/PP2BPPP/R2Q1RK1 b - - 0 1',
    concept: 'The d4/d5 pawn has no friendly pawns on adjacent files. Grants immense piece activity before the endgame.',
    tacticalGoal: 'Use the open c- and e-files and the d5 outpost to break through before piece trades occur.',
    masterWinRate: '51% Balanced',
    difficulty: 'Master',
    featuredPiece: 'p',
    keySquare: 'd5',
  },
  {
    id: 'pigs-on-7th',
    title: 'Rooks on the 7th Rank',
    category: 'middlegame',
    moves: '1. Rd7 Rac8 2. Ree7',
    fen: '4r1k1/3R1ppp/8/8/8/8/1R3PPP/6K1 w - - 0 1',
    concept: 'Connected rooks on the 7th rank decimate the enemy pawn structure and trap the enemy King.',
    tacticalGoal: 'Mow down base pawns (b7, f7, g7) and create inescapable mating nets.',
    masterWinRate: '79% Winning',
    difficulty: 'Intermediate',
    featuredPiece: 'r',
    keySquare: 'd7',
  },

  // --- ENDGAME ---
  {
    id: 'lucena-bridge',
    title: 'Lucena Bridge Building',
    category: 'endgame',
    moves: '1. Rf4! Rd1 2. Re4+ Kd7 3. Kf7 Rf1+ 4. Kg6 Rg1+ 5. Kf6 Rf1+ 6. Kg5 Rg1+ 7. Rg4',
    fen: '1K1k4/1P6/8/8/5R2/8/8/3r4 w - - 0 1',
    concept: 'The essential winning technique for Rook and Pawn endgames when the pawn is on the 7th rank.',
    tacticalGoal: 'Place the rook on the 4th rank to build a protective shield (bridge) shielding the King from checks.',
    masterWinRate: '100% Theoretical Win',
    difficulty: 'Intermediate',
    featuredPiece: 'r',
    keySquare: 'f4',
  },
  {
    id: 'philidor-defense',
    title: 'Philidor 3rd Rank Defense',
    category: 'endgame',
    moves: '1... Ra6! 2. e6 Ra1! 3. Rg7+ Kf8',
    fen: '8/4R3/r3p3/4k3/8/8/8/4K3 b - - 0 1',
    concept: 'The fundamental drawing fortress against a Rook and Pawn. Cut the enemy king off until the pawn pushes.',
    tacticalGoal: 'Keep rook on 6th rank (White perspective) until pawn advances, then drop to the 1st rank to check from behind.',
    masterWinRate: '100% Theoretical Draw',
    difficulty: 'Intermediate',
    featuredPiece: 'r',
    keySquare: 'a6',
  },
];

export function getStrategiesByCategory(category: StrategyCategory): StrategyItem[] {
  if (category === 'all') return CHESS_STRATEGY_DATABASE;
  return CHESS_STRATEGY_DATABASE.filter((item) => item.category === category);
}
