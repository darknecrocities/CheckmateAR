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
      {/* Blended Minimal Appbar (Matching Reference Dashboard UI) */}
      <View style={styles.topHeader}>
        <KineticPressable
          style={styles.leftSquircleBadge}
          scaleTo={0.9}
          hapticStyle="light"
          onPress={onOpenMascot}
          accessibilityLabel="Open 3D Mascot Studio"
        >
          <Box size={18} color="#FFFFFF" />
        </KineticPressable>

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
          <Sparkles size={15} color="#FFFFFF" />
          <Text style={styles.blendedPowerText}>Full Power</Text>
        </KineticPressable>
      </View>

      {/* Simple Blended Dual-Pill Switcher: [ Start ] vs [ Strategy ] */}
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#000000',
  },
  leftSquircleBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#121215',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blendedPowerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  blendedPowerText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: 4,
    marginBottom: spacing.md,
    backgroundColor: '#0E0E11',
    borderRadius: radii.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: '#EAF7F0',
    borderRadius: radii.pill,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radii.pill,
    alignItems: 'center',
    zIndex: 2,
  },
  segmentText: {
    color: '#A1A1AA',
    fontSize: 13.5,
    fontWeight: '700',
  },
  activeSegmentText: {
    color: '#09090B',
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 2,
    paddingBottom: 118,
  },
});
