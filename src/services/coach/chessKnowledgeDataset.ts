export interface OpeningKnowledge {
  name: string;
  eco: string;
  moves: string;
  philosophy: string;
  keyPlansWhite: string;
  keyPlansBlack: string;
  trapsOrTactics: string;
}

export interface TacticalMotifKnowledge {
  name: string;
  definition: string;
  howToExecute: string;
  howToDefend: string;
  famousExample: string;
}

export interface StrategicConcept {
  name: string;
  principle: string;
  actionableAdvice: string;
}

export interface EndgameConcept {
  name: string;
  principle: string;
  technique: string;
}

export const CHESS_GREETINGS = [
  "Greetings, Grandmaster in training! I'm your Gemma AI Chess Coach. What position or tactical question shall we analyze today?",
  "Hello! Ready to sharpen your tactical vision and strategic mastery. Ask me anything about the board, openings, or grandmaster plans.",
  "Welcome back to the board! Whether you need to decode an engine evaluation or study deep positional ideas, I'm here to help.",
  "Hey there! Let's examine the active position or dive into opening theory and endgame calculations.",
];

export const COACH_IDENTITY_RESPONSES = [
  "I am CheckmateAR's Gemma AI Chess Coach, powered by spatial vision and grandmaster game theory. I combine real-time Stockfish calculations with deep tactical knowledge to explain why moves are played and how to formulate winning plans.",
  "Think of me as your personal Grandmaster mentor in your pocket. I analyze your board, detect tactical opportunities (pins, forks, skewers), and break down deep engine evaluations into clear, human-understandable concepts.",
];

export const IMPROVEMENT_TIPS = [
  "To level up your rating quickly:\n1. **Tactics First**: Solve 15-20 minutes of tactical puzzles daily (focusing on pins, forks, and double attacks).\n2. **Blunder Checks**: Before every move, ask: 'What is my opponent threatening? What did their last move leave undefended?'\n3. **Active Pieces**: Every piece should have a job. Avoid moving the same piece multiple times in the opening unless forced.\n4. **King Safety**: Castle early, usually before move 10.",
  "The secret to chess mastery lies in piece coordination and tactical sharpness. Strive to place your rooks on open files, post your knights on central outposts where enemy pawns cannot kick them, and keep your king tucked behind an intact pawn shield.",
];

