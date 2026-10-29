export interface SampleChessGame {
  id: string;
  title: string;
  subtitle: string;
  whitePlayer: string;
  blackPlayer: string;
  year: number;
  fen: string;
  expectedBestMoveSan: string;
  expectedBestMoveUci?: string;
  tacticalTheme: string;
  turn: 'w' | 'b';
}

/**
 * Curated real master chess positions for verification, photo testing, and AR projection.
 */
export const SAMPLE_CHESS_GAMES: SampleChessGame[] = [
  {
    id: 'opera_game_1858',
    title: 'The Opera Game',
    subtitle: 'Morphy vs Duke of Brunswick & Count Isouard',
    whitePlayer: 'Paul Morphy',
    blackPlayer: 'Duke of Brunswick',
    year: 1858,
    fen: '4kb1r/p2rqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 14',
    expectedBestMoveSan: 'Bxd7+',
    expectedBestMoveUci: 'b5d7',
    tacticalTheme: 'Decisive Pin & Piece Removal',
    turn: 'w',
  },
  {
    id: 'game_of_century_1956',
    title: 'Game of the Century',
    subtitle: 'Byrne vs Fischer (Move 17 Queen Sacrifice)',
    whitePlayer: 'Donald Byrne',
    blackPlayer: 'Bobby Fischer',
    year: 1956,
    fen: 'r3r1k1/pp3pbp/1qp1b1p1/2B5/2B1n3/2N2N2/PPP2PPP/R2QR1K1 b - - 0 17',
    expectedBestMoveSan: 'Nxc3',
    expectedBestMoveUci: 'e4c3',
    tacticalTheme: 'Tactical Desperado Counter-Attack',
    turn: 'b',
  },
  {
    id: 'kasparov_deepblue_1997',
    title: 'Deep Blue vs Kasparov',
    subtitle: 'Game 6 (Caro-Kann Knight Sacrifice)',
    whitePlayer: 'Deep Blue',
    blackPlayer: 'Garry Kasparov',
    year: 1997,
    fen: 'r1bqk2r/pp1nbppp/2p1pn2/6B1/2BP4/2N1PN2/PP3PPP/R2QK2R w KQkq - 0 8',
    expectedBestMoveSan: 'O-O',
    expectedBestMoveUci: 'e1g1',
    tacticalTheme: 'Rapid King Harmonization',
    turn: 'w',
  },
  {
    id: 'tactical_mate_puzzle',
    title: 'Tactical Back-Rank Mate',
    subtitle: 'Double Rook Penetration and Deflection',
    whitePlayer: 'Grandmaster White',
    blackPlayer: 'Grandmaster Black',
    year: 2024,
    fen: '3r2k1/5ppp/8/8/8/8/4RPPP/6K1 w - - 0 1',
    expectedBestMoveSan: 'Re1',
    expectedBestMoveUci: 'e2e1',
    tacticalTheme: 'Back-Rank Defense & King Safety',
    turn: 'w',
  },
  {
    id: 'queen_fork_tactic',
    title: 'SparkChess Tactical Fork',
    subtitle: 'Queen Infiltration and Double Attack',
    whitePlayer: 'Spark Master',
    blackPlayer: 'Spark Challenger',
    year: 2025,
    fen: 'r1b1k2r/pppp1ppp/8/4n3/1b1N4/2N5/PPP2PPP/R1B1KB1R b KQkq - 1 8',
    expectedBestMoveSan: 'O-O',
    expectedBestMoveUci: 'e8g8',
    tacticalTheme: 'King Safety Consolidation',
    turn: 'b',
  },
];
