import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import {
  Camera,
  RefreshCw,
  RotateCcw,
  Sliders,
  ChevronUp,
  Brain,
  Pause,
  Play,
} from 'lucide-react-native';

import { QuadPoints, DetectedSquare } from '../../types/vision';
import { SquareCoord, PieceColor, PieceType } from '../../types/chess';
import { EngineEvaluation } from '../../types/stockfish';
import { registerBoardFromCorners } from '../../services/vision/boardDetector';
import { assembleFenFromSquares } from '../../services/vision/pieceClassifier';
import { MoveDifferenceTracker } from '../../services/vision/moveDifferenceTracker';
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
  const [selectedSquare, setSelectedSquare] = useState<SquareCoord | null>(null);
  const [correctionSquare, setCorrectionSquare] = useState<SquareCoord | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('Align chessboard within camera frame');

  // Realistic default perspective board corners for phone camera held at a 45-degree angle
  const [corners, setCorners] = useState<QuadPoints>({
    topLeft: { x: SCREEN_WIDTH * 0.12, y: SCREEN_HEIGHT * 0.22 },
    topRight: { x: SCREEN_WIDTH * 0.88, y: SCREEN_HEIGHT * 0.22 },
    bottomRight: { x: SCREEN_WIDTH * 0.96, y: SCREEN_HEIGHT * 0.68 },
    bottomLeft: { x: SCREEN_WIDTH * 0.04, y: SCREEN_HEIGHT * 0.68 },
  });

  const [currentFen, setCurrentFen] = useState<string>(
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
  );
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);

  const engineRef = useRef<StockfishEngine>(new StockfishEngine({ depth: 14, multiPv: 3 }));
  const moveTrackerRef = useRef<MoveDifferenceTracker>(new MoveDifferenceTracker());

  // Derive board squares & homography from current corners
  const { homography, squares } = React.useMemo(() => {
    return registerBoardFromCorners(corners, isWhiteBottom);
  }, [corners, isWhiteBottom]);

  // Run engine analysis whenever FEN changes
  const runAnalysis = useCallback(async (fen: string) => {
    try {
      setStatusMsg('Stockfish analyzing position...');
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

  // Handle manual correction confirmation
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

  const handleRecalibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Reset corners to standard perspective box
    setCorners({
      topLeft: { x: SCREEN_WIDTH * 0.12, y: SCREEN_HEIGHT * 0.22 },
      topRight: { x: SCREEN_WIDTH * 0.88, y: SCREEN_HEIGHT * 0.22 },
      bottomRight: { x: SCREEN_WIDTH * 0.96, y: SCREEN_HEIGHT * 0.68 },
      bottomLeft: { x: SCREEN_WIDTH * 0.04, y: SCREEN_HEIGHT * 0.68 },
    });
    setStatusMsg('Board recalibrated to camera viewport');
  };

  const toggleOrientation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsWhiteBottom((prev) => !prev);
    setStatusMsg(`Flipped: ${!isWhiteBottom ? 'White' : 'Black'} at bottom`);
  };

  const toggleFreeze = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFrozen((prev) => !prev);
    setStatusMsg(!isFrozen ? 'Analysis frame frozen' : 'Live scanning resumed');
  };

  const evalText = evaluation ? formatEvaluationScore(evaluation.scoreCp, evaluation.mateIn) : '+0.00';

  return (
    <View style={styles.container}>
      {/* Live Camera View with Fallback background */}
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraPlaceholder]}>
          <Camera size={48} color={colors.dark.textMuted} />
          <Text style={styles.permissionPromptText}>Camera Permission Needed</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* AR Perspective Board & SVG Overlays */}
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
      />

      {/* Floating Side Action Controls */}
      <View style={styles.sideControls}>
        <TouchableOpacity style={styles.actionIconBtn} onPress={toggleFreeze} accessibilityLabel="Freeze frame">
          {isFrozen ? <Play size={20} color="#00E676" /> : <Pause size={20} color="#FFFFFF" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconBtn} onPress={toggleOrientation} accessibilityLabel="Flip board">
          <RotateCcw size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconBtn} onPress={handleRecalibrate} accessibilityLabel="Recalibrate">
          <RefreshCw size={20} color="#00E5FF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Analysis Drawer Bar */}
      <SafeAreaView style={styles.bottomSafeArea}>
        <View style={styles.bottomDrawer}>
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.drawerTitle}>
                Best Move: <Text style={styles.highlightMove}>{evaluation?.bestMoveSan || 'Searching...'}</Text>
              </Text>
              <Text style={styles.drawerSub}>Depth {evaluation?.depth || 14} • Score {evalText}</Text>
            </View>
            <View style={styles.drawerButtons}>
              <TouchableOpacity
                style={styles.coachBtn}
                onPress={() => onNavigateToCoach(currentFen, evaluation || undefined)}
              >
                <Brain size={16} color="#00E676" />
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
      </SafeAreaView>

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
    backgroundColor: '#090A0F',
  },
  cameraPlaceholder: {
    backgroundColor: '#12141D',
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
    backgroundColor: colors.dark.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  permissionBtnText: {
    ...typography.headline,
    color: '#052312',
    fontWeight: '700',
  },
  sideControls: {
    position: 'absolute',
    right: spacing.lg,
    top: 130,
    gap: spacing.md,
    zIndex: 90,
  },
  actionIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(19, 20, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomDrawer: {
    backgroundColor: 'rgba(15, 17, 26, 0.94)',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
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
    color: colors.ar.bestMoveTile,
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
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: '#00E676',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  coachBtnText: {
    ...typography.caption,
    color: '#00E676',
    fontWeight: '700',
  },
  detailsBtn: {
    backgroundColor: '#1E2235',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