export const OPENINGS_DATASET: OpeningKnowledge[] = [
  {
    name: 'Sicilian Defense',
    eco: 'B20-B99',
    moves: '1. e4 c5',
    philosophy: 'Black fights for the center from the flank, creating an asymmetrical struggle with high winning chances.',
    keyPlansWhite: 'Open lines with d4, exploit spatial advantage on the kingside, and castle quickly.',
    keyPlansBlack: 'Pressure the c-file, utilize queenside minority attacks, and dominate the d4 outpost.',
    trapsOrTactics: 'Watch for the d5 break, Sicilian sacrifices on e6 or b5, and rook lifts along the c-file.',
  },
  {
    name: 'Ruy Lopez (Spanish Opening)',
    eco: 'C60-C99',
    moves: '1. e4 e5 2. Nf3 Nc6 3. Bb5',
    philosophy: 'White pressures the defender of e5, initiating classical pawn tension and long-term positional maneuvering.',
    keyPlansWhite: 'Maintain central pawn bind with c3 and d4, maneuver the b1-knight to f1 and g3.',
    keyPlansBlack: 'Solidify e5, expand with ...a6 and ...b5, or enter the solid Berlin Defense (3...Nf6).',
    trapsOrTactics: 'The Noah\'s Ark trap, Marshall Attack rook sacrifices, and d5 pawn breaks.',
  },
  {
    name: "Queen's Gambit",
    eco: 'D06-D69',
    moves: '1. d4 d5 2. c4',
    philosophy: 'White temporarily offers a flank c-pawn to gain dominance over the center squares d4 and e4.',
    keyPlansWhite: 'Establish central pawn majority, apply pressure on the c-file, and pin Black\'s knight on f6.',
    keyPlansBlack: 'Declined (2...e6) solidifies the center; Accepted (2...dxc4) strikes back with ...c5 or ...e5.',
    trapsOrTactics: 'Elephant Trap in the QGD, Rubinstein pawn sacrifices, and minority attack on the queenside.',
  },
  {
    name: 'French Defense',
    eco: 'C00-C19',
    moves: '1. e4 e6 2. d4 d5',
    philosophy: 'Black builds an ultra-resilient pawn chain (c7-d5-e6) while targeting White\'s d4 base with ...c5.',
    keyPlansWhite: 'Lock the center with e5 (Advance) and attack Black\'s kingside; or play Nc3 (Winawer/Classical).',
    keyPlansBlack: 'Undermine White\'s pawn wedge with ...c5 and ...f6, and liberate the light-squared bishop via ...b6 or ...Bd7.',
    trapsOrTactics: 'Greek Gift sacrifice (Bxh7+) if Black neglects kingside defense; Winawer pins on c3.',
  },
  {
    name: 'Caro-Kann Defense',
    eco: 'B10-B19',
    moves: '1. e4 c6 2. d4 d5',
    philosophy: 'Black supports ...d5 with the c-pawn while keeping the light-squared bishop active outside the pawn chain.',
    keyPlansWhite: 'Push e5 for space, or enter the open Classical line (3. Nc3 dxe4 4. Nxe4 Bf5).',
    keyPlansBlack: 'Exchange on e4 or advance, plant a knight on f5/d5, and enjoy a healthy pawn structure.',
    trapsOrTactics: 'Panov-Botvinnik attack with isolated d4-pawn, and tactical knight hops to e6.',
  },
  {
    name: "King's Indian Defense",
    eco: 'E60-E99',
    moves: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7',
    philosophy: 'Hypermodern defense: Black allows White to occupy the center, then counter-attacks violently with ...e5 and ...f5.',
    keyPlansWhite: 'Expand on the queenside with c5 and b4, opening the c-file for rooks.',
    keyPlansBlack: 'Lock the center with ...e5-d4-d5 and launch an all-out kingside pawn storm (...f5, ...g5, ...f4).',
    trapsOrTactics: 'Mar del Plata mating attacks, knight sacrifices on f4, and queenside pawn breakthroughs.',
  },
  {
    name: 'Italian Game (Giuoco Piano)',
    eco: 'C50-C54',
    moves: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5',
    philosophy: 'White targets Black\'s vulnerable f7 square while developing pieces rapidly and harmoniously.',
    keyPlansWhite: 'Build a central presence with c3 and d4, or play the quiet Giuoco Pianissimo with d3.',
    keyPlansBlack: 'Match White\'s development with ...Nf6 and ...d6, safeguarding the king with early kingside castling.',
    trapsOrTactics: 'Fried Liver Attack (4. Ng5), Evans Gambit pawn sacrifice (4. b4), and center forks.',
  },
];

