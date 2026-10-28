import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ArrowRight, ShieldCheck } from 'lucide-react-native';
import { ChessPieceArtwork } from '../../../components/chess/ChessPieceArtwork';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import { spacing, radii } from '../../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUBE_CARD_WIDTH = (SCREEN_WIDTH - 40) / 2;

interface HomeStartTabProps {
  onStartScan: () => void;
  onOpenAnalysis: () => void;
  onOpenMascot: () => void;
  onOpenCoach: () => void;
  onOpenTrainer?: () => void;
  onOpenHistory?: () => void;
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
      {/* Horizontal Featured Banner Card with Liquid Glassmorphism & Offset 3D Knight */}
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
          <Text style={styles.featuredSub}>
            Continuous 60 FPS CameraX stream with 64-tile perspective and next-move prediction.
          </Text>
          <View style={styles.actionArrowRow}>
            <Text style={styles.actionArrowText}>Launch Camera</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </View>
        </View>

        {/* Offset 3D Knight Artwork with Fade Texture & Counter-Parallax */}
        <View style={styles.offsetPieceWrap}>
          <ChessPieceArtwork piece="n" size={135} color="white" floatDelay={0} />
        </View>
      </LiquidGlassCard>

      {/* 2-Column Kinetic Cube Cards Grid */}
      <Text style={styles.sectionHeader}>Core Capabilities</Text>
      <View style={styles.cubeGrid}>
        {/* Cube Card 1: Live AR Scan */}
        <LiquidGlassCard
          variant="cube"
          causticPosition="corner"
          staggerIndex={1}
          style={styles.cubeCard}
          onPress={onStartScan}
        >
          <Text style={styles.cubeDate}>CameraX Stream</Text>
          <Text style={styles.cubeTitle}>AR Vision</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="b" size={82} color="white" floatDelay={150} />
          </View>
        </LiquidGlassCard>

        {/* Cube Card 2: Deep Stockfish Analysis */}
        <LiquidGlassCard
          variant="cube"
          causticPosition="corner"
          staggerIndex={2}
          style={styles.cubeCard}
          onPress={onOpenAnalysis}
        >
          <Text style={styles.cubeDate}>Depth 14 Multi-PV</Text>
          <Text style={styles.cubeTitle}>Engine Spar</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="q" size={82} color="white" floatDelay={300} />
          </View>
        </LiquidGlassCard>

        {/* Cube Card 3: Interactive Tactical Puzzle Trainer */}
        <LiquidGlassCard
          variant="cube"
          causticPosition="corner"
          staggerIndex={3}
          style={styles.cubeCard}
          onPress={onOpenTrainer ?? onOpenAnalysis}
        >
          <Text style={styles.cubeDate}>Interactive ELO Drills</Text>
          <Text style={styles.cubeTitle}>Tactical Rush</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="r" size={82} color="white" floatDelay={450} />
          </View>
        </LiquidGlassCard>

        {/* Cube Card 4: 3D Mascot Studio */}
        <LiquidGlassCard
          variant="cube"
          causticPosition="corner"
          staggerIndex={4}
          style={styles.cubeCard}
          onPress={onOpenMascot}
        >
          <Text style={styles.cubeDate}>CAD Blueprint</Text>
          <Text style={styles.cubeTitle}>3D Mascot</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="n" size={82} color="white" floatDelay={600} />
          </View>
        </LiquidGlassCard>

        {/* Cube Card 5: AI Tactical Coach */}
        <LiquidGlassCard
          variant="cube"
          causticPosition="corner"
          staggerIndex={5}
          style={styles.cubeCard}
          onPress={onOpenCoach}
        >
          <Text style={styles.cubeDate}>Grounded Mentor</Text>
          <Text style={styles.cubeTitle}>AI Coach</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="k" size={82} color="white" floatDelay={750} />
          </View>
        </LiquidGlassCard>

        {/* Cube Card 6: Saved Match & Study Vault */}
        <LiquidGlassCard
          variant="cube"
          causticPosition="corner"
          staggerIndex={6}
          style={styles.cubeCard}
          onPress={onOpenHistory ?? onOpenAnalysis}
        >
          <Text style={styles.cubeDate}>Persistent Sessions</Text>
          <Text style={styles.cubeTitle}>Match Vault</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="p" size={82} color="white" floatDelay={900} />
          </View>
        </LiquidGlassCard>
      </View>

      {/* Offline Guarantee Footer Banner */}
      <LiquidGlassCard
        variant="default"
        causticPosition="none"
        staggerIndex={7}
        style={styles.offlineCard}
      >
        <ShieldCheck size={18} color="#FFFFFF" />
        <View style={styles.offlineTextWrap}>
          <Text style={styles.offlineTitle}>100% On-Device Offline Privacy</Text>
          <Text style={styles.offlineSub}>
            Camera analysis and Stockfish engine run entirely local without network latency.
          </Text>
        </View>
      </LiquidGlassCard>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    color: '#737373',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  featuredCard: {
    padding: spacing.lg,
    position: 'relative',
    minHeight: 165,
    justifyContent: 'center',
  },
  featuredContent: {
    width: '66%',
    gap: 6,
    zIndex: 2,
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radii.sm,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  featuredSub: {
    color: '#D4D4D4',
    fontSize: 11,
    lineHeight: 16,
  },
  actionArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  actionArrowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  offsetPieceWrap: {
    position: 'absolute',
    right: -15,
    bottom: -10,
    zIndex: 1,
  },
  cubeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cubeCard: {
    width: CUBE_CARD_WIDTH,
    padding: spacing.md,
    position: 'relative',
  },
  cubeDate: {
    color: '#A3A3A3',
    fontSize: 10,
    fontWeight: '600',
  },
  cubeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    zIndex: 2,
  },
  cubeOffsetPiece: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    zIndex: 1,
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  offlineTextWrap: {
    flex: 1,
    gap: 2,
  },
  offlineTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  offlineSub: {
    color: '#737373',
    fontSize: 10,
    lineHeight: 14,
  },
});
