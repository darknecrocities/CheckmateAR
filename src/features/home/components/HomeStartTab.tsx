import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { ChessPieceArtwork } from '../../../components/chess/ChessPieceArtwork';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import { spacing, radii } from '../../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2;

interface HomeStartTabProps {
  onStartScan: () => void;
  onOpenAnalysis: () => void;
  onOpenMascot: () => void;
  onOpenCoach: () => void;
  onOpenTrainer?: () => void;
  onOpenHistory?: () => void;
  onSwitchToStrategy?: () => void;
}

export const HomeStartTab: React.FC<HomeStartTabProps> = ({
  onStartScan,
  onOpenAnalysis,
  onOpenMascot,
  onOpenCoach,
  onOpenTrainer,
  onOpenHistory,
}) => {
  return (
    <>
      {/* Featured Card Section (Restored as requested) */}
      <Text style={styles.sectionHeader}>Featured System</Text>
      <LiquidGlassCard
        variant="featured"
        causticPosition="right"
        staggerIndex={0}
        style={styles.featuredCard}
        onPress={onStartScan}
      >
        <View style={styles.featuredContent}>
          <View style={styles.tagPill}>
            <Text style={styles.tagPillText}>Live AR Vision</Text>
          </View>
          <Text style={styles.featuredTitle}>Real-Time Board Tracking</Text>
          <View style={styles.actionArrowRow}>
            <Text style={styles.actionArrowText}>Launch Camera</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </View>
        </View>

        {/* 3D Knight Artwork */}
        <View style={styles.offsetPieceWrap} pointerEvents="none">
          <ChessPieceArtwork piece="n" size={130} color="white" floatDelay={0} />
        </View>
      </LiquidGlassCard>

      {/* 2-Column Clean Capability Cards (Zero dummy descriptions, zero '60 fps' text) */}
      <Text style={[styles.sectionHeader, styles.recentSectionHeader]}>Core Capabilities</Text>
      <View style={styles.pedestalGrid}>
        {/* Card 1: AR Vision */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={1}
          style={styles.pedestalCard}
          onPress={onStartScan}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardTitle}>AR Vision</Text>
          </View>
          <View style={styles.pedestalPieceWrap} pointerEvents="none">
            <ChessPieceArtwork piece="n" size={84} color="white" floatDelay={100} />
          </View>
        </LiquidGlassCard>

        {/* Card 2: Engine Spar */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={2}
          style={styles.pedestalCard}
          onPress={onOpenAnalysis}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardTitle}>Engine Spar</Text>
          </View>
          <View style={styles.pedestalPieceWrap} pointerEvents="none">
            <ChessPieceArtwork piece="q" size={84} color="white" floatDelay={200} />
          </View>
        </LiquidGlassCard>

        {/* Card 3: Tactical Rush */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={3}
          style={styles.pedestalCard}
          onPress={onOpenTrainer ?? onOpenAnalysis}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardTitle}>Tactical Rush</Text>
          </View>
          <View style={styles.pedestalPieceWrap} pointerEvents="none">
            <ChessPieceArtwork piece="r" size={84} color="white" floatDelay={300} />
          </View>
        </LiquidGlassCard>

        {/* Card 4: AI Coach */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={4}
          style={styles.pedestalCard}
          onPress={onOpenCoach}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardTitle}>AI Coach</Text>
          </View>
          <View style={styles.pedestalPieceWrap} pointerEvents="none">
            <ChessPieceArtwork piece="k" size={84} color="white" floatDelay={400} />
          </View>
        </LiquidGlassCard>

        {/* Card 5: 3D Mascot */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={5}
          style={styles.pedestalCard}
          onPress={onOpenMascot}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardTitle}>3D Mascot</Text>
          </View>
          <View style={styles.pedestalPieceWrap} pointerEvents="none">
            <ChessPieceArtwork piece="b" size={84} color="white" floatDelay={500} />
          </View>
        </LiquidGlassCard>

        {/* Card 6: Match Vault */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={6}
          style={styles.pedestalCard}
          onPress={onOpenHistory ?? onOpenAnalysis}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardTitle}>Match Vault</Text>
          </View>
          <View style={styles.pedestalPieceWrap} pointerEvents="none">
            <ChessPieceArtwork piece="p" size={84} color="white" floatDelay={600} />
          </View>
        </LiquidGlassCard>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    color: '#A1A1AA',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
    marginTop: 4,
  },
  recentSectionHeader: {
    marginTop: 18,
  },
  featuredCard: {
    padding: spacing.lg,
    position: 'relative',
    minHeight: 148,
    justifyContent: 'center',
    marginBottom: 6,
  },
  featuredContent: {
    width: '68%',
    gap: 8,
    zIndex: 2,
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  tagPillText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '800',
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  actionArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  actionArrowText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  offsetPieceWrap: {
    position: 'absolute',
    right: -12,
    bottom: -8,
    zIndex: 1,
  },
  pedestalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pedestalCard: {
    width: GRID_CARD_WIDTH,
    height: 154,
    padding: 14,
    position: 'relative',
  },
  cardMetaWrap: {
    zIndex: 2,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pedestalPieceWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
