import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Chess } from 'chess.js';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Flame,
  Trophy,
  Lightbulb,
  SkipForward,
  Cpu,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import {
  CHESS_STRATEGY_DATABASE,
  StrategyItem,
} from '../../services/chess/strategyLibrary';
import {
  DEFAULT_TRAINER_PROFILE,
  TrainerProfile,
  loadTrainerProfile,
  recordPuzzleOutcome,
} from '../../services/storage/trainerStorage';
import { ChessBoard2D } from '../../components/chess/ChessBoard2D';
import { LiquidGlassCard } from '../../components/ui/LiquidGlassCard';
import { KineticPressable } from '../../components/ui/MotionPrimitives';
import { SquareCoord } from '../../types/chess';
import { spacing, radii } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRAINER_BOARD_SIZE = Math.min(SCREEN_WIDTH - 32, 340);

export interface TacticalTrainerScreenProps {
  initialStrategy?: StrategyItem;
  onBack: () => void;
  onOpenEngine: (fen: string) => void;
}

export const TacticalTrainerScreen: React.FC<TacticalTrainerScreenProps> = ({
  initialStrategy,
  onBack,
  onOpenEngine,
}) => {
  const [profile, setProfile] = useState<TrainerProfile>(DEFAULT_TRAINER_PROFILE);
  const [puzzleIndex, setPuzzleIndex] = useState<number>(() => {
    if (initialStrategy) {
      const idx = CHESS_STRATEGY_DATABASE.findIndex((s) => s.id === initialStrategy.id);
      return idx >= 0 ? idx : 4;
    }
    return 4; // Start on Kubbel Discovered Check by default
  });

  const currentStrategy =
    CHESS_STRATEGY_DATABASE[puzzleIndex] ?? CHESS_STRATEGY_DATABASE[0];

  const [boardFen, setBoardFen] = useState<string>(currentStrategy.fen);
  const [selectedSquare, setSelectedSquare] = useState<SquareCoord | null>(null);
  const [status, setStatus] = useState<'playing' | 'solved' | 'wrong'>('playing');
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    loadTrainerProfile().then(setProfile);
  }, []);

  useEffect(() => {
    setBoardFen(currentStrategy.fen);
    setSelectedSquare(null);
    setStatus('playing');
    setShowHint(false);
  }, [currentStrategy]);

  const sideToMove = boardFen.split(' ')[1] === 'b' ? 'Black' : 'White';
  const expectedMove = currentStrategy.uciMoves[0] ?? '';

  const handleSquarePress = async (square: SquareCoord) => {
    if (status === 'solved') return;

    if (!selectedSquare) {
      setSelectedSquare(square);
      Haptics.selectionAsync().catch(() => {});
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const attemptedUci = `${selectedSquare}${square}`;
    setSelectedSquare(null);

    try {
      const game = new Chess(boardFen);
      const pieceOnFrom = game.get(selectedSquare as any);
      const isPromotion =
        pieceOnFrom?.type === 'p' && (square.endsWith('8') || square.endsWith('1'));
      const moveResult = isPromotion
        ? game.move({ from: selectedSquare, to: square, promotion: 'q' })
        : game.move({ from: selectedSquare, to: square });

      if (!moveResult) {
        // If user tapped another friendly piece, switch selection
        const targetPiece = game.get(square as any);
        if (targetPiece && targetPiece.color === game.turn()) {
          setSelectedSquare(square);
        }
        return;
      }

      if (attemptedUci === expectedMove.slice(0, 4)) {
        setBoardFen(game.fen());
        setStatus('solved');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        const updated = await recordPuzzleOutcome(
          currentStrategy.id,
          true,
          currentStrategy.difficulty
        );
        setProfile(updated);
      } else {
        setStatus('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        const updated = await recordPuzzleOutcome(
          currentStrategy.id,
          false,
          currentStrategy.difficulty
        );
        setProfile(updated);
      }
    } catch {
      setSelectedSquare(null);
    }
  };

  const handleNextPuzzle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPuzzleIndex((prev) => (prev + 1) % CHESS_STRATEGY_DATABASE.length);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header with Live ELO & Streak */}
      <View style={styles.header}>
        <KineticPressable
          scaleTo={0.88}
          style={styles.iconBtn}
          onPress={onBack}
          accessibilityLabel="Back to Home"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </KineticPressable>

        <View style={styles.titleCol}>
          <Text style={styles.headerTitle}>Tactical Trainer</Text>
          <Text style={styles.headerSub}>Interactive Grandmaster Drills</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.eloPill}>
            <Trophy size={12} color="#000000" />
            <Text style={styles.eloText}>{profile.eloRating}</Text>
          </View>
          <View style={styles.streakPill}>
            <Flame size={12} color="#FFFFFF" />
            <Text style={styles.streakText}>{profile.currentStreak}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Challenge Briefing Card */}
        <LiquidGlassCard variant="spec" causticPosition="right" style={styles.briefCard}>
          <View style={styles.briefTopRow}>
            <View style={styles.turnBadge}>
              <Text style={styles.turnBadgeText}>{sideToMove.toUpperCase()} TO MOVE</Text>
            </View>
            <Text style={styles.diffText}>
              {currentStrategy.difficulty} • {currentStrategy.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.puzzleTitle}>{currentStrategy.title}</Text>
          <Text style={styles.puzzleGoal}>{currentStrategy.tacticalGoal}</Text>
        </LiquidGlassCard>

        {/* Interactive 2D Board */}
        <View style={styles.boardWrap}>
          <ChessBoard2D
            fen={boardFen}
            selectedSquare={selectedSquare}
            bestMove={showHint || status === 'solved' ? expectedMove : undefined}
            onSquarePress={handleSquarePress}
            boardSize={TRAINER_BOARD_SIZE}
          />
        </View>

        {/* Live Outcome Banner */}
        {status === 'solved' && (
          <LiquidGlassCard variant="spec" causticPosition="center" style={styles.solvedBanner}>
            <CheckCircle2 size={20} color="#FFFFFF" />
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Brilliant Strike! (+ELO)</Text>
              <Text style={styles.bannerSub}>
                Full Line: {currentStrategy.moves} ({currentStrategy.masterWinRate})
              </Text>
            </View>
          </LiquidGlassCard>
        )}

        {status === 'wrong' && (
          <LiquidGlassCard variant="spec" causticPosition="none" style={styles.wrongBanner}>
            <AlertCircle size={20} color="#FFFFFF" />
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>Not the Strongest Move</Text>
              <Text style={styles.bannerSub}>
                Focus on key square {currentStrategy.keySquare.toUpperCase()} or tap Hint below.
              </Text>
            </View>
          </LiquidGlassCard>
        )}

        {/* Kinetic Trainer Controls */}
        <View style={styles.controlsRow}>
          <KineticPressable
            scaleTo={0.92}
            style={styles.secondaryBtn}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setShowHint(true);
            }}
          >
            <Lightbulb size={15} color="#FFFFFF" />
            <Text style={styles.secondaryBtnText}>
              {showHint ? `Move: ${expectedMove.toUpperCase()}` : 'Hint'}
            </Text>
          </KineticPressable>

          <KineticPressable
            scaleTo={0.92}
            style={styles.secondaryBtn}
            onPress={() => onOpenEngine(boardFen)}
          >
            <Cpu size={15} color="#FFFFFF" />
            <Text style={styles.secondaryBtnText}>Stockfish</Text>
          </KineticPressable>

          <KineticPressable
            scaleTo={0.92}
            hapticStyle="medium"
            style={styles.primaryNextBtn}
            onPress={handleNextPuzzle}
          >
            <Text style={styles.primaryNextText}>Next Drill</Text>
            <SkipForward size={15} color="#000000" />
          </KineticPressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleCol: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: '#737373',
    fontSize: 10,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eloPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  eloText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  briefCard: {
    padding: spacing.md,
    gap: 4,
  },
  briefTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  turnBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radii.sm,
  },
  turnBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  diffText: {
    color: '#A3A3A3',
    fontSize: 10,
    fontWeight: '700',
  },
  puzzleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  puzzleGoal: {
    color: '#D4D4D4',
    fontSize: 11,
    lineHeight: 16,
  },
  boardWrap: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  solvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  wrongBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bannerTextCol: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bannerSub: {
    color: '#D4D4D4',
    fontSize: 11,
    lineHeight: 15,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 12,
    borderRadius: radii.lg,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  primaryNextBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: radii.lg,
  },
  primaryNextText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
});
