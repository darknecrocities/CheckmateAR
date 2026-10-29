import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { radii, spacing } from '../../theme/spacing';

interface ARSideSelectorModalProps {
  visible: boolean;
  onSelectSide: (side: 'white' | 'black') => void;
}

export const ARSideSelectorModal: React.FC<ARSideSelectorModalProps> = ({
  visible,
  onSelectSide,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.sideSelectorBackdrop}>
      <View style={styles.sideSelectorCard}>
        <Text style={styles.sideSelectorTitle}>Which side are you playing?</Text>
        <Text style={styles.sideSelectorSub}>
          CheckmateAR orients live AR board coordinates and Stockfish best-move prediction to your side.
        </Text>
        <View style={styles.sideSelectorButtons}>
          <TouchableOpacity
            style={[styles.sideChoiceBtn, styles.sideChoiceWhite]}
            onPress={() => onSelectSide('white')}
            activeOpacity={0.85}
          >
            <Text style={styles.sideChoiceWhiteText}>⚪ Play as White</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideChoiceBtn, styles.sideChoiceBlack]}
            onPress={() => onSelectSide('black')}
            activeOpacity={0.85}
          >
            <Text style={styles.sideChoiceBlackText}>⚫ Play as Black</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sideSelectorBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    zIndex: 120,
  },
  sideSelectorCard: {
    width: '100%',
    backgroundColor: '#121216',
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 20,
  },
  sideSelectorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  sideSelectorSub: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  sideSelectorButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sideChoiceBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideChoiceWhite: {
    backgroundColor: '#FFFFFF',
  },
  sideChoiceWhiteText: {
    color: '#09090B',
    fontSize: 14,
    fontWeight: '800',
  },
  sideChoiceBlack: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sideChoiceBlackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
