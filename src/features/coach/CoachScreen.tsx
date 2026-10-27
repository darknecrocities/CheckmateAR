import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Send, Sparkles, ShieldAlert, Award } from 'lucide-react-native';

import { EngineEvaluation } from '../../types/stockfish';
import { generateGroundedCoachAdvice, CoachingLevel } from '../../services/coach/groundedCoach';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface CoachScreenProps {
  fen: string;
  evaluation?: EngineEvaluation;
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  motif?: string;
  suggestedPlan?: string;
}

export const CoachScreen: React.FC<CoachScreenProps> = ({
  fen,
  evaluation,
  onBack,
}) => {
  const [level, setLevel] = useState<CoachingLevel>('intermediate');
  const [customInput, setCustomInput] = useState<string>('');

  // Initial coach message generated strictly from engine evaluation
  const initialAdvice = React.useMemo(() => {
    if (!evaluation) {
      return {
        headline: 'Position Ready for Analysis',
        explanation: 'Scan a chessboard or enter moves to receive grounded coaching insights.',
        suggestedPlan: 'Point camera at the physical board.',
      };
    }
    return generateGroundedCoachAdvice(fen, evaluation, level);
  }, [fen, evaluation, level]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'coach',
      text: `${initialAdvice.headline}\n\n${initialAdvice.explanation}`,
      motif: initialAdvice.tacticalMotif,
      suggestedPlan: initialAdvice.suggestedPlan,
    },
  ]);

  const quickPrompts = [
    'Why is this move stronger?',
    'What is my opponent threatening?',
    'Explain the tactical idea',
    'Show me the plan for a beginner',
  ];

  const handleSendPrompt = (promptText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText,
    };

    let replyText = '';
    let motif = initialAdvice.tacticalMotif;

    if (promptText.toLowerCase().includes('threat')) {
      replyText = `Your opponent is looking to exploit weaknesses on the board. Playing ${evaluation?.bestMoveSan || 'the recommended move'} neutralizes their immediate threats while seizing tactical initiative.`;
    } else if (promptText.toLowerCase().includes('beginner')) {
      replyText = `In simple terms: this move places your piece on an active square, defends your pieces, and prepares your army for the middlegame.`;
    } else if (promptText.toLowerCase().includes('tactical')) {
      replyText = motif
        ? `This position features a ${motif}! By striking now, you gain control over critical diagonal and rank lines.`
        : `This position is primarily strategic. Control the center, complete piece development, and safeguard your king.`;
    } else {
      replyText = `According to local Stockfish at depth ${evaluation?.depth || 14}, ${evaluation?.bestMoveSan || 'this move'} maintains the highest winning probability without creating tactical weaknesses.`;
    }

    const coachMsg: ChatMessage = {
      id: `coach_${Date.now()}`,
      sender: 'coach',
      text: replyText,
      motif,
      suggestedPlan: initialAdvice.suggestedPlan,
    };

    setMessages((prev) => [...prev, userMsg, coachMsg]);
    setCustomInput('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={22} color={colors.dark.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline AI Coach</Text>
        <View style={styles.offlineTag}>
          <Text style={styles.offlineTagText}>100% LOCAL</Text>
        </View>
      </View>

      {/* Level Selector Tabs */}
      <View style={styles.levelTabs}>
        {(['beginner', 'intermediate', 'advanced'] as CoachingLevel[]).map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.levelTab, level === lvl && styles.activeLevelTab]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLevel(lvl);
            }}
          >
            <Text style={[styles.levelTabText, level === lvl && styles.activeLevelTabText]}>
              {lvl.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat Messages */}
      <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.sender === 'user' ? styles.userBubble : styles.coachBubble,
            ]}
          >
            {m.motif && (
              <View style={styles.motifBadge}>
                <Sparkles size={12} color="#FFFFFF" />
                <Text style={styles.motifText}>{m.motif}</Text>
              </View>
            )}
            <Text
              style={[
                styles.bubbleText,
                m.sender === 'user' ? styles.userBubbleText : styles.coachBubbleText,
              ]}
            >
              {m.text}
            </Text>
            {m.suggestedPlan && (
              <View style={styles.planCard}>
                <Text style={styles.planTitle}>Key Plan:</Text>
                <Text style={styles.planText}>{m.suggestedPlan}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Quick Prompts Bar */}
      <View style={styles.quickPromptsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
          {quickPrompts.map((p, idx) => (
            <TouchableOpacity key={idx} style={styles.promptChip} onPress={() => handleSendPrompt(p)}>
              <Text style={styles.promptChipText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Custom Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a chess question..."
          placeholderTextColor={colors.dark.textMuted}
          value={customInput}
          onChangeText={setCustomInput}
          onSubmitEditing={() => customInput.trim() && handleSendPrompt(customInput.trim())}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => customInput.trim() && handleSendPrompt(customInput.trim())}
        >
          <Send size={18} color="#052312" />
        </TouchableOpacity>
      </View>
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
  offlineTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  offlineTagText: {
    ...typography.tiny,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  levelTabs: {
    flexDirection: 'row',
    backgroundColor: colors.dark.surface,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.lg,
  },
  levelTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  activeLevelTab: {
    backgroundColor: colors.dark.surfaceElevated,
  },
  levelTabText: {
    ...typography.tiny,
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  activeLevelTabText: {
    color: colors.dark.textPrimary,
    fontWeight: '800',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.dark.accent,
  },
  bubbleText: {
    ...typography.body,
    lineHeight: 22,
  },
  coachBubbleText: {
    color: colors.dark.textPrimary,
  },
  userBubbleText: {
    color: '#000000',
    fontWeight: '600',
  },
  motifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  motifText: {
    ...typography.tiny,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  planCard: {
    marginTop: spacing.md,
    backgroundColor: colors.dark.surface,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.dark.accent,
  },
  planTitle: {
    ...typography.tiny,
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
  },
  planText: {
    ...typography.caption,
    color: colors.dark.textPrimary,
    marginTop: 2,
  },
  quickPromptsRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  quickScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  promptChip: {
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  promptChipText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.dark.surface,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    color: colors.dark.textPrimary,
    ...typography.body,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
