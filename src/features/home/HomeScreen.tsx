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
import { Box, Sparkles } from 'lucide-react-native';

import { HomeStartTab } from './components/HomeStartTab';
import { HomeStrategyTab } from './components/HomeStrategyTab';
import { HomeVaultTab } from './components/HomeVaultTab';
import { AnimatedGMWisdomBanner } from '../../components/navigation/AnimatedGMWisdomBanner';
import { CheckmateLogo } from '../../components/branding/CheckmateLogo';
import { ChessMascotBackground } from '../../components/mascot/ChessMascotBackground';
import { KineticPressable } from '../../components/ui/MotionPrimitives';
import { StrategyItem } from '../../services/chess/strategyLibrary';
import { motion } from '../../theme/motion';
import { spacing, radii } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_INNER_WIDTH = SCREEN_WIDTH - spacing.md * 2 - 8;
const SEGMENT_PILL_WIDTH = TRACK_INNER_WIDTH / 3;

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
  const [activeTab, setActiveTab] = useState<'start' | 'strategy' | 'vault'>('start');
  const slideX = useRef(new Animated.Value(0)).current;

  const handleTabSwitch = (tab: 'start' | 'strategy' | 'vault') => {
    if (tab === activeTab) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);

    const targetX =
      tab === 'start' ? 0 : tab === 'strategy' ? SEGMENT_PILL_WIDTH : SEGMENT_PILL_WIDTH * 2;

    Animated.spring(slideX, {
      toValue: targetX,
      ...motion.spring.tabSlide,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 3D Chess Mascot Background (Transparent watermark behind cards) */}
      <ChessMascotBackground />

      {/* Borderless Floating Brand Row (No traditional boxy appbar) */}
      <View style={styles.floatingTopBar}>
        <View style={styles.brandGroup}>
          <CheckmateLogo size={24} variant="standalone" />
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>CHECKMATE</Text>
            <View style={styles.editionBadge}>
              <Text style={styles.editionText}>AR</Text>
            </View>
          </View>
        </View>

        <View style={styles.topActionsGroup}>
          {/* 3D Queen Mascot Studio Trigger */}
          <KineticPressable
            style={styles.mascotTriggerPill}
            scaleTo={0.92}
            hapticStyle="light"
            onPress={onOpenMascot}
            accessibilityLabel="Open 3D Queen Mascot Studio"
          >
            <Box size={13} color="#FFFFFF" />
            <Text style={styles.mascotTriggerText}>MASCOT</Text>
          </KineticPressable>

          {/* Instant AR Scan Action */}
          <KineticPressable
            style={styles.scanQuickTrigger}
            scaleTo={0.92}
            hapticStyle="medium"
            onPress={() => onStartScan()}
            accessibilityLabel="Instant AR Board Scan"
          >
            <Sparkles size={13} color="#09090B" />
            <Text style={styles.scanQuickText}>SCAN</Text>
          </KineticPressable>
        </View>
      </View>

      {/* Kinetic Animated Grandmaster Wisdom Banner (Directly on top of 3-pill tabs) */}
      <AnimatedGMWisdomBanner />

      {/* Glassmorphic 3-Pill Switcher: [ Start ] | [ Strategy ] | [ Vault ] */}
      <View style={styles.segmentedContainer}>
        <Animated.View
          pointerEvents="none"
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

        <TouchableOpacity
          style={styles.segmentBtn}
          onPress={() => handleTabSwitch('vault')}
          activeOpacity={0.85}
        >
          <Text style={[styles.segmentText, activeTab === 'vault' && styles.activeSegmentText]}>
            Vault
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
            onSwitchToVault={() => handleTabSwitch('vault')}
          />
        ) : activeTab === 'strategy' ? (
          <HomeStrategyTab
            onAnalyzePosition={(fen) => onOpenAnalysis(fen)}
            onPracticeStrategy={(strat) => onOpenTrainer?.(strat)}
            onProjectInAR={(strat) => onStartScan(strat.fen, strat.title)}
          />
        ) : (
          <HomeVaultTab
            onOpenAnalysis={(fen) => onOpenAnalysis(fen)}
            onProjectInAR={(fen, title) => onStartScan(fen, title)}
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
  floatingTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  editionBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  editionText: {
    color: '#09090B',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  topActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mascotTriggerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  mascotTriggerText: {
    color: '#D4D4D8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scanQuickTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scanQuickText: {
    color: '#09090B',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: 2,
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
    backgroundColor: '#FFFFFF',
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
    paddingTop: 4,
    paddingBottom: 118,
  },
});
