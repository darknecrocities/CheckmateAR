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
import { ArrowLeft, Trash2, Share2, Award, Play, Sparkles } from 'lucide-react-native';

import { StudySession } from '../../types/study';
import {
  getAllStudySessions,
  deleteStudySession,
  clearAllStudySessions,
  exportSessionToPgn,
} from '../../services/storage/studyStorage';
import { formatEvaluationScore } from '../../services/stockfish/uciProtocol';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const GM_CLASSIC_STUDIES: StudySession[] = [
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
    notes: 'Adolf Anderssen vs Lionel Kieseritzky. Sacrificed both rooks, a bishop, and the queen.',
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
    notes: 'Paul Morphy vs Duke of Brunswick & Count Isouard. Definitive pin & development masterclass.',
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
    notes: 'Donald Byrne vs 13-year-old Bobby Fischer. Unstoppable windmill queen sacrifice.',
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
    notes: 'Game 6 of the historic Human vs Machine rematch that revolutionized computer chess.',
    createdAt: new Date('1997-05-11').getTime(),
    updatedAt: new Date('1997-05-11').getTime(),
  },
];

interface HistoryScreenProps {
  onBack: () => void;
  onOpenSession: (session: StudySession) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onOpenSession }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeTab, setActiveTab] = useState<'studies' | 'saved'>('studies');

  const loadSessions = async () => {
    const list = await getAllStudySessions();
    setSessions(list);
    if (list.length > 0) {
      setActiveTab('saved');
    }
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
          setActiveTab('studies');
        },
      },
    ]);
  };

  const handleExportPgn = (session: StudySession) => {
    const pgn = exportSessionToPgn(session);
    Alert.alert('PGN Export', pgn);
  };

  const displayedList = activeTab === 'saved' && sessions.length > 0 ? sessions : GM_CLASSIC_STUDIES;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Back"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Vault & Studies</Text>
        {sessions.length > 0 && activeTab === 'saved' ? (
          <TouchableOpacity style={styles.iconBtn} onPress={handleClearAll} accessibilityLabel="Clear All">
            <Trash2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Dual Tabs: Master Studies vs Saved */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'studies' && styles.tabBtnActive]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setActiveTab('studies');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'studies' && styles.tabTextActive]}>
            Grandmaster Studies ({GM_CLASSIC_STUDIES.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'saved' && styles.tabBtnActive]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setActiveTab('saved');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
            Saved History ({sessions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardMain}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onOpenSession(item);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.badgeRow}>
                  <View style={styles.badgePill}>
                    <Award size={12} color="#000000" />
                    <Text style={styles.badgePillText}>MASTER STUDY</Text>
                  </View>
                </View>
                <Text style={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardNotes} numberOfLines={2}>{item.notes}</Text>

              {item.evaluation && (
                <View style={styles.evalBarRow}>
                  <Text style={styles.cardEval}>
                    Best: {item.evaluation.bestMoveSan} ({formatEvaluationScore(item.evaluation.scoreCp, item.evaluation.mateIn)})
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.cardFooter}>
              <TouchableOpacity
                style={styles.openEngineBtn}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                  onOpenSession(item);
                }}
              >
                <Play size={13} color="#000000" fill="#000000" />
                <Text style={styles.openEngineBtnText}>Analyze in Engine</Text>
              </TouchableOpacity>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleExportPgn(item)}
                  accessibilityLabel="Export PGN"
                >
                  <Share2 size={16} color="#FFFFFF" />
                </TouchableOpacity>
                {activeTab === 'saved' && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(item.id)}
                    accessibilityLabel="Delete"
                  >
                    <Trash2 size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  headerTitle: {
    ...typography.title2,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#141416',
    borderWidth: 1,
    borderColor: '#26262A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(20, 20, 24, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: 'rgba(16, 16, 18, 0.92)',
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  cardMain: {
    gap: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  badgePillText: {
    color: '#000000',
    fontSize: 9.5,
    fontWeight: '800',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  cardNotes: {
    color: '#A1A1AA',
    fontSize: 12,
    lineHeight: 16,
  },
  evalBarRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  cardEval: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDate: {
    color: '#71717A',
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  openEngineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  openEngineBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
