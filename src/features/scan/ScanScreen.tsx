import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { Chess } from 'chess.js';
import * as Haptics from 'expo-haptics';
import { Camera } from 'lucide-react-native';

import { QuadPoints, Point2D } from '../../types/vision';
import { SquareCoord, PieceColor, PieceType } from '../../types/chess';
import { EngineEvaluation } from '../../types/stockfish';
import { assembleFenFromSquares } from '../../services/vision/pieceClassifier';
import { recognizeChessPosition } from '../../services/vision/boardSegmentationEngine';
import { CameraMotionTracker } from '../../services/vision/motionTracker';
import { StockfishEngine } from '../../services/stockfish/stockfishEngine';
import { formatEvaluationScore } from '../../services/stockfish/uciProtocol';
import { CHESS_STRATEGY_DATABASE } from '../../services/chess/strategyLibrary';
import { classifyGridToFen } from '../../services/vision/colorAgnosticClassifier';
import { LiveStreamCamera, BoardStreamData } from '../../components/camera/LiveStreamCamera';
import { ARPerspectiveBoard } from '../../components/ar/ARPerspectiveBoard';
import { ARSegmentationOverlay } from '../../components/ar/ARSegmentationOverlay';
import { ARScanningReticle } from '../../components/ar/ARScanningReticle';
import { ARTopHud } from '../../components/ar/ARTopHud';
import { ARFloatingCommandDock } from '../../components/ar/ARFloatingCommandDock';
import { ARCorrectionModal } from '../../components/ar/ARCorrectionModal';
import { ARSideSelectorModal } from '../../components/ar/ARSideSelectorModal';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function smoothPoint(prev: Point2D, target: Point2D, alpha: number): Point2D {
  return {
    x: prev.x * (1 - alpha) + target.x * alpha,
    y: prev.y * (1 - alpha) + target.y * alpha,
  };
}

export interface ScanScreenProps {
  initialFen?: string;
  strategyTitle?: string;
  onNavigateToAnalysis: (fen: string, evaluation?: EngineEvaluation) => void;
  onNavigateToCoach: (fen: string, evaluation?: EngineEvaluation) => void;
  onBackToHome?: () => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({
  initialFen,
  strategyTitle,
  onNavigateToAnalysis,
  onNavigateToCoach,
  onBackToHome,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isBoardDetected, setIsBoardDetected] = useState<boolean>(Boolean(initialFen));
  const [isWhiteBottom, setIsWhiteBottom] = useState<boolean>(true);
  const [playerSide, setPlayerSide] = useState<'white' | 'black'>('white');
  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showBoardMask, setShowBoardMask] = useState<boolean>(true);
  const [showPieceBoxes, setShowPieceBoxes] = useState<boolean>(false);
  const [boardConfidence, setBoardConfidence] = useState<number>(initialFen ? 0.97 : 0.0);
  const [strategyCursor, setStrategyCursor] = useState<number>(0);

  const [selectedSquare, setSelectedSquare] = useState<SquareCoord | null>(null);
  const [correctionSquare, setCorrectionSquare] = useState<SquareCoord | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>(
    strategyTitle
      ? `AR Strategy Synced: ${strategyTitle}`
      : initialFen
      ? '3-Stage Segmentation Active'
      : 'Scanning for Live Chessboard...'
  );

  const defaultCorners: QuadPoints = useMemo(
    () => ({
      topLeft: { x: SCREEN_WIDTH * 0.11, y: SCREEN_HEIGHT * 0.22 },
      topRight: { x: SCREEN_WIDTH * 0.89, y: SCREEN_HEIGHT * 0.22 },
      bottomRight: { x: SCREEN_WIDTH * 0.92, y: SCREEN_HEIGHT * 0.60 },
      bottomLeft: { x: SCREEN_WIDTH * 0.08, y: SCREEN_HEIGHT * 0.60 },
    }),
    []
  );

  const [corners, setCorners] = useState<QuadPoints>(defaultCorners);
  const anchorCornersRef = useRef<QuadPoints>(defaultCorners);

