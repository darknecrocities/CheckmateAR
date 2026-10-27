import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Bookmark, Share2, RotateCcw, Brain } from 'lucide-react-native';

import { EngineEvaluation } from '../../types/stockfish';
import { SquareCoord } from '../../types/chess';
import { ChessBoard2D } from '../../components/chess/ChessBoard2D';
import { EvaluationBar } from '../../components/chess/EvaluationBar';
import { StockfishEngine } from '../../services/stockfish/stockfishEngine';
import { executeMove } from '../../services/chess/chessValidator';
import { saveStudySession, exportSessionToPgn } from '../../services/storage/studyStorage';
import { formatEvaluationScore } from '../../services/stockfish/uciProtocol';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface AnalysisScreenProps {
  initialFen: string;
  initialEvaluation?: EngineEvaluation;
  onBack: () => void;
  onNavigateToCoach: (fen: string, evaluation?: EngineEvaluation) => void;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  initialFen,
  initialEvaluation,
  onBack,
  onNavigateToCoach,
}) => {
  const [fen, setFen] = useState<string>(initialFen);
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(initialEvaluation || null);
  const [selectedSquare, setSelectedSquare] = useState<SquareCoord | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const engine = React.useRef(new StockfishEngine({ depth: 14, multiPv: 3 }));

  const analyzeCurrent = async (targetFen: string) => {
    const res = await engine.current.analyzePosition(targetFen);
    setEvaluation(res);
  };

  useEffect(() => {
    if (!initialEvaluation) {
      analyzeCurrent(fen);
    }
  }, [fen, initialEvaluation]);

  const handleSquarePress = (coord: SquareCoord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!selectedSquare) {
      setSelectedSquare(coord);
    } else {
      if (selectedSquare === coord) {
        setSelectedSquare(null);
        return;
      }
      // Attempt hypothetical move
      const res = executeMove(fen, selectedSquare, coord);
      if (res.success && res.newFen) {
        setFen(res.newFen);
        setMoveHistory((prev) => [...prev, res.san || '']);
        setSelectedSquare(null);
        analyzeCurrent(res.newFen);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setSelectedSquare(coord);
      }
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFen(initialFen);
    setMoveHistory([]);
    setSelectedSquare(null);
    analyzeCurrent(initialFen);
  };

  const handleSaveSession = async () => {
    try {
      await saveStudySession({
        title: `Analysis - ${new Date().toLocaleTimeString()}`,
        fen,
        evaluation: evaluation || undefined,
        notes: `Analyzed variation: ${moveHistory.join(' ')}`,
      });
      setIsSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved to Study History', 'Position and engine evaluation saved locally.');
    } catch {
      Alert.alert('Save Failed', 'Unable to persist study session.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={22} color={colors.dark.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deep Analysis</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleSaveSession}>
            <Bookmark size={20} color={isSaved ? '#00E676' : colors.dark.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleReset}>
            <RotateCcw size={20} color={colors.dark.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Interactive 2D Chessboard */}
        <ChessBoard2D
          fen={fen}
          selectedSquare={selectedSquare}
          bestMove={evaluation?.bestMove}
          onSquarePress={handleSquarePress}
        />

        {/* Engine Evaluation Advantage Bar */}
        <View style={styles.evalContainer}>
          <EvaluationBar scoreCp={evaluation?.scoreCp} mateIn={evaluation?.mateIn} />
        </View>

        {/* Action button to ask Coach */}
        <TouchableOpacity
          style={styles.coachCard}
          onPress={() => onNavigateToCoach(fen, evaluation || undefined)}
        >
          <View style={styles.coachIconWrap}>
            <Brain size={22} color="#00E676" />
          </View>
          <View style={styles.coachTextWrap}>
            <Text style={styles.coachTitle}>Ask Grounded Coach</Text>
            <Text style={styles.coachSub}>Explain tactical motifs and strategic ideas in natural language</Text>
          </View>
        </TouchableOpacity>

        {/* MultiPV Candidate Moves List */}
        <Text style={styles.sectionTitle}>Candidate Moves (MultiPV)</Text>
        <View style={styles.candidateList}>
          {evaluation?.candidates.map((cand, idx) => (
            <View key={cand.uci} style={styles.candidateCard}>
              <View style={styles.candidateHeader}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                </View>
                <Text style={styles.candidateSan}>{cand.san}</Text>
                <Text style={styles.candidateScore}>
                  {formatEvaluationScore(cand.scoreCp, cand.mateIn)}
                </Text>
              </View>
              <Text style={styles.pvText}>Line: {cand.pv.slice(0, 5).join(' ')}</Text>
            </View>
          ))}
        </View>

        {/* Move History / Moves played */}
        {moveHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Hypothetical Moves</Text>
            <Text style={styles.historyMoves}>{moveHistory.join('  ')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    ...typography.title2,
    color: colors.dark.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  evalContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    marginBottom: spacing.xl,
  },
  coachIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  coachTextWrap: {
    flex: 1,
  },
  coachTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
  },
  coachSub: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  candidateList: {
    gap: spacing.sm,
  },
  candidateCard: {
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    backgroundColor: colors.dark.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
  },
  rankText: {
    ...typography.tiny,
    color: colors.dark.textSecondary,
  },
  candidateSan: {
    ...typography.headline,
    color: colors.dark.textPrimary,
    flex: 1,
  },
  candidateScore: {
    ...typography.monoEval,
    fontSize: 14,
    color: colors.ar.bestMoveTile,
  },
  pvText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  historySection: {
    marginTop: spacing.xl,
  },
  historyMoves: {
    ...typography.monoCoord,
    color: colors.dark.textSecondary,
    backgroundColor: colors.dark.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
});
