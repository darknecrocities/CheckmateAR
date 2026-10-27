import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ARTopHudProps {
  depth: number;
  evalText: string;
  isCheckmate?: boolean;
  statusMessage?: string;
  isOfflineReady?: boolean;
}

export const ARTopHud: React.FC<ARTopHudProps> = ({
  depth,
  evalText,
  isCheckmate = false,
  statusMessage = 'Physical Board Calibrated',
  isOfflineReady = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Floating Row */}
      <View style={styles.topRow}>
        {/* Brand / Mode Pill */}
        <View style={styles.pillLeft}>
          <View style={styles.activeDot} />
          <Text style={styles.brandText}>CheckmateAR</Text>
          {isOfflineReady && (
            <View style={styles.offlineBadge}>
              <Text style={styles.offlineText}>OFFLINE</Text>
            </View>
          )}
        </View>

        {/* Engine Evaluation Pill */}
        <View style={[styles.pillRight, isCheckmate && styles.checkmatePill]}>
          <Text style={styles.evalText}>
            {isCheckmate
              ? 'FINAL MOVE: CHECKMATE'
              : `AI • ${depth} moves deep • ${evalText}`}
          </Text>
        </View>
      </View>

      {/* Bottom Status Subtitle */}
      {statusMessage ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ar.hudBackground,
    borderWidth: 1,
    borderColor: colors.ar.hudBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ar.bestMoveTile,
    marginRight: spacing.sm,
  },
  brandText: {
    ...typography.headline,
    color: colors.dark.textPrimary,
    fontSize: 13,
  },
  offlineBadge: {
    marginLeft: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  offlineText: {
    ...typography.tiny,
    color: colors.dark.textSecondary,
    fontSize: 8,
  },
  pillRight: {
    backgroundColor: colors.ar.hudBackground,
    borderWidth: 1,
    borderColor: colors.ar.hudBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  checkmatePill: {
    borderColor: colors.dark.danger,
    backgroundColor: 'rgba(255, 23, 68, 0.25)',
  },
  evalText: {
    ...typography.caption,
    color: colors.ar.bestMoveTile,
    fontWeight: '700',
  },
  statusContainer: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  statusText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontSize: 11,
  },
});
