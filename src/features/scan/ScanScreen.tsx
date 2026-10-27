import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Camera, RotateCcw, Brain, Pause, Play, Scan, Lock, Unlock, Sparkles } from 'lucide-react-native';

import { QuadPoints, DetectedSquare, Point2D } from '../../types/vision';
import { SquareCoord, PieceColor, PieceType } from '../../types/chess';
import { EngineEvaluation } from '../../types/stockfish';
import { registerBoardFromCorners } from '../../services/vision/boardDetector';
import { assembleFenFromSquares } from '../../services/vision/pieceClassifier';
import { decodeBase64Jpeg } from '../../services/vision/pixelDecoder';
import { detectBoardCornersFromPixels } from '../../services/vision/autoBoardDetector';
import { classifyPiecesFromPixels } from '../../services/vision/pixelPieceClassifier';
import { CameraMotionTracker } from '../../services/vision/motionTracker';
import { StockfishEngine } from '../../services/stockfish/stockfishEngine';
import { formatEvaluationScore } from '../../services/stockfish/uciProtocol';
import { ARPerspectiveBoard } from '../../components/ar/ARPerspectiveBoard';
import { ARTopHud } from '../../components/ar/ARTopHud';
import { ARCorrectionModal } from '../../components/ar/ARCorrectionModal';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScanScreenProps {
  onNavigateToAnalysis: (fen: string, evaluation?: EngineEvaluation) => void;
  onNavigateToCoach: (fen: string, evaluation?: EngineEvaluation) => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({
  onNavigateToAnalysis,
  onNavigateToCoach,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isWhiteBottom, setIsWhiteBottom] = useState<boolean>(true);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedSquare, setSelectedSquare] = useState<SquareCoord | null>(null);
  const [correctionSquare, setCorrectionSquare] = useState<SquareCoord | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('Live Camera Tracking Active');

  const initialCorners: QuadPoints = {
    topLeft: { x: SCREEN_WIDTH * 0.10, y: SCREEN_HEIGHT * 0.30 },
    topRight: { x: SCREEN_WIDTH * 0.90, y: SCREEN_HEIGHT * 0.30 },
    bottomRight: { x: SCREEN_WIDTH * 0.92, y: SCREEN_HEIGHT * 0.72 },
    bottomLeft: { x: SCREEN_WIDTH * 0.08, y: SCREEN_HEIGHT * 0.72 },
  };

  const [corners, setCorners] = useState<QuadPoints>(initialCorners);
  const anchorCornersRef = useRef<QuadPoints>(initialCorners);
  const hasSettledScannedRef = useRef<boolean>(false);

  const [currentFen, setCurrentFen] = useState<string>(
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
  );
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);

  const cameraRef = useRef<any>(null);
  const engineRef = useRef<StockfishEngine>(new StockfishEngine({ depth: 14, multiPv: 3 }));
  const motionTrackerRef = useRef<CameraMotionTracker>(new CameraMotionTracker());

  // Homography and squares derived from corners
  const { homography, squares } = React.useMemo(() => {
    return registerBoardFromCorners(corners, isWhiteBottom);
  }, [corners, isWhiteBottom]);

  // Run Stockfish engine on FEN
  const runAnalysis = useCallback(async (fen: string) => {
    try {
      setStatusMsg('Analyzing position with Stockfish...');
      const result = await engineRef.current.analyzePosition(fen);
      setEvaluation(result);
      setStatusMsg(`Best: ${result.bestMoveSan} (${formatEvaluationScore(result.scoreCp, result.mateIn)})`);
    } catch {
      setStatusMsg('Analysis paused');
    }
  }, []);

  useEffect(() => {
    runAnalysis(currentFen);
  }, [currentFen, runAnalysis]);

  // Continuous 60Hz Camera Motion Tracking with drift-free anchor clamping
  useEffect(() => {
    motionTrackerRef.current.start((data) => {
      if (!isFrozen) {
        setCorners(CameraMotionTracker.applyOffsetToCorners(anchorCornersRef.current, data.offset));
      }

      // Motion-gated auto scan: triggers only when camera settles steadily
      if (data.isStable && !isLocked && !isScanning && !hasSettledScannedRef.current) {
        hasSettledScannedRef.current = true;
        captureAndProcessFrame();
      } else if (!data.isStable) {
        hasSettledScannedRef.current = false;
      }
    });

    return () => {
      motionTrackerRef.current.stop();
    };
  }, [isFrozen, isLocked, isScanning]);

  // Process camera frame to detect board corners and pieces
  const captureAndProcessFrame = useCallback(async () => {
    if (!cameraRef.current || isFrozen || isScanning) return;

    try {
      setIsScanning(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.35,
        base64: true,
      });

      if (photo && photo.base64) {
        const decoded = decodeBase64Jpeg(photo.base64);

        // Auto-detect corners in real-time
        const detectedCorners = detectBoardCornersFromPixels(decoded, {
          screenWidth: SCREEN_WIDTH,
          screenHeight: SCREEN_HEIGHT,
          prevCorners: anchorCornersRef.current,
          smoothingAlpha: 0.4,
        });

        anchorCornersRef.current = detectedCorners;
        setCorners(detectedCorners);

        // Classify pieces from actual pixels
        const { homography: newH, squares: newSquares } = registerBoardFromCorners(
          detectedCorners,
          isWhiteBottom
        );

        const result = classifyPiecesFromPixels(
          decoded,
          newSquares,
          newH,
          SCREEN_WIDTH,
          SCREEN_HEIGHT
        );

        if (result.isLegalFen && result.fen !== currentFen) {
          setCurrentFen(result.fen);
          runAnalysis(result.fen);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setStatusMsg(`Position Detected: Stockfish Evaluated`);
        }
      }
    } catch (err: any) {
      console.warn('captureAndProcessFrame error:', err?.message || err);
    } finally {
      setIsScanning(false);
    }
  }, [currentFen, isFrozen, isScanning, isWhiteBottom, runAnalysis]);

  // Manual corner adjustment handler
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSnapAutoAlign = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setStatusMsg('Auto-aligning to board & scanning...');
    const centered: QuadPoints = {
      topLeft: { x: SCREEN_WIDTH * 0.10, y: SCREEN_HEIGHT * 0.30 },
      topRight: { x: SCREEN_WIDTH * 0.90, y: SCREEN_HEIGHT * 0.30 },
      bottomRight: { x: SCREEN_WIDTH * 0.92, y: SCREEN_HEIGHT * 0.72 },
      bottomLeft: { x: SCREEN_WIDTH * 0.08, y: SCREEN_HEIGHT * 0.72 },
    };
    anchorCornersRef.current = centered;
    setCorners(centered);
    captureAndProcessFrame();
  };

  const toggleLock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsLocked((prev) => {
      const next = !prev;
      if (next) {
        setStatusMsg('Board Locked • 60 FPS Tracking Active');
        captureAndProcessFrame();
      } else {
        setStatusMsg('Live Camera Tracking Active');
      }
      return next;
    });
  };

  const handleLoadKubbelPuzzle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const puzzleFen = '5B2/6P1/1p6/8/1N6/kP6/2K5/8 w - - 0 1';
    setCurrentFen(puzzleFen);
    setIsLocked(true);
    setStatusMsg('Kubbel 1907 Puzzle Loaded: White to Move');
    runAnalysis(puzzleFen);
  };

  const toggleOrientation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsWhiteBottom((prev) => !prev);
    setStatusMsg(`Flipped: ${!isWhiteBottom ? 'White' : 'Black'} at bottom`);
  };

  const toggleFreeze = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFrozen((prev) => !prev);
    setStatusMsg(!isFrozen ? 'Frame frozen' : 'Live tracking resumed');
  };

  const evalText = evaluation ? formatEvaluationScore(evaluation.scoreCp, evaluation.mateIn) : '+0.00';

  return (
    <View style={styles.container}>
      {/* Live Camera View with Fallback */}
      {permission?.granted ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraPlaceholder]}>
          <Camera size={48} color={colors.dark.textMuted} />
          <Text style={styles.permissionPromptText}>Camera Permission Needed</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* AR Perspective Board & SVG Overlays with 60 FPS Gyro Tracking */}
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
        onCornerChange={handleCornerChange}
        onSquarePress={(sq) => {
          setSelectedSquare(sq);
          setCorrectionSquare(sq);
        }}
      />

      {/* Top Floating HUD */}
      <ARTopHud
        depth={evaluation?.depth || 14}
        evalText={evalText}
        isCheckmate={evaluation?.mateIn === 0}
        statusMessage={statusMsg}
        isOfflineReady={true}
        isLocked={isLocked}
      />

      {/* Side Controls */}
      <View style={styles.sideControls}>
        {/* Lock Board Button */}
        <TouchableOpacity
          style={[styles.actionIconBtn, isLocked && styles.lockedBtn]}
          onPress={toggleLock}
          accessibilityLabel={isLocked ? 'Unlock board' : 'Lock board'}
        >
          {isLocked ? <Lock size={20} color="#000000" /> : <Unlock size={20} color="#FFFFFF" />}
        </TouchableOpacity>

        {/* Auto-Align Scan Button */}
        <TouchableOpacity
          style={[styles.actionIconBtn, isScanning && styles.scanningBtn]}
          onPress={handleSnapAutoAlign}
          accessibilityLabel="Auto-detect board"
        >
          <Scan size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Quick Load SparkChess Puzzle */}
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={handleLoadKubbelPuzzle}
          accessibilityLabel="Load SparkChess Kubbel Puzzle"
        >
          <Sparkles size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Freeze Frame Button */}
        <TouchableOpacity style={styles.actionIconBtn} onPress={toggleFreeze} accessibilityLabel="Freeze frame">
          {isFrozen ? <Play size={20} color="#FFFFFF" /> : <Pause size={20} color="#FFFFFF" />}
        </TouchableOpacity>

        {/* Flip Orientation Button */}
        <TouchableOpacity style={styles.actionIconBtn} onPress={toggleOrientation} accessibilityLabel="Flip board">
          <RotateCcw size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Analysis Drawer Bar */}
      <View style={styles.bottomSafeArea}>
        <View style={styles.bottomDrawer}>
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.drawerTitle}>
                Best Move: <Text style={styles.highlightMove}>{evaluation?.bestMoveSan || 'Calculating...'}</Text>
              </Text>
              <Text style={styles.drawerSub}>Depth {evaluation?.depth || 14} • Score {evalText}</Text>
            </View>
            <View style={styles.drawerButtons}>
              <TouchableOpacity
                style={styles.coachBtn}
                onPress={() => onNavigateToCoach(currentFen, evaluation || undefined)}
              >
                <Brain size={16} color="#FFFFFF" />
                <Text style={styles.coachBtnText}>Coach</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailsBtn}
                onPress={() => onNavigateToAnalysis(currentFen, evaluation || undefined)}
              >
                <Text style={styles.detailsBtnText}>Analysis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Square Correction Modal */}
      <ARCorrectionModal
        visible={correctionSquare !== null}
        square={correctionSquare}
        onClose={() => setCorrectionSquare(null)}
        onConfirmPiece={handleConfirmPiece}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraPlaceholder: {
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionPromptText: {
    ...typography.headline,
    color: colors.dark.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  permissionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  permissionBtnText: {
    ...typography.headline,
    color: '#000000',
    fontWeight: '700',
  },
  sideControls: {
    position: 'absolute',
    right: spacing.lg,
    top: 90,
    gap: spacing.md,
    zIndex: 90,
  },
  actionIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 15, 15, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  scanningBtn: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomDrawer: {
    backgroundColor: 'rgba(10, 10, 10, 0.94)',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 28,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
  },
  highlightMove: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  drawerSub: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  drawerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  coachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  coachBtnText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  detailsBtn: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  detailsBtnText: {
    ...typography.caption,
    color: colors.dark.textPrimary,
    fontWeight: '600',
  },
});
