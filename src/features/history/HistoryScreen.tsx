import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Trash2, Share2, FolderOpen } from 'lucide-react-native';

import { StudySession } from '../../types/study';
import { getAllStudySessions, deleteStudySession, clearAllStudySessions, exportSessionToPgn } from '../../services/storage/studyStorage';
import { formatEvaluationScore } from '../../services/stockfish/uciProtocol';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface HistoryScreenProps {
  onBack: () => void;
  onOpenSession: (session: StudySession) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onOpenSession }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);

  const loadSessions = async () => {
    const list = await getAllStudySessions();
    setSessions(list);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteStudySession(id);
    loadSessions();
  };

  const handleClearAll = () => {
    Alert.alert('Clear History', 'Are you sure you want to delete all saved study sessions?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          await clearAllStudySessions();
          loadSessions();
        },
      },
    ]);
  };

  const handleExportPgn = (session: StudySession) => {
    const pgn = exportSessionToPgn(session);
    Alert.alert('PGN Export', pgn);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={22} color={colors.dark.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study History</Text>
        {sessions.length > 0 && (
          <TouchableOpacity style={styles.iconBtn} onPress={handleClearAll}>
            <Trash2 size={20} color={colors.dark.danger} />
          </TouchableOpacity>
        )}
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FolderOpen size={48} color={colors.dark.textMuted} />
          <Text style={styles.emptyTitle}>No Saved Sessions</Text>
          <Text style={styles.emptySub}>
            Scan a physical board or analyze positions to save study sessions offline.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardMain}
                onPress={() => onOpenSession(item)}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardFen} numberOfLines={1}>{item.fen}</Text>
                {item.evaluation && (
                  <Text style={styles.cardEval}>
                    Best: {item.evaluation.bestMoveSan} ({formatEvaluationScore(item.evaluation.scoreCp, item.evaluation.mateIn)})
                  </Text>
                )}
                <Text style={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleExportPgn(item)}>
                  <Share2 size={18} color={colors.dark.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                  <Trash2 size={18} color={colors.dark.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
    marginTop: spacing.md,
  },
  emptySub: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  cardMain: {
    flex: 1,
  },
  cardTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
    fontSize: 15,
  },
  cardFen: {
    ...typography.monoCoord,
    fontSize: 11,
    color: colors.dark.textMuted,
    marginTop: 4,
  },
  cardEval: {
    ...typography.caption,
    color: colors.ar.bestMoveTile,
    fontWeight: '700',
    marginTop: 4,
  },
  cardDate: {
    ...typography.tiny,
    color: colors.dark.textMuted,
    marginTop: 6,
  },
  cardActions: {
    justifyContent: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
  },
  actionBtn: {
    padding: 8,
  },
});