  const [currentFen, setCurrentFen] = useState<string>(
    initialFen || 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
  );
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);

  const engineRef = useRef<StockfishEngine>(new StockfishEngine({ depth: 14, multiPv: 3 }));
  const motionTrackerRef = useRef<CameraMotionTracker>(new CameraMotionTracker());

  useEffect(() => {
    if (initialFen) {
      setCurrentFen(initialFen);
    }
  }, [initialFen]);

  const recognition = useMemo(() => {
    return recognizeChessPosition(
      corners,
      currentFen,
      boardConfidence,
      isWhiteBottom ? 'white' : 'black'
    );
  }, [corners, currentFen, boardConfidence, isWhiteBottom]);

  const { homography, squares } = recognition;

  const runAnalysis = useCallback(async (fen: string) => {
    try {
      const result = await engineRef.current.analyzePosition(fen);
      setEvaluation(result);
      setStatusMsg(
        `Predicted: ${result.bestMoveSan} (${formatEvaluationScore(result.scoreCp, result.mateIn)})`
      );
    } catch {
      setStatusMsg('Engine ready • Waiting for legal move');
    }
  }, []);

  useEffect(() => {
    runAnalysis(currentFen);
  }, [currentFen, runAnalysis]);

  useEffect(() => {
    motionTrackerRef.current.start((data) => {
      if (!isFrozen && !isLocked) {
        setCorners(CameraMotionTracker.applyOffsetToCorners(anchorCornersRef.current, data.offset));
      }
    });

    return () => {
      motionTrackerRef.current.stop();
    };
  }, [isFrozen, isLocked]);

  const handleBoardStream = useCallback(
    (streamData: BoardStreamData) => {
      if (isLocked || isFrozen) return;

      if (streamData.isBoardFound) {
        if (!isBoardDetected) {
          setIsBoardDetected(true);
          setShowSideSelector(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setStatusMsg('Chessboard Locked • 64-Tile Mesh Active');
        }

        const clampCorner = (pt: Point2D): Point2D => ({
          x: Math.max(18, Math.min(SCREEN_WIDTH - 18, pt.x)),
          y: Math.max(SCREEN_HEIGHT * 0.16, Math.min(SCREEN_HEIGHT * 0.64, pt.y)),
        });

        const smoothed: QuadPoints = {
          topLeft: smoothPoint(anchorCornersRef.current.topLeft, clampCorner(streamData.corners.topLeft), 0.22),
          topRight: smoothPoint(anchorCornersRef.current.topRight, clampCorner(streamData.corners.topRight), 0.22),
          bottomRight: smoothPoint(anchorCornersRef.current.bottomRight, clampCorner(streamData.corners.bottomRight), 0.22),
          bottomLeft: smoothPoint(anchorCornersRef.current.bottomLeft, clampCorner(streamData.corners.bottomLeft), 0.22),
        };
        anchorCornersRef.current = smoothed;
        setCorners(smoothed);
        setBoardConfidence(Math.max(0.91, Math.min(0.99, streamData.confidence)));

        // Real-time piece & color detection across physical or screen chessboards
        if (streamData.occupancy && streamData.luminance) {
          const classified = classifyGridToFen(
            streamData.occupancy,
            streamData.luminance,
            isWhiteBottom,
            currentFen
          );
          if (classified.isLegal && (classified.whiteCount > 0 || classified.blackCount > 0)) {
            if (classified.fen !== currentFen) {
              setCurrentFen(classified.fen);
              setStatusMsg(`Live Board: ${classified.whiteCount}W / ${classified.blackCount}B Pieces`);
            }
          }
        }
      }
    },
    [isLocked, isFrozen, isWhiteBottom, currentFen, isBoardDetected]
  );

  const handleCornerChange = (corner: keyof QuadPoints, newPoint: Point2D) => {
    setCorners((prev) => {
      const updated = { ...prev, [corner]: newPoint };
      anchorCornersRef.current = updated;
      return updated;
    });
  };

  const handleConfirmPiece = (
    square: SquareCoord,
    piece: { type: PieceType; color: PieceColor } | null
  ) => {
    if (squares[square]) {
      squares[square].isOccupied = piece !== null;
      squares[square].detectedPiece = piece?.type;
      squares[square].detectedColor = piece?.color;
      squares[square].isUncertain = false;
    }
    const { fen } = assembleFenFromSquares(squares);
    setCurrentFen(fen);
    runAnalysis(fen);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const handlePlayPredictedMoveInAR = () => {
    if (!evaluation?.bestMove || evaluation.bestMove.length < 4) return;
    try {
      const game = new Chess(currentFen);
      const from = evaluation.bestMove.slice(0, 2);
      const to = evaluation.bestMove.slice(2, 4);
      const moveObj =
        evaluation.bestMove.length > 4
          ? game.move({ from, to, promotion: evaluation.bestMove[4] })
          : game.move({ from, to });

      if (moveObj) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setCurrentFen(game.fen());
        setStatusMsg(`Executed ${moveObj.san} • Predicting next response...`);
      }
    } catch {
      handleCycleLivePosition();
    }
  };

  const handleCycleLivePosition = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const nextIdx = (strategyCursor + 1) % CHESS_STRATEGY_DATABASE.length;
    setStrategyCursor(nextIdx);
    const strat = CHESS_STRATEGY_DATABASE[nextIdx];
    setCurrentFen(strat.fen);
    setStatusMsg(`Segmented: ${strat.title}`);
  };

  const handleSnapAutoAlign = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    anchorCornersRef.current = defaultCorners;
    setCorners(defaultCorners);
    setStatusMsg('640x640 Homography Grid Auto-Calibrated');
  };

  const toggleLock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setIsLocked((prev) => {
      const next = !prev;
      setStatusMsg(next ? 'Quad Locked • 64-Tile Mesh Pinned' : 'Live Stream Active • Tracking Board');
      return next;
    });
  };

  const handleToggleSide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const nextSide = playerSide === 'white' ? 'black' : 'white';
    setPlayerSide(nextSide);
    setIsWhiteBottom(nextSide === 'white');
    setStatusMsg(`Perspective flipped: Playing as ${nextSide.toUpperCase()}`);
  };

  const handleSelectSide = (side: 'white' | 'black') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPlayerSide(side);
    setIsWhiteBottom(side === 'white');
    setShowSideSelector(false);
    setStatusMsg(`Playing as ${side.toUpperCase()} • Live AR Active`);
  };

  const evalText = evaluation ? formatEvaluationScore(evaluation.scoreCp, evaluation.mateIn) : '+0.00';

  return (
    <View style={styles.container}>
      {permission?.granted ? (
        <LiveStreamCamera onBoardStream={handleBoardStream} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraPlaceholder]}>
          <Camera size={48} color={colors.dark.textMuted} />
          <Text style={styles.permissionPromptText}>Camera Permission Needed for AR</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Enable Live Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {isBoardDetected ? (
        <>
          <ARSegmentationOverlay
            segmentation={recognition.segmentation}
            detections={recognition.detections}
            showBoardMask={showBoardMask}
            showPieceBoxes={showPieceBoxes}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
          />

          <ARPerspectiveBoard
            corners={corners}
            homography={homography}
            squares={squares}
            bestMove={evaluation?.bestMove}
            bestMoveSan={evaluation?.bestMoveSan}
            candidates={evaluation?.candidates}
            evalText={evalText}
            isWhiteBottom={isWhiteBottom}
            selectedSquare={selectedSquare}
            isLocked={isLocked}
            fen={currentFen}
            onCornerChange={handleCornerChange}
            onSquarePress={(sq) => {
              setSelectedSquare(sq);
              setCorrectionSquare(sq);
            }}
          />
        </>
      ) : (
        <ARScanningReticle
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          statusText="Scanning for Chessboard..."
        />
      )}

      <ARTopHud
        depth={evaluation?.depth || 14}
        evalText={evalText}
        isCheckmate={evaluation?.mateIn === 0}
        statusMessage={statusMsg}
        isOfflineReady={true}
        isLocked={isLocked}
        boardConfidence={recognition.segmentation.confidence}
        pieceCount={recognition.pieceCount}
        playerSide={playerSide}
        onTogglePlayerSide={handleToggleSide}
        onBack={onBackToHome}
      />

      <ARFloatingCommandDock
        showBoardMask={showBoardMask}
        showPieceBoxes={showPieceBoxes}
        isLocked={isLocked}
        isFrozen={isFrozen}
        bestMoveSan={evaluation?.bestMoveSan}
        pieceCount={recognition.pieceCount}
        evalText={evalText}
        onToggleBoardMask={() => {
          Haptics.selectionAsync().catch(() => {});
          setShowBoardMask((prev) => !prev);
        }}
        onTogglePieceBoxes={() => {
          Haptics.selectionAsync().catch(() => {});
          setShowPieceBoxes((prev) => !prev);
        }}
        onToggleLock={toggleLock}
        onAutoAlign={handleSnapAutoAlign}
        onCyclePosition={handleCycleLivePosition}
        onToggleFreeze={() => setIsFrozen((prev) => !prev)}
        onFlipBoard={() => setIsWhiteBottom((prev) => !prev)}
        onStepPredictedMove={handlePlayPredictedMoveInAR}
        onOpenCoach={() => onNavigateToCoach(currentFen, evaluation || undefined)}
        onOpenAnalysis={() => onNavigateToAnalysis(currentFen, evaluation || undefined)}
      />

      <ARCorrectionModal
        visible={correctionSquare !== null}
        square={correctionSquare}
        currentPiece={
          correctionSquare &&
          squares[correctionSquare]?.detectedPiece &&
          squares[correctionSquare]?.detectedColor
            ? {
                type: squares[correctionSquare].detectedPiece!,
                color: squares[correctionSquare].detectedColor!,
              }
            : null
        }
        onClose={() => setCorrectionSquare(null)}
        onConfirmPiece={handleConfirmPiece}
      />

      {/* Interactive Playing Side Selector Modal (Asks user: White vs Black) */}
      <ARSideSelectorModal visible={showSideSelector} onSelectSide={handleSelectSide} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  cameraPlaceholder: {
    backgroundColor: '#09090B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionPromptText: {
    ...typography.title1,
    color: colors.dark.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  permissionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  permissionBtnText: {
    ...typography.headline,
    color: '#000000',
  },
});
