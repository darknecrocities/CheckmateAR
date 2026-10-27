import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Camera, RotateCcw, Brain, Pause, Play, Scan, Lock, Unlock, Sparkles } from 'lucide-react-native';

import { QuadPoints, Point2D } from '../../types/vision';
import { SquareCoord, PieceColor, PieceType } from '../../types/chess';
import { EngineEvaluation } from '../../types/stockfish';
import { registerBoardFromCorners } from '../../services/vision/boardDetector';
import { assembleFenFromSquares } from '../../services/vision/pieceClassifier';
import { CameraMotionTracker } from '../../services/vision/motionTracker';
import { StockfishEngine } from '../../services/stockfish/stockfishEngine';
import { formatEvaluationScore } from '../../services/stockfish/uciProtocol';
import { LiveStreamCamera, BoardStreamData } from '../../components/camera/LiveStreamCamera';
import { ARPerspectiveBoard } from '../../components/ar/ARPerspectiveBoard';
import { ARTopHud } from '../../components/ar/ARTopHud';
import { ARCorrectionModal } from '../../components/ar/ARCorrectionModal';
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
  const [selectedSquare, setSelectedSquare] = useState<SquareCoord | null>(null);
  const [correctionSquare, setCorrectionSquare] = useState<SquareCoord | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('Live Stream Active • Tracking Board');

  const initialCorners: QuadPoints = {
    topLeft: { x: SCREEN_WIDTH * 0.10, y: SCREEN_HEIGHT * 0.30 },
    topRight: { x: SCREEN_WIDTH * 0.90, y: SCREEN_HEIGHT * 0.30 },
    bottomRight: { x: SCREEN_WIDTH * 0.92, y: SCREEN_HEIGHT * 0.72 },
    bottomLeft: { x: SCREEN_WIDTH * 0.08, y: SCREEN_HEIGHT * 0.72 },
  };

  const [corners, setCorners] = useState<QuadPoints>(initialCorners);
  const anchorCornersRef = useRef<QuadPoints>(initialCorners);

  // Default to Kubbel 1907 puzzle position with immediate tactical line
  const [currentFen, setCurrentFen] = useState<string>(
    '5B2/6P1/1p6/8/1N6/kP6/2K5/8 w - - 0 1'
  );
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);

  const engineRef = useRef<StockfishEngine>(new StockfishEngine({ depth: 14, multiPv: 3 }));
  const motionTrackerRef = useRef<CameraMotionTracker>(new CameraMotionTracker());

  // Homography and 64 squares derived from corners
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

  // Continuous 60Hz Camera Motion Tracking
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

  // Real-time video frame stream handler (zero shutter snaps)
  const handleBoardStream = useCallback(
    (streamData: BoardStreamData) => {
      if (isLocked || isFrozen) return;

      if (streamData.isBoardFound) {
        const smoothed: QuadPoints = {
          topLeft: smoothPoint(anchorCornersRef.current.topLeft, streamData.corners.topLeft, 0.20),
          topRight: smoothPoint(anchorCornersRef.current.topRight, streamData.corners.topRight, 0.20),
          bottomRight: smoothPoint(anchorCornersRef.current.bottomRight, streamData.corners.bottomRight, 0.20),
          bottomLeft: smoothPoint(anchorCornersRef.current.bottomLeft, streamData.corners.bottomLeft, 0.20),
        };
        anchorCornersRef.current = smoothed;
        setCorners(smoothed);
        setStatusMsg('Live Stream: Board Tracked');
      }
    },
    [isLocked, isFrozen]
  );

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
    setStatusMsg('Auto-aligned to board center');
    const centered: QuadPoints = {
      topLeft: { x: SCREEN_WIDTH * 0.10, y: SCREEN_HEIGHT * 0.30 },
      topRight: { x: SCREEN_WIDTH * 0.90, y: SCREEN_HEIGHT * 0.30 },
      bottomRight: { x: SCREEN_WIDTH * 0.92, y: SCREEN_HEIGHT * 0.72 },
      bottomLeft: { x: SCREEN_WIDTH * 0.08, y: SCREEN_HEIGHT * 0.72 },
    };
    anchorCornersRef.current = centered;
    setCorners(centered);
  };

  const toggleLock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsLocked((prev) => {
      const next = !prev;
      setStatusMsg(next ? 'Board Locked • AR Reticle Fixed' : 'Live Stream Active • Tracking Board');
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
    setStatusMsg(!isFrozen ? 'Stream paused' : 'Live stream resumed');
  };

  const evalText = evaluation ? formatEvaluationScore(evaluation.scoreCp, evaluation.mateIn) : '+0.00';

  return (
    <View style={styles.container}>
      {/* Live Stream Camera Pipeline (Zero Shutter Snaps) */}
      {permission?.granted ? (
        <LiveStreamCamera onBoardStream={handleBoardStream} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraPlaceholder]}>
          <Camera size={48} color={colors.dark.textMuted} />
          <Text style={styles.permissionPromptText}>Camera Permission Needed</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* AR 64-Tile Perspective Board, Pieces & Move Prediction */}
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
          style={styles.actionIconBtn}
          onPress={handleSnapAutoAlign}
          accessibilityLabel="Auto-align board center"
        >
          <Scan size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Quick Load Kubbel Puzzle */}
        <TouchableOpacity
          style={styles.actionIconBtn}
          onPress={handleLoadKubbelPuzzle}
          accessibilityLabel="Load Kubbel 1907 Puzzle"
        >
          <Sparkles size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Pause/Play Stream Button */}
        <TouchableOpacity style={styles.actionIconBtn} onPress={toggleFreeze} accessibilityLabel="Pause stream">
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
        square={correctionSquare || 'e4'}
        currentPiece={
          correctionSquare && squares[correctionSquare]?.detectedPiece
            ? {
                type: squares[correctionSquare]!.detectedPiece!,
                color: squares[correctionSquare]!.detectedColor || 'w',
              }
            : null
        }
        onConfirmPiece={handleConfirmPiece}
        onClose={() => setCorrectionSquare(null)}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    gap: spacing.md,
  },
  permissionPromptText: {
    color: '#FFFFFF',
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  permissionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.md,
  },
  permissionBtnText: {
    color: '#000000',
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },
  sideControls: {
    position: 'absolute',
    right: spacing.md,
    top: SCREEN_HEIGHT * 0.11,
    gap: spacing.sm,
    zIndex: 20,
  },
  actionIconBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  bottomDrawer: {
    backgroundColor: 'rgba(10, 10, 10, 0.94)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#262626',
    padding: spacing.md,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerTitle: {
    color: '#FFFFFF',
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  highlightMove: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  drawerSub: {
    color: '#737373',
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  drawerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  coachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#404040',
    backgroundColor: 'rgba(38, 38, 38, 0.8)',
  },
  coachBtnText: {
    color: '#FFFFFF',
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  detailsBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#404040',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
});
