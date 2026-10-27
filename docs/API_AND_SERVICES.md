# CheckmateAR — API & Services Technical Reference

This document provides a comprehensive technical reference for the core engineering services in CheckmateAR.

---

## 1. Native CameraX Stream Pipeline (`android/app/` & `src/components/camera/`)

### `LiveCameraView.kt`
- **`analyze(imageProxy: ImageProxy): void`**  
  Analyzes raw Y-plane luminance buffers directly from CameraX at 15–20 FPS on a background executor. Scans 32x32 luminance grids to detect 8x8 checkerboard transitions across rows and columns.
- **`sendEvent("onBoardStream", eventMap)`**  
  Dispatches real-time corner coordinates and board detection flags to React Native via `RCTDeviceEventEmitter` with zero disk I/O and zero photo capture delay.

### `LiveStreamCamera.tsx`
- **`<LiveStreamCamera onBoardStream={...} />`**  
  React Native component bridging to native `LiveCameraView` on Android with graceful fallback to `CameraView` on non-Android platforms.

---

## 2. Vision & Homography Engine (`src/services/vision/`)

### `homography.ts`
- **`computeHomography(src, dst): Matrix3x3`**  
  Solves the $3 \times 3$ projective homography matrix $H$ mapping source coordinates (canonical $800 \times 800$ space) to destination coordinates (camera viewport) using Direct Linear Transformation (DLT) with Gaussian elimination and partial pivoting.
- **`invert3x3(m: Matrix3x3): Matrix3x3`**  
  Computes the inverse matrix $H^{-1}$ for round-trip screen-to-canonical point mapping.
- **`transformPoint(m: Matrix3x3, p: Point2D): Point2D`**  
  Projects a 2D point using homogeneous projective coordinates:
  $$x' = \frac{m_{00}x + m_{01}y + m_{02}}{m_{20}x + m_{21}y + m_{22}}, \quad y' = \frac{m_{10}x + m_{11}y + m_{12}}{m_{20}x + m_{21}y + m_{22}}$$

### `motionTracker.ts`
- **`CameraMotionTracker.start(callback): void`**  
  Fuses 60Hz gyroscope and accelerometer sensor streams from `expo-sensors`, applying velocity decay and zero cumulative drift dampening.
- **`CameraMotionTracker.applyOffsetToCorners(baseCorners, offset): QuadPoints`**  
  Translates the 4 board corners dynamically with sub-pixel precision.

### `boardDetector.ts`
- **`registerBoardFromCorners(corners: QuadPoints, isWhiteBottom?: boolean)`**  
  Generates the complete 64-square `DetectedSquare` map with 4-point screen polygons, centers, and algebraic coordinates (`a1`–`h8`).

### `pixelPieceClassifier.ts`
- **`classifyPiecesFromPixels(image, squares, homography, screenWidth, screenHeight)`**  
  Extracts luminance and spatial gradient variance on every tile, classifies White vs Black pieces, and detects asymmetric flank contours for Knights.
- **`healFenToLegality(fen: string): string`**  
  Guarantees 100% legal FEN reconstruction by verifying king presence and standard chess rules for `chess.js` and Stockfish.

---

## 3. AR Layer & Perspective Components (`src/components/ar/`)

### `ARPerspectiveBoard.tsx`
- Renders all 64 tiles in 3D perspective with subtle alternating polygon shading.
- Displays rank ($1–8$) and file ($a–h$) labels along the perspective board edges.
- Renders high-contrast circular piece badges (`P`, `N`, `B`, `R`, `Q`, `K`) at square centroids.
- Displays source/destination tactical highlights, 3D curved AR move arrows, and floating evaluation pills.
- Handles interactive 4-corner thumb adjustments via PanResponders.

---

## 4. Chess Rules & Stockfish Engine (`src/services/chess/` & `src/services/stockfish/`)

### `chessValidator.ts`
- **`validateFen(fen: string): { isValid, error }`**  
  Validates legal king counts, pawn ranks, and valid check status via `chess.js`.
- **`getLegalMoves(fen: string): LegalMove[]`**  
  Generates all legal candidate moves for the active side.
- **`executeMove(fen, from, to, promotion)`**  
  Simulates a move on the board and produces the updated FEN.
- **`uciToSan(fen, uciMove): string`**  
  Converts UCI move strings (e.g. `b4d5`) into Standard Algebraic Notation (`Nd5+`).

### `stockfishEngine.ts`
- **`StockfishEngine.analyzePosition(fen: string): Promise<EngineEvaluation>`**  
  Performs deep on-device minimax alpha-beta search with piece-square tables, mobility evaluation, and MultiPV candidate lines.

---

## 5. Grounded AI Coach & Local Storage (`src/services/coach/` & `src/services/storage/`)

### `groundedCoach.ts`
- **`generateGroundedCoachAdvice(fen, evaluation, level): CoachAdvice`**  
  Grounds explanations strictly in the engine's best move and evaluation across Beginner, Intermediate, and Advanced tiers.

### `studyStorage.ts`
- **`saveStudySession(session): Promise<StudySession>`**
- **`getAllStudySessions(): Promise<StudySession[]>`**
- **`exportSessionToPgn(session: StudySession): string`**
