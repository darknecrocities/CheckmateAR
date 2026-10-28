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
import { Zap } from 'lucide-react-native';

import { HomeStartTab } from './components/HomeStartTab';
import { HomeStrategyTab } from './components/HomeStrategyTab';
import { KineticMascotCompanion } from '../../components/mascot/KineticMascotCompanion';
import { KineticPressable } from '../../components/ui/MotionPrimitives';
import { motion } from '../../theme/motion';
import { spacing, radii } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_INNER_WIDTH = SCREEN_WIDTH - spacing.md * 2 - 8;
const SEGMENT_PILL_WIDTH = TRACK_INNER_WIDTH / 2;

interface HomeScreenProps {
  onStartScan: () => void;
  onOpenAnalysis: (fen?: string) => void;
  onOpenCoach: (fen?: string) => void;
  onOpenMascot: () => void;
  onOpenHistory: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartScan,
  onOpenAnalysis,
  onOpenCoach,
  onOpenMascot,
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
      {/* Top Header Row */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <View style={styles.logoReticle} />
          </View>
          <Text style={styles.brandTitle}>CheckmateAR</Text>
        </View>

        <KineticPressable
          style={styles.powerPill}
          scaleTo={0.9}
          hapticStyle="medium"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }}
        >
          <Zap size={14} color="#000000" fill="#000000" />
          <Text style={styles.powerPillText}>Engine Max</Text>
        </KineticPressable>
      </View>

      {/* Kinetic Sliding Dual-Pill Switcher: [ Start ] vs [ Strategy ] */}
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

      {/* Interactive Living 3D Knight Mascot Companion */}
      <KineticMascotCompanion
        reactionTrigger={activeTab}
        onOpenMascotStudio={onOpenMascot}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'start' ? (
          <HomeStartTab
            onStartScan={onStartScan}
            onOpenAnalysis={() => onOpenAnalysis()}
            onOpenMascot={onOpenMascot}
            onOpenCoach={() => onOpenCoach()}
          />
        ) : (
          <HomeStrategyTab onAnalyzePosition={(fen) => onOpenAnalysis(fen)} />
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
    paddingVertical: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoReticle: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 4,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  powerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  powerPillText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(20, 20, 24, 0.75)',
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: radii.pill,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radii.pill,
    alignItems: 'center',
    zIndex: 2,
  },
  segmentText: {
    color: '#737373',
    fontSize: 13,
    fontWeight: '700',
  },
  activeSegmentText: {
    color: '#000000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: 110,
  },
});
