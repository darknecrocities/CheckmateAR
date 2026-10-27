import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Check } from 'lucide-react-native';
import { SquareCoord, PieceColor, PieceType } from '../../types/chess';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ARCorrectionModalProps {
  visible: boolean;
  square: SquareCoord | null;
  currentPiece?: { type: PieceType; color: PieceColor } | null;
  onClose: () => void;
  onConfirmPiece: (square: SquareCoord, piece: { type: PieceType; color: PieceColor } | null) => void;
}

const PIECE_TYPES: Array<{ type: PieceType; label: string; symbol: string }> = [
  { type: 'p', label: 'Pawn', symbol: '♟' },
  { type: 'n', label: 'Knight', symbol: '♞' },
  { type: 'b', label: 'Bishop', symbol: '♝' },
  { type: 'r', label: 'Rook', symbol: '♜' },
  { type: 'q', label: 'Queen', symbol: '♛' },
  { type: 'k', label: 'King', symbol: '♚' },
];

export const ARCorrectionModal: React.FC<ARCorrectionModalProps> = ({
  visible,
  square,
  currentPiece,
  onClose,
  onConfirmPiece,
}) => {
  if (!square) return null;

  const handleSelect = (color: PieceColor, type: PieceType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onConfirmPiece(square, { color, type });
    onClose();
  };

  const handleClearEmpty = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirmPiece(square, null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Correct Square: {square.toUpperCase()}</Text>
              <Text style={styles.subtitle}>Tap a piece to assign, or set square empty</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* White Pieces Row */}
          <Text style={styles.sectionTitle}>White Pieces</Text>
          <View style={styles.pieceRow}>
            {PIECE_TYPES.map((p) => {
              const isSelected = currentPiece?.color === 'w' && currentPiece.type === p.type;
              return (
                <TouchableOpacity
                  key={`w_${p.type}`}
                  style={[styles.pieceBtn, isSelected && styles.selectedPieceBtn]}
                  onPress={() => handleSelect('w', p.type)}
                >
                  <Text style={[styles.pieceSymbol, { color: '#FFFFFF' }]}>{p.symbol}</Text>
                  <Text style={styles.pieceLabel}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Black Pieces Row */}
          <Text style={styles.sectionTitle}>Black Pieces</Text>
          <View style={styles.pieceRow}>
            {PIECE_TYPES.map((p) => {
              const isSelected = currentPiece?.color === 'b' && currentPiece.type === p.type;
              return (
                <TouchableOpacity
                  key={`b_${p.type}`}
                  style={[styles.pieceBtn, isSelected && styles.selectedPieceBtn]}
                  onPress={() => handleSelect('b', p.type)}
                >
                  <Text style={[styles.pieceSymbol, { color: '#71717A' }]}>{p.symbol}</Text>
                  <Text style={styles.pieceLabel}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Clear Empty Button */}
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearEmpty}>
            <Text style={styles.clearBtnText}>Mark Square Empty</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title2,
    color: colors.dark.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pieceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pieceBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: 6,
    borderRadius: radii.md,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    minWidth: 48,
    minHeight: 52,
  },
  selectedPieceBtn: {
    borderColor: colors.ar.bestMoveTile,
    backgroundColor: colors.dark.accentSubtle,
  },
  pieceSymbol: {
    fontSize: 24,
    lineHeight: 28,
  },
  pieceLabel: {
    ...typography.tiny,
    color: colors.dark.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  clearBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    borderWidth: 1,
    borderColor: colors.dark.danger,
    alignItems: 'center',
  },
  clearBtnText: {
    ...typography.headline,
    color: colors.dark.danger,
    fontSize: 14,
  },
});
