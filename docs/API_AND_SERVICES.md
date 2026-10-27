# CheckmateAR — API & Services Technical Reference

This document provides a comprehensive technical reference for the core engineering services in CheckmateAR.

---

## 1. Vision & Homography Engine (`src/services/vision/`)

### `homography.ts`
- **`computeHomography(src, dst): Matrix3x3`**  
  Solves the $3 \times 3$ projective homography matrix $H$ mapping source coordinates (canonical $800 \times 800$ space) to destination coordinates (camera viewport) using Direct Linear Transformation (DLT) with Gaussian elimination and partial pivoting.
- **`invert3x3(m: Matrix3x3): Matrix3x3`**  
  Computes the inverse matrix $H^{-1}$ for round-trip screen-to-canonical point mapping.
- **`transformPoint(m: Matrix3x3, p: Point2D): Point2D`**  
  Projects a 2D point using homogeneous projective coordinates:
  $$x' = \frac{m_{00}x + m_{01}y + m_{02}}{m_{20}x + m_{21}y + m_{22}}, \quad y' = \frac{m_{10}x + m_{11}y + m_{12}}{m_{20}x + m_{21}y + m_{22}}$$

### `boardDetector.ts`
- **`registerBoardFromCorners(corners: QuadPoints, isWhiteBottom?: boolean)`**  
  Generates the complete 64-square `DetectedSquare` map with 4-point screen polygons, centers, and algebraic coordinates (`a1`–`h8`).
- **`getSquareCoord(fileIdx, rankIdx, isWhiteBottom)`**  
  Maps canonical indices to algebraic chess notation with orientation support.

### `pieceClassifier.ts`
- **`classifyOccupancy(features, tileIsDark): { isOccupied, confidence }`**  
  Evaluates square texture gradient variance and height profile against checkerboard baseline.
- **`classifyPieceColor(features): { color: 'w' | 'b', confidence }`**  
  Classifies piece color using luminance thresholding ($L^* > 140 \to$ White, $L^* < 140 \to$ Black).
- **`classifyPieceType(features, square, color): { type: PieceType, confidence }`**  
  Distinguishes pieces via contour asymmetry (Knight), height ratios (King/Queen vs Pawns), and top crown width.
- **`assembleFenFromSquares(squares, turn, castling, enPassant)`**  
  Compiles the 64 classified squares into a valid Forsyth-Edwards Notation (FEN) string.

### `moveDifferenceTracker.ts`
- **`MoveDifferenceTracker.processFrame(currentSquares): PhysicalMoveCandidate | null`**  
  Maintains temporal state over consecutive camera frames. Confirms a move when exactly one square is vacated ($S_{\text{from}}$) and one is occupied/captured ($S_{\text{to}}$) across stable debounced frames.

---

## 2. Chess Rules & Stockfish Engine (`src/services/chess/` & `src/services/stockfish/`)

### `chessValidator.ts`
- **`validateFen(fen: string): { isValid, error }`**  
  Validates legal king counts, pawn ranks, and valid check status via `chess.js`.
- **`getLegalMoves(fen: string): LegalMove[]`**  
  Generates all legal candidate moves for the active side.
- **`executeMove(fen, from, to, promotion)`**  
  Simulates a move on the board and produces the updated FEN.
- **`uciToSan(fen, uciMove): string`**  
  Converts UCI move strings (e.g. `g8f6`) into Standard Algebraic Notation (`Nf6`).

### `stockfishEngine.ts`
- **`StockfishEngine.analyzePosition(fen: string): Promise<EngineEvaluation>`**  
  Performs deep on-device minimax alpha-beta search with piece-square tables, mobility evaluation, and MultiPV candidate lines.
- **`StockfishEngine.stop(): void`**  
  Safely aborts active search when a new camera frame or move occurs.

---

## 3. Grounded AI Coach (`src/services/coach/`)

### `groundedCoach.ts`
- **`generateGroundedCoachAdvice(fen, evaluation, level): CoachAdvice`**  
  Grounds explanations strictly in the engine's best move and evaluation. Detects tactical motifs (Knight Fork, Pin, Skewer, Center Control, King Safety) and customizes explanation depth for Beginner, Intermediate, and Advanced players.

---

## 4. Local Storage & Serialization (`src/services/storage/`)

### `studyStorage.ts`
- **`saveStudySession(session): Promise<StudySession>`**
- **`getAllStudySessions(): Promise<StudySession[]>`**
- **`deleteStudySession(id: string): Promise<void>`**
- **`clearAllStudySessions(): Promise<void>`**
- **`exportSessionToPgn(session: StudySession): string`**  
  Exports saved position and evaluation history into standard PGN format.
