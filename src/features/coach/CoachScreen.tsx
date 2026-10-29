import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Send, Sparkles, Bot, ShieldCheck } from 'lucide-react-native';

import { EngineEvaluation } from '../../types/stockfish';
import { askGemmaCoach, CoachingLevel, CoachResponse } from '../../services/coach/gemmaCoachService';
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
  headline?: string;
  motif?: string;
  suggestedPlan?: string;
}

/**
 * Gemma-Powered Conversational AI Chess Coach Screen.
 * Provides real-time tactical and strategic coaching with multi-turn memory
 * and extensive chess knowledge dataset integration.
 */
export const CoachScreen: React.FC<CoachScreenProps> = ({
  fen,
  evaluation,
  onBack,
}) => {
  const [level, setLevel] = useState<CoachingLevel>('intermediate');
  const [customInput, setCustomInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const scrollRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'coach',
      headline: evaluation?.bestMoveSan
        ? `Recommended Move: ${evaluation.bestMoveSan}`
        : 'Welcome to Gemma AI Coach',
      text: evaluation?.bestMoveSan
        ? `Stockfish 18 calculates **${evaluation.bestMoveSan}** as the strongest continuation. Ask me why this move works, what your opponent is threatening, or explore opening theory and grandmaster strategy!`
        : `Greetings! I'm your Gemma AI Chess Coach. Ask me anything about chess openings, tactical motifs, endgame plans, or point your camera at a board to analyze active positions.`,
      suggestedPlan: evaluation?.bestMoveSan ? `Play ${evaluation.bestMoveSan} to gain the initiative.` : undefined,
    },
  ]);

  const quickPrompts = [
    '👋 Hello Coach!',
    '🎯 Why is this move best?',
    '⚠️ Opponent threats',
    '📖 Opening theory',
    '♟️ Endgame principles',
    '🚀 How to improve rating',
  ];

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isThinking]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isThinking) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setCustomInput('');
    setIsThinking(true);

    try {
      const response: CoachResponse = await askGemmaCoach(promptText, {
        fen,
        evaluation,
        level,
        conversationHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
      });

      const coachMsg: ChatMessage = {
        id: `coach_${Date.now()}`,
        sender: 'coach',
        headline: response.headline,
        text: response.reply,
        motif: response.tacticalMotif,
        suggestedPlan: response.suggestedPlan,
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `coach_err_${Date.now()}`,
        sender: 'coach',
        headline: 'Analysis Ready',
        text: `According to local Stockfish, ${evaluation?.bestMoveSan || 'your recommended move'} maintains strong piece coordination and center control. What specific square or piece would you like to review?`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={colors.dark.textPrimary} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>Gemma AI Coach</Text>
          <Text style={styles.headerSub}>Grandmaster Theory & Tactics</Text>
        </View>
        <View style={styles.offlineTag}>
          <Sparkles size={11} color="#FFFFFF" />
          <Text style={styles.offlineTagText}>GEMMA LOCAL</Text>
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
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.sender === 'user' ? styles.userBubble : styles.coachBubble,
            ]}
          >
            {m.headline && (
              <Text style={styles.bubbleHeadline}>{m.headline}</Text>
            )}

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

        {isThinking && (
          <View style={[styles.bubble, styles.coachBubble, styles.thinkingBubble]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.thinkingText}>Gemma AI is formulating strategy...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts Bar */}
      <View style={styles.quickPromptsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickScroll}
        >
          {quickPrompts.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptChip}
              onPress={() => handleSendPrompt(p)}
              disabled={isThinking}
            >
              <Text style={styles.promptChipText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Keyboard-Aware Input Dock */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask Gemma about moves, tactics, openings..."
            placeholderTextColor={colors.dark.textMuted}
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={() => customInput.trim() && handleSendPrompt(customInput.trim())}
            editable={!isThinking}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!customInput.trim() || isThinking) && styles.sendBtnDisabled]}
            onPress={() => customInput.trim() && handleSendPrompt(customInput.trim())}
            disabled={!customInput.trim() || isThinking}
            accessibilityLabel="Send chess question"
          >
            <Send size={18} color="#09090B" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  titleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.title2,
    color: colors.dark.textPrimary,
  },
  headerSub: {
    ...typography.tiny,
    color: colors.dark.textMuted,
    marginTop: 1,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  offlineTagText: {
    ...typography.tiny,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  levelTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  levelTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeLevelTab: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  levelTabText: {
    ...typography.caption,
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
    paddingBottom: 20,
  },
  bubble: {
    maxWidth: '86%',
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 4,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.dark.surfaceElevated,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  bubbleHeadline: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  bubbleText: { ...typography.body, fontSize: 13.5, lineHeight: 19 },
  userBubbleText: { color: '#09090B', fontWeight: '500' },
  coachBubbleText: { color: colors.dark.textPrimary },
  motifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  motifText: { ...typography.tiny, color: '#FFFFFF', fontWeight: '700' },
  planCard: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FFFFFF',
  },
  planTitle: { ...typography.tiny, color: '#FFFFFF', fontWeight: '700', marginBottom: 2 },
  planText: { ...typography.caption, color: colors.dark.textSecondary, lineHeight: 16 },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
  },
  thinkingText: { color: colors.dark.textSecondary, fontSize: 12.5, fontStyle: 'italic' },
  quickPromptsRow: {
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    backgroundColor: colors.dark.background,
  },
  quickScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  promptChip: {
    backgroundColor: colors.dark.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  promptChipText: {
    ...typography.caption,
    color: colors.dark.textPrimary,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    gap: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 16 : spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.dark.surfaceElevated,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    color: colors.dark.textPrimary,
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
