import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  RotateCcw,
  Brain,
  Pause,
  Play,
  Scan,
  Lock,
  Unlock,
  Layers,
  Box,
  FastForward,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface ARFloatingCommandDockProps {
  showBoardMask: boolean;
  showPieceBoxes: boolean;
  isLocked: boolean;
  isFrozen: boolean;
  bestMoveSan?: string;
  pieceCount: number;
  evalText: string;
  onToggleBoardMask: () => void;
  onTogglePieceBoxes: () => void;
  onToggleLock: () => void;
  onAutoAlign: () => void;
  onCyclePosition: () => void;
  onToggleFreeze: () => void;
  onFlipBoard: () => void;
  onStepPredictedMove: () => void;
  onOpenCoach: () => void;
  onOpenAnalysis: () => void;
}

export const ARFloatingCommandDock: React.FC<ARFloatingCommandDockProps> = ({
  showBoardMask,
  showPieceBoxes,
  isLocked,
  isFrozen,
  bestMoveSan,
  pieceCount,
  evalText,
  onToggleBoardMask,
  onTogglePieceBoxes,
  onToggleLock,
  onAutoAlign,
  onCyclePosition,
  onToggleFreeze,
  onFlipBoard,
  onStepPredictedMove,
  onOpenCoach,
  onOpenAnalysis,
}) => {
  return (
    <>
      {/* Non-Overlapping Horizontal AR Command Bar */}
      <View style={styles.floatingToolbar}>
        <TouchableOpacity
          style={[styles.toolPill, showBoardMask && styles.toolPillActiveWhite]}
          onPress={onToggleBoardMask}
          accessibilityLabel="Toggle Board Segmentation Mask"
        >
          <Layers size={15} color={showBoardMask ? '#000000' : '#FFFFFF'} />
          <Text style={[styles.toolPillText, showBoardMask && styles.toolPillTextActive]}>Seg Mask</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolPill, showPieceBoxes && styles.toolPillActiveWhite]}
          onPress={onTogglePieceBoxes}
          accessibilityLabel="Toggle YOLO Piece Bounding Boxes"
        >
          <Box size={15} color={showPieceBoxes ? '#000000' : '#FFFFFF'} />
          <Text style={[styles.toolPillText, showPieceBoxes && styles.toolPillTextActive]}>YOLO Boxes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolIconBtn, isLocked && styles.lockedBtn]}
          onPress={onToggleLock}
          accessibilityLabel={isLocked ? 'Unlock board' : 'Lock board'}
        >
          {isLocked ? <Lock size={16} color="#000000" /> : <Unlock size={16} color="#FFFFFF" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolIconBtn}
          onPress={onAutoAlign}
          accessibilityLabel="Auto-align board center"
        >
          <Scan size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolIconBtn}
          onPress={onCyclePosition}
          accessibilityLabel="Sync next chess position"
        >
          <FastForward size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolIconBtn}
          onPress={onToggleFreeze}
          accessibilityLabel="Pause or resume stream"
        >
          {isFrozen ? <Play size={16} color="#FFFFFF" /> : <Pause size={16} color="#FFFFFF" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolIconBtn}
          onPress={onFlipBoard}
          accessibilityLabel="Flip board perspective"
        >
          <RotateCcw size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Live Prediction & Action Drawer */}
      <View style={styles.bottomSafeArea}>
        <View style={styles.bottomDrawer}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerInfo}>
              <Text style={styles.drawerTitle}>
                Next Move:{' '}
                <Text style={styles.highlightMove}>{bestMoveSan || 'Calculating...'}</Text>
              </Text>
              <Text style={styles.drawerSub}>
                {pieceCount} YOLO Pieces • Score {evalText}
              </Text>
            </View>

            <View style={styles.drawerButtons}>
              <TouchableOpacity
                style={styles.stepMoveBtn}
                onPress={onStepPredictedMove}
                accessibilityLabel="Step Predicted Move in AR"
              >
                <Play size={13} color="#000000" fill="#000000" />
                <Text style={styles.stepMoveBtnText}>Step Move</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.coachBtn} onPress={onOpenCoach}>
                <Brain size={15} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.detailsBtn} onPress={onOpenAnalysis}>
                <Text style={styles.detailsBtnText}>Engine</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  floatingToolbar: {
    position: 'absolute',
    bottom: 108,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 90,
  },
  toolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(12, 12, 14, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toolPillActiveWhite: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  toolPillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  toolPillTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  toolIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(12, 12, 14, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    padding: spacing.md,
    zIndex: 95,
  },
  bottomDrawer: {
    backgroundColor: 'rgba(10, 10, 12, 0.94)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: spacing.md,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  drawerInfo: {
    flex: 1,
  },
  drawerTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
    fontSize: 14,
  },
  highlightMove: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  drawerSub: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
  drawerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepMoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  stepMoveBtnText: {
    color: '#000000',
    fontSize: 11.5,
    fontWeight: '800',
  },
  coachBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
