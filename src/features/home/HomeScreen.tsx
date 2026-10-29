import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sparkles, Box } from 'lucide-react-native';

import { HomeStartTab } from './components/HomeStartTab';
import { HomeStrategyTab } from './components/HomeStrategyTab';
import { ChessMascotBackground } from '../../components/mascot/ChessMascotBackground';
import { KineticPressable } from '../../components/ui/MotionPrimitives';
import { StrategyItem } from '../../services/chess/strategyLibrary';
import { motion } from '../../theme/motion';
import { spacing, radii } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_INNER_WIDTH = SCREEN_WIDTH - spacing.md * 2 - 8;
const SEGMENT_PILL_WIDTH = TRACK_INNER_WIDTH / 2;

interface HomeScreenProps {
  onStartScan: (fen?: string, title?: string) => void;
  onOpenAnalysis: (fen?: string) => void;
  onOpenCoach: (fen?: string) => void;
  onOpenMascot: () => void;
  onOpenHistory: () => void;
  onOpenTrainer?: (strategy?: StrategyItem) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartScan,
  onOpenAnalysis,
  onOpenCoach,
  onOpenMascot,
  onOpenHistory,
  onOpenTrainer,
}) => {
  const [activeTab, setActiveTab] = useState<'start' | 'strategy'>('start');
  const slideX = useRef(new Animated.Value(0)).current;

  const handleTabSwitch = (tab: 'start' | 'strategy') => {
    if (tab === activeTab) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);

    Animated.spring(slideX, {
      toValue: tab === 'start' ? 0 : SEGMENT_PILL_WIDTH,
      ...motion.spring.tabSlide,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 3D Chess Mascot Background (Transparent watermark behind cards) */}
      <ChessMascotBackground />

      {/* Glassmorphic Top App Bar */}
      <View style={styles.glassAppbar}>
        <KineticPressable
          style={styles.leftSquircleBadge}
          scaleTo={0.9}
          hapticStyle="light"
          onPress={onOpenMascot}
          accessibilityLabel="Open 3D Mascot Studio"
        >
          <Box size={18} color="#FFFFFF" />
        </KineticPressable>

        <Text style={styles.appbarTitle}>CheckmateAR</Text>

        <KineticPressable
          style={styles.blendedPowerAction}
          scaleTo={0.92}
          hapticStyle="medium"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            onStartScan();
          }}
          accessibilityLabel="Launch Full Power AR"
        >
          <Sparkles size={14} color="#60A5FA" />
          <Text style={styles.blendedPowerText}>AR Active</Text>
        </KineticPressable>
      </View>

      {/* Glassmorphic Dual-Pill Switcher: [ Start ] vs [ Strategy ] */}
      <View style={styles.segmentedContainer}>
        <Animated.View
          style={[
            styles.slidingIndicator,
            {
              width: SEGMENT_PILL_WIDTH,
              transform: [{ translateX: slideX }],
            },
          ]}
        />

        <TouchableOpacity
          style={styles.segmentBtn}
          onPress={() => handleTabSwitch('start')}
          activeOpacity={0.85}
        >
          <Text style={[styles.segmentText, activeTab === 'start' && styles.activeSegmentText]}>
            Start
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.segmentBtn}
          onPress={() => handleTabSwitch('strategy')}
          activeOpacity={0.85}
        >
          <Text style={[styles.segmentText, activeTab === 'strategy' && styles.activeSegmentText]}>
            Strategy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'start' ? (
          <HomeStartTab
            onStartScan={() => onStartScan()}
            onOpenAnalysis={() => onOpenAnalysis()}
            onOpenMascot={onOpenMascot}
            onOpenCoach={() => onOpenCoach()}
            onOpenTrainer={() => onOpenTrainer?.()}
            onOpenHistory={onOpenHistory}
            onSwitchToStrategy={() => handleTabSwitch('strategy')}
          />
        ) : (
          <HomeStrategyTab
            onAnalyzePosition={(fen) => onOpenAnalysis(fen)}
            onPracticeStrategy={(strat) => onOpenTrainer?.(strat)}
            onProjectInAR={(strat) => onStartScan(strat.fen, strat.title)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  glassAppbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(12, 12, 16, 0.78)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 10,
  },
  leftSquircleBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appbarTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  blendedPowerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  blendedPowerText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(18, 18, 22, 0.85)',
    borderRadius: radii.pill,
    padding: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
    zIndex: 10,
  },
  slidingIndicator: {
    position: 'absolute',
    top: 3.5,
    bottom: 3.5,
    left: 3.5,
    backgroundColor: '#EAF7F0',
    borderRadius: radii.pill,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
    zIndex: 2,
  },
  segmentText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '700',
  },
  activeSegmentText: {
    color: '#09090B',
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
    zIndex: 5,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 6,
    paddingBottom: 118,
  },
});
