import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowLeft, MoreHorizontal, Shield, Sparkles, Zap, Layers } from 'lucide-react-native';
import { ChessMascot3D } from '../../components/mascot/ChessMascot3D';
import { LiquidGlassCard } from '../../components/ui/LiquidGlassCard';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MascotScreenProps {
  onBack: () => void;
  onStartAR: () => void;
}

export const MascotScreen: React.FC<MascotScreenProps> = ({ onBack, onStartAR }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} accessibilityLabel="Back">
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>Grandmaster Knight</Text>
          <Text style={styles.headerSub}>Official 3D AR Mascot</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Options">
          <MoreHorizontal size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Interactive 3D Mascot Viewport */}
        <ChessMascot3D onSpawnInAR={onStartAR} />

        {/* Blueprint Specifications Grid with Liquid Glass Optics */}
        <Text style={styles.sectionHeader}>CAD Specifications</Text>
        <View style={styles.specsGrid}>
          <LiquidGlassCard variant="spec" causticPosition="corner" style={styles.specCard}>
            <Layers size={18} color="#D4D4D4" />
            <Text style={styles.specLabel}>Height Bounds</Text>
            <Text style={styles.specValue}>150 MM</Text>
          </LiquidGlassCard>
          <LiquidGlassCard variant="spec" causticPosition="corner" style={styles.specCard}>
            <Zap size={18} color="#D4D4D4" />
            <Text style={styles.specLabel}>Pedestal Diameter</Text>
            <Text style={styles.specValue}>70 MM</Text>
          </LiquidGlassCard>
          <LiquidGlassCard variant="spec" causticPosition="corner" style={styles.specCard}>
            <Shield size={18} color="#D4D4D4" />
            <Text style={styles.specLabel}>Tactical Role</Text>
            <Text style={styles.specValue}>Fork & Battery</Text>
          </LiquidGlassCard>
          <LiquidGlassCard variant="spec" causticPosition="corner" style={styles.specCard}>
            <Sparkles size={18} color="#D4D4D4" />
            <Text style={styles.specLabel}>Material Shading</Text>
            <Text style={styles.specValue}>Obsidian Ceramic</Text>
          </LiquidGlassCard>
        </View>

        {/* Tactical Mascot Bio with Liquid Meniscus Sheen */}
        <LiquidGlassCard variant="default" causticPosition="right" style={styles.bioCard}>
          <Text style={styles.bioTitle}>About The Knight</Text>
          <Text style={styles.bioText}>
            The only piece on the board capable of jumping over friendly and hostile lines.
            Sculpted with a sharp muzzle and flared crest, The Grandmaster Knight embodies the
            unconventional tactical strikes that define CheckmateAR's real-time engine analysis.
          </Text>
        </LiquidGlassCard>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: typography.headline.fontSize,
    fontWeight: '700',
  },
  headerSub: {
    color: '#737373',
    fontSize: 10,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 110,
  },
  sectionHeader: {
    color: '#A3A3A3',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  specCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    padding: spacing.md,
    gap: 4,
  },
  specLabel: {
    color: '#A3A3A3',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  specValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bioCard: {
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: 6,
  },
  bioTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bioText: {
    color: '#A3A3A3',
    fontSize: 12,
    lineHeight: 18,
  },
});
