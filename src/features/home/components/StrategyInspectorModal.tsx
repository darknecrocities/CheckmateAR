import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, ScrollView } from 'react-native';
import { Chess } from 'chess.js';
import * as Haptics from 'expo-haptics';
import {
  X, RotateCcw, ChevronLeft, ChevronRight, Play, Pause, Target, Cpu, Award, Scan,
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
  onProjectInAR?: (strategy: StrategyItem, activeFen: string) => void;
}

interface ReplayStep {
  fen: string;
  sanMove: string;
  uciMove: string;
  nextReplyUci?: string;
  predictedSan?: string;
}

/**
 * Interactive Step-by-Step Strategy Replayer & Tactical Inspector Modal.
 * Computes legal FEN states, primary Move Prediction Arrows, and opponent Reply Arrows
 * across `strategy.uciMoves` using `chess.js`.
 */
export const StrategyInspectorModal: React.FC<StrategyInspectorModalProps> = ({
  strategy,
  visible,
  onClose,
  onAnalyzeInEngine,
  onPracticeInTrainer,
  onProjectInAR,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const replayTimeline = useMemo<ReplayStep[]>(() => {
    if (!strategy) return [];

    const sanLookup: string[] = [];
    const fenStates: string[] = [strategy.fen];

    try {
      const sim = new Chess(strategy.fen);
      strategy.uciMoves.forEach((uci) => {
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const m =
          uci.length > 4
            ? sim.move({ from, to, promotion: uci[4] })
            : sim.move({ from, to });
        if (m) {
          sanLookup.push(m.san);
          fenStates.push(sim.fen());
        }
      });
    } catch {
      // Custom endgame study fallback
    }

    const steps: ReplayStep[] = [
      {
        fen: strategy.fen,
        sanMove: 'Initial Position',
        uciMove: strategy.uciMoves[0] ?? '',
        nextReplyUci: strategy.uciMoves[1],
        predictedSan: sanLookup[0] ?? 'Best',
      },
    ];

    for (let i = 0; i < sanLookup.length; i++) {
      steps.push({
        fen: fenStates[i + 1] ?? strategy.fen,
        sanMove: `${i + 1}. ${sanLookup[i]}`,
        uciMove: strategy.uciMoves[i + 1] ?? strategy.uciMoves[i] ?? '',
        nextReplyUci: strategy.uciMoves[i + 2],
        predictedSan: sanLookup[i + 1] ?? sanLookup[i] ?? 'Goal',
      });
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
                <Text style={styles.keySquareText}>
                  PREDICT: {(currentFrame?.predictedSan || strategy.keySquare).toUpperCase()}
                </Text>
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

            {/* Interactive 2D Board Replayer with Live Prediction & Counter-Prediction Arrows */}
            <View style={styles.boardWrap}>
              <ChessBoard2D
                fen={currentFrame?.fen ?? strategy.fen}
                bestMove={currentFrame?.uciMove}
                secondaryMove={currentFrame?.nextReplyUci}
                predictionLabel={currentFrame?.predictedSan}
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
                    ? `Play Line (Next: ${currentFrame?.predictedSan || 'Move'})`
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
                <Award size={14} color="#10B981" />
                <Text style={styles.goalTitle}>TACTICAL OBJECTIVE • {strategy.masterWinRate}</Text>
              </View>
              <Text style={styles.goalBody}>{strategy.tacticalGoal}</Text>
              <Text style={styles.conceptBody}>{strategy.concept}</Text>
            </LiquidGlassCard>

            {/* Primary Action Buttons: Trainer + AR Projection + Stockfish */}
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
                <Target size={15} color="#000000" />
                <Text style={styles.trainerBtnText}>Practice</Text>
              </KineticPressable>

              {onProjectInAR && (
                <KineticPressable
                  scaleTo={0.94}
                  hapticStyle="medium"
                  style={styles.arProjectBtn}
                  onPress={() => {
                    onClose();
                    onProjectInAR(strategy, currentFrame?.fen ?? strategy.fen);
                  }}
                >
                  <Scan size={15} color="#FFFFFF" />
                  <Text style={styles.arProjectBtnText}>AR Overlay</Text>
                </KineticPressable>
              )}

              <KineticPressable
                scaleTo={0.94}
                hapticStyle="light"
                style={styles.engineBtn}
                onPress={() => {
                  onClose();
                  onAnalyzeInEngine(currentFrame?.fen ?? strategy.fen);
                }}
              >
                <Cpu size={15} color="#FFFFFF" />
                <Text style={styles.engineBtnText}>Engine</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.84)',
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
    maxHeight: '92%',
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
    backgroundColor: '#EAF7F0',
    borderRadius: radii.sm,
  },
  catBadgeText: { color: '#09090B', fontSize: 9, fontWeight: '800' },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  diffBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  keySquareBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  keySquareText: { color: '#10B981', fontSize: 9, fontWeight: '800' },
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
    backgroundColor: '#EAF7F0',
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radii.pill,
  },
  playPillText: {
    color: '#09090B',
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
    color: '#10B981',
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
    gap: 8,
    marginTop: spacing.sm,
  },
  trainerBtn: {
    flex: 1.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EAF7F0',
    paddingVertical: 13,
    borderRadius: radii.lg,
  },
  trainerBtnText: {
    color: '#09090B',
    fontSize: 12.5,
    fontWeight: '800',
  },
  arProjectBtn: {
    flex: 1.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: radii.lg,
  },
  arProjectBtnText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '800',
  },
  engineBtn: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 13,
    borderRadius: radii.lg,
  },
  engineBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
