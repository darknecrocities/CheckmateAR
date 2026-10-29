import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Award, Play, Sparkles, Share2, Trash2 } from 'lucide-react-native';

import { StudySession } from '../../../types/study';
import {
  getAllStudySessions,
  deleteStudySession,
  exportSessionToPgn,
} from '../../../services/storage/studyStorage';
import { formatEvaluationScore } from '../../../services/stockfish/uciProtocol';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import { colors } from '../../../theme/colors';
import { spacing, radii } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';

const GM_VAULT_STUDIES: StudySession[] = [
  {
    id: 'gm_immortal_1851',
    title: 'The Immortal Game (1851)',
    fen: 'r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1 b - - 1 23',
    evaluation: {
      depth: 16,
      scoreCp: 20000,
      mateIn: 1,
      bestMove: 'f6e8',
      bestMoveSan: 'Nxe8',
      pv: ['f6e8', 'd5f6'],
      candidates: [],
      isThinking: false,
      timestamp: new Date('1851-06-21').getTime(),
    },
    notes: 'Adolf Anderssen vs Lionel Kieseritzky. Sacrificed both rooks, a bishop, and the queen for mate.',
    createdAt: new Date('1851-06-21').getTime(),
    updatedAt: new Date('1851-06-21').getTime(),
  },
  {
    id: 'gm_opera_1858',
    title: 'The Opera Game (1858)',
    fen: '4kb1r/p2rqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 b k - 1 17',
    evaluation: {
      depth: 16,
      scoreCp: 20000,
      mateIn: 2,
      bestMove: 'e7e6',
      bestMoveSan: 'Qe6',
      pv: ['e7e6', 'b5d7'],
      candidates: [],
      isThinking: false,
      timestamp: new Date('1858-10-21').getTime(),
    },
    notes: 'Paul Morphy vs Duke of Brunswick. Absolute pinnacle of rapid piece development and pin exploit.',
    createdAt: new Date('1858-10-21').getTime(),
    updatedAt: new Date('1858-10-21').getTime(),
  },
  {
    id: 'gm_fischer_1956',
    title: 'Game of the Century (1956)',
    fen: 'r3r1k1/pp3pbp/1qp1b1p1/2B5/2BP4/1Pn2N2/P1Q2PPP/R4RK1 b - - 4 17',
    evaluation: {
      depth: 16,
      scoreCp: 850,
      bestMove: 'e6c4',
      bestMoveSan: 'Bxc4',
      pv: ['e6c4', 'c5b6', 'c3e2'],
      candidates: [],
      isThinking: false,
      timestamp: new Date('1956-10-17').getTime(),
    },
    notes: 'Donald Byrne vs 13-year-old Bobby Fischer. Legendary queen sacrifice into windmill destruction.',
    createdAt: new Date('1956-10-17').getTime(),
    updatedAt: new Date('1956-10-17').getTime(),
  },
  {
    id: 'gm_deepblue_1997',
    title: 'Kasparov vs Deep Blue (1997)',
    fen: 'r1b1kb1r/pp1n1ppp/2p1pn2/q5B1/2BP4/2N1PN2/PP3PPP/R2QK2R b KQkq - 2 8',
    evaluation: {
      depth: 16,
      scoreCp: -320,
      bestMove: 'f8b4',
      bestMoveSan: 'Bb4',
      pv: ['f8b4', 'e1g1', 'e8g8'],
      candidates: [],
      isThinking: false,
      timestamp: new Date('1997-05-11').getTime(),
    },
    notes: 'Historic Human vs Machine rematch game that changed artificial intelligence forever.',
    createdAt: new Date('1997-05-11').getTime(),
    updatedAt: new Date('1997-05-11').getTime(),
  },
];

interface HomeVaultTabProps {
  onOpenAnalysis: (fen: string) => void;
  onProjectInAR: (fen: string, title?: string) => void;
}

export const HomeVaultTab: React.FC<HomeVaultTabProps> = ({
  onOpenAnalysis,
  onProjectInAR,
}) => {
  const [userSessions, setUserSessions] = useState<StudySession[]>([]);
  const [filter, setFilter] = useState<'all' | 'classics' | 'saved'>('all');

  useEffect(() => {
    getAllStudySessions().then(setUserSessions);
  }, []);

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteStudySession(id);
    const updated = await getAllStudySessions();
    setUserSessions(updated);
  };

  const allItems = [...userSessions, ...GM_VAULT_STUDIES];
  const displayedItems =
    filter === 'classics'
      ? GM_VAULT_STUDIES
      : filter === 'saved'
      ? userSessions.length > 0
        ? userSessions
        : GM_VAULT_STUDIES
      : allItems;

  return (
    <View style={styles.container}>
      {/* Category Filter Pills */}
      <View style={styles.filterRow}>
        {(['all', 'classics', 'saved'] as const).map((cat) => {
          const isActive = filter === cat;
          const label =
            cat === 'all'
              ? `All (${allItems.length})`
              : cat === 'classics'
              ? 'Classics (4)'
              : `Saved (${userSessions.length})`;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setFilter(cat);
              }}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Studies / Match Vault Cards */}
      <View style={styles.cardsWrap}>
        {displayedItems.map((item, idx) => {
          const isGM = item.id.startsWith('gm_');
          const evalScore = item.evaluation
            ? formatEvaluationScore(item.evaluation.scoreCp, item.evaluation.mateIn)
            : '+0.00';

          return (
            <LiquidGlassCard
              key={item.id}
              variant="default"
              causticPosition="right"
              staggerIndex={idx}
              style={styles.studyCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgePill}>
                  <Award size={11} color="#000000" />
                  <Text style={styles.badgePillText}>
                    {isGM ? 'GM MASTER' : 'STUDY SAVED'}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.studyTitle}>{item.title}</Text>
              <Text style={styles.studyNotes} numberOfLines={2}>
                {item.notes}
              </Text>

              {item.evaluation && (
                <View style={styles.evalTagRow}>
                  <Text style={styles.evalTagText}>
                    Next: {item.evaluation.bestMoveSan} ({evalScore})
                  </Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.engineActionBtn}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    onOpenAnalysis(item.fen);
                  }}
                >
                  <Play size={12} color="#000000" fill="#000000" />
                  <Text style={styles.engineActionText}>Analyze</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.arActionBtn}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    onProjectInAR(item.fen, item.title);
                  }}
                >
                  <Sparkles size={12} color="#FFFFFF" />
                  <Text style={styles.arActionText}>AR Project</Text>
                </TouchableOpacity>

                {!isGM && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                    accessibilityLabel="Delete"
                  >
                    <Trash2 size={15} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </LiquidGlassCard>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.huge + 20,
    gap: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(20, 20, 24, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterText: {
    color: '#A1A1AA',
    fontSize: 11.5,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  cardsWrap: {
    gap: spacing.sm,
  },
  studyCard: {
    padding: spacing.md,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  badgePillText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
  dateText: {
    color: '#71717A',
    fontSize: 11,
  },
  studyTitle: {
    ...typography.headline,
    color: '#FFFFFF',
    fontSize: 15.5,
  },
  studyNotes: {
    ...typography.caption,
    color: '#A1A1AA',
    fontSize: 11.5,
    lineHeight: 16,
  },
  evalTagRow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  evalTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  engineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  engineActionText: {
    color: '#000000',
    fontSize: 11.5,
    fontWeight: '800',
  },
  arActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  arActionText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
