import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Chess } from 'chess.js';
import * as Haptics from 'expo-haptics';
import {
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Target,
  Cpu,
  Award,
} from 'lucide-react-native';
import { StrategyItem } from '../../../services/chess/strategyLibrary';
import { ChessBoard2D } from '../../../components/chess/ChessBoard2D';
import { KineticPressable } from '../../../components/ui/MotionPrimitives';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import { spacing, radii } from '../../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_BOARD_SIZE = Math.min(SCREEN_WIDTH - 64, 280);

export interface StrategyInspectorModalProps {
  strategy: StrategyItem | null;
  visible: boolean;
  onClose: () => void;
  onAnalyzeInEngine: (fen: string) => void;
  onPracticeInTrainer: (strategy: StrategyItem) => void;
}

interface ReplayStep {
  fen: string;
  sanMove: string;
  uciMove: string;
}

/**
 * Interactive Step-by-Step Strategy Replayer & Tactical Inspector Modal.
 * Computes legal FEN states across `strategy.uciMoves` using `chess.js`.
 */
export const StrategyInspectorModal: React.FC<StrategyInspectorModalProps> = ({
  strategy,
  visible,
  onClose,
  onAnalyzeInEngine,
  onPracticeInTrainer,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const replayTimeline = useMemo<ReplayStep[]>(() => {
    if (!strategy) return [];
    const steps: ReplayStep[] = [
      {
        fen: strategy.fen,
        sanMove: 'Initial Position',
        uciMove: strategy.uciMoves[0] ?? '',
      },
    ];

    try {
      const game = new Chess(strategy.fen);
      strategy.uciMoves.forEach((uci, idx) => {
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const moveObj =
          uci.length > 4
            ? game.move({ from, to, promotion: uci[4] })
            : game.move({ from, to });
        if (moveObj) {
          steps.push({
            fen: game.fen(),
            sanMove: `${idx + 1}. ${moveObj.san}`,
            uciMove: strategy.uciMoves[idx + 1] ?? uci,
          });
        }
      });
    } catch {
      // Fallback to initial position if custom study FEN
    }

    return steps;
  }, [strategy]);

  useEffect(() => {
    setStepIndex(0);
    setIsAutoPlaying(false);
  }, [strategy]);

  useEffect(() => {
    if (!isAutoPlaying || replayTimeline.length <= 1) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= replayTimeline.length - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        Haptics.selectionAsync().catch(() => {});
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(timer);
  }, [isAutoPlaying, replayTimeline.length]);

  if (!strategy || !visible) return null;

  const currentFrame = replayTimeline[stepIndex] ?? replayTimeline[0];
  const maxSteps = Math.max(0, replayTimeline.length - 1);

  const handleStep = (next: number) => {
    setIsAutoPlaying(false);
    Haptics.selectionAsync().catch(() => {});
    setStepIndex(Math.max(0, Math.min(maxSteps, next)));
  };

  const toggleAutoPlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (stepIndex >= maxSteps) {
      setStepIndex(0);
      setIsAutoPlaying(true);
    } else {
      setIsAutoPlaying((prev) => !prev);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Top Header */}
          <View style={styles.headerRow}>
            <View style={styles.badgeGroup}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{strategy.category.toUpperCase()}</Text>
              </View>
              <View style={styles.diffBadge}>
                <Text style={styles.diffBadgeText}>{strategy.difficulty}</Text>
              </View>
              <View style={styles.keySquareBadge}>
                <Text style={styles.keySquareText}>KEY: {strategy.keySquare.toUpperCase()}</Text>
              </View>
            </View>

            <KineticPressable
              scaleTo={0.88}
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel="Close Inspector"
            >
              <X size={18} color="#FFFFFF" />
            </KineticPressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            <Text style={styles.title}>{strategy.title}</Text>
            <Text style={styles.movesText}>{strategy.moves}</Text>

            {/* Interactive 2D Board Replayer */}
            <View style={styles.boardWrap}>
              <ChessBoard2D
                fen={currentFrame?.fen ?? strategy.fen}
                bestMove={currentFrame?.uciMove}
                boardSize={MODAL_BOARD_SIZE}
              />
            </View>

            {/* Step-by-Step Replayer Controls */}
            <View style={styles.stepperBar}>
              <KineticPressable
                scaleTo={0.88}
                style={styles.stepBtn}
                onPress={() => handleStep(0)}
                accessibilityLabel="Reset to Start"
              >
                <RotateCcw size={15} color="#FFFFFF" />
              </KineticPressable>

              <KineticPressable
                scaleTo={0.88}
                style={styles.stepBtn}
                onPress={() => handleStep(stepIndex - 1)}
                accessibilityLabel="Previous Move"
              >
                <ChevronLeft size={18} color="#FFFFFF" />
              </KineticPressable>

              <KineticPressable
                scaleTo={0.92}
                style={styles.playPill}
                onPress={toggleAutoPlay}
                accessibilityLabel="Auto Replay Sequence"
              >
                {isAutoPlaying ? (
                  <Pause size={14} color="#000000" />
                ) : (
                  <Play size={14} color="#000000" />
                )}
                <Text style={styles.playPillText}>
                  {stepIndex === 0
                    ? 'Replay Line'
                    : `Step ${stepIndex}/${maxSteps} (${currentFrame.sanMove})`}
                </Text>
              </KineticPressable>

              <KineticPressable
                scaleTo={0.88}
                style={styles.stepBtn}
                onPress={() => handleStep(stepIndex + 1)}
                accessibilityLabel="Next Move"
              >
                <ChevronRight size={18} color="#FFFFFF" />
              </KineticPressable>
            </View>

            {/* Tactical Breakdown Card */}
            <LiquidGlassCard variant="spec" causticPosition="right" style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Award size={14} color="#FFFFFF" />
                <Text style={styles.goalTitle}>TACTICAL OBJECTIVE • {strategy.masterWinRate}</Text>
              </View>
              <Text style={styles.goalBody}>{strategy.tacticalGoal}</Text>
              <Text style={styles.conceptBody}>{strategy.concept}</Text>
            </LiquidGlassCard>

            {/* Primary Action Buttons */}
            <View style={styles.actionRow}>
              <KineticPressable
                scaleTo={0.94}
                hapticStyle="medium"
                style={styles.trainerBtn}
                onPress={() => {
                  onClose();
                  onPracticeInTrainer(strategy);
                }}
              >
                <Target size={16} color="#000000" />
                <Text style={styles.trainerBtnText}>Practice in Trainer</Text>
              </KineticPressable>

              <KineticPressable
                scaleTo={0.94}
                hapticStyle="light"
                style={styles.engineBtn}
                onPress={() => {
                  onClose();
                  onAnalyzeInEngine(currentFrame?.fen ?? strategy.fen);
                }}
              >
                <Cpu size={16} color="#FFFFFF" />
                <Text style={styles.engineBtnText}>Stockfish</Text>
              </KineticPressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0A0A0C',
    borderTopLeftRadius: radii.xl + 4,
    borderTopRightRadius: radii.xl + 4,
    borderTopWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.sm,
  },
  catBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  diffBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  keySquareBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radii.sm,
  },
  keySquareText: {
    color: '#D4D4D4',
    fontSize: 9,
    fontWeight: '700',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingBottom: spacing.md,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 4,
  },
  movesText: {
    color: '#A3A3A3',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  boardWrap: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  stepperBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radii.pill,
  },
  playPillText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  goalCard: {
    padding: spacing.md,
    marginVertical: spacing.xs,
    gap: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  goalBody: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 2,
  },
  conceptBody: {
    color: '#A3A3A3',
    fontSize: 11,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  trainerBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: radii.lg,
  },
  trainerBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  engineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 13,
    borderRadius: radii.lg,
  },
  engineBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
