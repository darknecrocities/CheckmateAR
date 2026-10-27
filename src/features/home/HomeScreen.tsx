import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Zap } from 'lucide-react-native';

import { HomeStartTab } from './components/HomeStartTab';
import { HomeStrategyTab } from './components/HomeStrategyTab';
import { spacing, radii } from '../../theme/spacing';

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

  const handleTabSwitch = (tab: 'start' | 'strategy') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Row (Matching Reference Screen 1) */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <View style={styles.logoReticle} />
          </View>
          <Text style={styles.brandTitle}>CheckmateAR</Text>
        </View>

        <TouchableOpacity
          style={styles.powerPill}
          activeOpacity={0.85}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        >
          <Zap size={14} color="#000000" fill="#000000" />
          <Text style={styles.powerPillText}>Engine Max</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Dual-Pill Switcher: [ Start ] vs [ Strategy ] */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'start' && styles.activeSegmentBtn]}
          onPress={() => handleTabSwitch('start')}
          activeOpacity={0.85}
        >
          <Text style={[styles.segmentText, activeTab === 'start' && styles.activeSegmentText]}>
            Start
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'strategy' && styles.activeSegmentBtn]}
          onPress={() => handleTabSwitch('strategy')}
          activeOpacity={0.85}
        >
          <Text style={[styles.segmentText, activeTab === 'strategy' && styles.activeSegmentText]}>
            Strategy
          </Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#141414',
    borderRadius: radii.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: '#262626',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  activeSegmentBtn: {
    backgroundColor: '#FFFFFF',
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
    padding: spacing.md,
    paddingBottom: 110,
  },
});