export const TACTICAL_MOTIFS_DATASET: TacticalMotifKnowledge[] = [
  {
    name: 'Knight Fork',
    definition: 'A single knight moves to a square where it simultaneously attacks two or more enemy pieces.',
    howToExecute: 'Look for enemy king and queen (or rooks) occupying the same color squares separated by knight jumps.',
    howToDefend: 'Cover the critical jumping square with a pawn or piece, or check White first (Zwischenzug).',
    famousExample: 'Royal Fork (King and Queen attacked simultaneously).',
  },
  {
    name: 'Absolute Pin',
    definition: 'A piece is pinned against the King; it cannot legally move because moving it would expose the King to check.',
    howToExecute: 'Align your bishop, rook, or queen along the file, rank, or diagonal connecting the target piece to the King.',
    howToDefend: 'Step the King off the pin line, or insert a defending piece between the pin and the King.',
    famousExample: 'Morphy\'s pinned bishop and knight in the Opera Game on d7.',
  },
  {
    name: 'Skewer',
    definition: 'An attack on a high-value piece (e.g. King or Queen) that forces it to move, exposing a lesser piece behind it.',
    howToExecute: 'Line up your rook, bishop, or queen against two opposing pieces on the same ray.',
    howToDefend: 'Move the front piece with check or with an attack on the opponent\'s queen.',
    famousExample: 'Rook skewers along the 8th rank winning an unprotected rook.',
  },
  {
    name: 'Discovered Attack',
    definition: 'Moving one piece unmasks an attack from a friendly piece standing behind it.',
    howToExecute: 'Place a bishop or rook behind a knight or pawn aimed at an enemy high-value target.',
    howToDefend: 'Anticipate the battery; avoid leaving pieces on the same lines as enemy long-range pieces.',
    famousExample: 'Torre vs Lasker, 1925 (The famous Windmill combination).',
  },
  {
    name: 'Deflection',
    definition: 'A tactical move that forces an enemy defending piece away from protecting a critical square or piece.',
    howToExecute: 'Sacrifice a piece on a square the defender must capture, abandoning its primary post.',
    howToDefend: 'Calculate whether the sacrifice can be declined or met with an in-between check.',
    famousExample: 'Adams vs Torre, 1920 (Multiple queen deflections on the back rank).',
  },
  {
    name: 'Smothered Mate',
    definition: 'A checkmate delivered by a knight to a King completely boxed in by its own friendly pieces.',
    howToExecute: 'Use a queen sacrifice on g8/g1 to force an enemy rook to block the King, then deliver Nd7# or Nf7#.',
    howToDefend: 'Ensure the King has an escape flight square (luft) such as h7 or h2.',
    famousExample: 'Philidor\'s Legacy combination.',
  },
];

export const STRATEGIC_CONCEPTS_DATASET: StrategicConcept[] = [
  {
    name: 'Control of the Center',
    principle: 'The center squares (e4, d4, e5, d5) dictate board geometry. Pieces posted in or influencing the center control far more squares.',
    actionableAdvice: 'Use central pawns to establish territory, and avoid premature flank adventures when the center is fluid.',
  },
  {
    name: 'Knight Outposts',
    principle: 'A knight outpost is a central square on the 4th, 5th, or 6th rank that cannot be attacked by enemy pawns.',
    actionableAdvice: 'Target squares like d5 or e5 that enemy pawns have passed by. Anchor your knight with a supporting pawn.',
  },
  {
    name: 'Rook on the 7th Rank',
    principle: 'Placing a rook on the opponent\'s second rank (7th for White, 2nd for Black) ties down the enemy king and devours unadvanced pawns.',
    actionableAdvice: 'Double rooks on an open file and infiltrate to the 7th rank to create decisive mating nets.',
  },
  {
    name: 'Pawn Structure & Weaknesses',
    principle: 'Pawns can never move backward. Every pawn advance creates permanent square weaknesses in its wake.',
    actionableAdvice: 'Do not push pawns in front of your castled King unless absolutely necessary. Fix enemy backward and isolated pawns as targets.',
  },
];

export const ENDGAME_CONCEPTS_DATASET: EndgameConcept[] = [
  {
    name: 'Opposition',
    principle: 'When kings face each other with one square between them, the player NOT having to move holds the opposition.',
    technique: 'Step your king directly opposite the enemy king to force them to give way, opening the path for your pawn.',
  },
  {
    name: 'Lucena Position (Building a Bridge)',
    principle: 'The winning method in rook-and-pawn vs rook endgames when your pawn is on the 7th rank.',
    technique: 'Check the enemy king away with your rook, place your rook on the 4th rank, step your king out, and use the rook to block checks.',
  },
  {
    name: 'Philidor Defense',
    principle: 'The fundamental drawing technique for the defending side in rook endgames.',
    technique: 'Keep your rook on the 3rd (or 6th) rank to prevent the enemy king from advancing until the pawn pushes, then swing to the back rank for checks.',
  },
  {
    name: 'Rule of the Square',
    principle: 'Determines whether a defending king can catch an unassisted passed pawn without calculating moves.',
    technique: 'Draw a square from the pawn to its promotion tile. If the defending king is inside or can step into the square, it catches the pawn.',
  },
];
