import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Camera,
  Play,
  History,
  Settings,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';

import { StudySession } from '../../types/study';
import { getAllStudySessions } from '../../services/storage/studyStorage';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface HomeScreenProps {
  onStartScan: () => void;
  onOpenAnalysis: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenSession: (session: StudySession) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartScan,
  onOpenAnalysis,
  onOpenHistory,
  onOpenSettings,
  onOpenSession,
}) => {
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    getAllStudySessions().then((list) => setRecentSessions(list.slice(0, 3)));
  }, []);

  const handleScanPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onStartScan();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <View style={styles.logoReticle} />
          </View>
          <Text style={styles.brandTitle}>CheckmateAR</Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenHistory} accessibilityLabel="History">
            <History size={20} color={colors.dark.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings} accessibilityLabel="Settings">
            <Settings size={20} color={colors.dark.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Offline Ready Guarantee Badge */}
        <View style={styles.offlineBanner}>
          <ShieldCheck size={16} color="#00E676" />
          <Text style={styles.offlineBannerText}>
            100% Offline • Local Stockfish & Computer Vision
          </Text>
        </View>

        {/* Hero Primary Action: Scan Chessboard */}
        <TouchableOpacity style={styles.heroCard} activeOpacity={0.88} onPress={handleScanPress}>
          <View style={styles.heroGlow} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconWrap}>
              <Camera size={32} color="#052312" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Scan Physical Board</Text>
              <Text style={styles.heroSubtitle}>
                Auto-detects tiles, pieces & color with live perspective AR move overlays
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Secondary Action: Virtual Board & Analysis */}
        <TouchableOpacity style={styles.secondaryCard} activeOpacity={0.85} onPress={onOpenAnalysis}>
          <View style={styles.secondaryIconWrap}>
            <Play size={20} color="#00E5FF" />
          </View>
          <View style={styles.secondaryTextWrap}>
            <Text style={styles.secondaryTitle}>Virtual Board & Analysis</Text>
            <Text style={styles.secondarySubtitle}>Setup positions, test what-if lines and explore candidate moves</Text>
          </View>
          <ChevronRight size={20} color={colors.dark.textMuted} />
        </TouchableOpacity>

        {/* Recent Study Sessions */}
        {recentSessions.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Study Sessions</Text>
              <TouchableOpacity onPress={onOpenHistory}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentList}>
              {recentSessions.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.sessionItem}
                  onPress={() => onOpenSession(s)}
                >
                  <View style={styles.sessionItemContent}>
                    <Text style={styles.sessionItemTitle}>{s.title}</Text>
                    <Text style={styles.sessionItemFen} numberOfLines={1}>{s.fen}</Text>
                  </View>
                  <ChevronRight size={18} color={colors.dark.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tactical Warmup Card */}
        <View style={styles.warmupCard}>
          <View style={styles.warmupHeader}>
            <Sparkles size={18} color="#FFD600" />
            <Text style={styles.warmupTitle}>Tactical Vision Warmup</Text>
          </View>
          <Text style={styles.warmupBody}>
            Ready for your match? Place your chessboard in good lighting with pieces aligned to square centers for 99%+ recognition confidence.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoReticle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.dark.accent,
  },
  brandTitle: {
    ...typography.title2,
    color: colors.dark.textPrimary,
  },
  topActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  offlineBannerText: {
    ...typography.tiny,
    color: '#00E676',
    fontWeight: '700',
  },
  heroCard: {
    position: 'relative',
    backgroundColor: colors.dark.accent,
    borderRadius: radii.xl,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  heroIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    ...typography.title1,
    color: '#052312',
    fontWeight: '800',
  },
  heroSubtitle: {
    ...typography.caption,
    color: '#09361C',
    marginTop: 4,
    lineHeight: 18,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceElevated,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: spacing.md,
  },
  secondaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryTextWrap: {
    flex: 1,
  },
  secondaryTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
  },
  secondarySubtitle: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  sectionWrap: {
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.dark.accent,
    fontWeight: '600',
  },
  recentList: {
    gap: spacing.sm,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceElevated,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  sessionItemContent: {
    flex: 1,
  },
  sessionItemTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
    fontSize: 14,
  },
  sessionItemFen: {
    ...typography.monoCoord,
    color: colors.dark.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  warmupCard: {
    backgroundColor: colors.dark.surface,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  warmupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  warmupTitle: {
    ...typography.headline,
    color: colors.dark.textPrimary,
  },
  warmupBody: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    lineHeight: 18,
  },
});
