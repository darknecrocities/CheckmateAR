import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ARTopHudProps {
  depth: number;
  evalText: string;
  isCheckmate?: boolean;
  statusMessage?: string;
  isOfflineReady?: boolean;
  isLocked?: boolean;
  boardConfidence?: number;
  pieceCount?: number;
  onBack?: () => void;
}

export const ARTopHud: React.FC<ARTopHudProps> = ({
  depth,
  evalText,
  isCheckmate = false,
  statusMessage = 'Physical Board Calibrated',
  isOfflineReady = true,
  isLocked = false,
  boardConfidence = 0.97,
  pieceCount,
  onBack,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top Floating Row: [<- Back] + [• CheckmateAR OFFLINE] ------ [AI • 14 moves deep • +1.2] */}
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          {onBack && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityLabel="Back to Home"
            >
              <ArrowLeft size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Brand / Mode Pill */}
          <View style={styles.pillLeft}>
            <View style={[styles.activeDot, isLocked && styles.lockedDot]} />
            <Text style={styles.brandText}>CheckmateAR</Text>
            {isLocked ? (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>LOCKED</Text>
              </View>
            ) : (
              isOfflineReady && (
                <View style={styles.offlineBadge}>
                  <Text style={styles.offlineText}>OFFLINE</Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* Engine Evaluation Pill */}
        <View style={[styles.pillRight, isCheckmate && styles.checkmatePill]}>
          <Text style={styles.evalText}>
            {isCheckmate
              ? 'FINAL MOVE: CHECKMATE'
              : `AI • ${depth}d • ${evalText}`}
          </Text>
        </View>
      </View>

      {/* Bottom Status & Segmentation Telemetry Subtitle */}
      <View style={styles.statusRow}>
        {statusMessage ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        {typeof pieceCount === 'number' && (
          <View style={styles.segBadge}>
            <Text style={styles.segBadgeText}>
              chess_board {boardConfidence.toFixed(2)} • {pieceCount} pieces
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 28,
    left: spacing.md,
    right: spacing.md,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xs,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(12, 12, 14, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ar.hudBackground,
    borderWidth: 1,
    borderColor: colors.ar.hudBorder,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radii.pill,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#3B82F6',
    marginRight: 7,
  },
  lockedDot: {
    backgroundColor: '#10B981',
  },
  brandText: {
    ...typography.headline,
    color: colors.dark.textPrimary,
    fontSize: 13,
  },
  lockedBadge: {
    marginLeft: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  lockedText: {
    ...typography.tiny,
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  offlineBadge: {
    marginLeft: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  offlineText: {
    ...typography.tiny,
    color: colors.dark.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  pillRight: {
    backgroundColor: colors.ar.hudBackground,
    borderWidth: 1,
    borderColor: colors.ar.hudBorder,
    paddingHorizontal: spacing.md,
    height: 38,
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  checkmatePill: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  evalText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11.5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  statusText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 10.5,
  },
  segBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.88)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  segBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
});
