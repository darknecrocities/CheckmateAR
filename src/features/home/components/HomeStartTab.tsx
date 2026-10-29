import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ChessPieceArtwork } from '../../../components/chess/ChessPieceArtwork';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import { spacing } from '../../../theme/spacing';

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
  onSwitchToStrategy,
}) => {
  return (
    <>
      {/* Top Row: 2 Side-by-Side Light Tutorial Cards (Matching Reference Dashboard UI) */}
      <Text style={styles.sectionHeader}>AR Tutorials</Text>
      <View style={styles.tutorialRow}>
        <LiquidGlassCard
          variant="lightTutorial"
          causticPosition="none"
          staggerIndex={0}
          style={styles.tutorialCard}
          onPress={onStartScan}
        >
          <Text style={styles.tutorialTitle}>Use AR Board &{'\n'}Segmentation</Text>
          <View style={styles.tutorialOffsetPiece}>
            <ChessPieceArtwork piece="n" size={74} color="black" floatDelay={0} />
          </View>
        </LiquidGlassCard>

        <LiquidGlassCard
          variant="lightTutorial"
          causticPosition="none"
          staggerIndex={1}
          style={styles.tutorialCard}
          onPress={onSwitchToStrategy ?? onOpenTrainer ?? onOpenAnalysis}
        >
          <Text style={styles.tutorialTitle}>How to Predict{'\n'}Moves Effectively</Text>
          <View style={styles.tutorialOffsetPiece}>
            <ChessPieceArtwork piece="q" size={74} color="black" floatDelay={180} />
          </View>
        </LiquidGlassCard>
      </View>

      {/* Bottom Section: 2-Column Dark Pedestal Cards (Matching "My Recent" Reference Layout) */}
      <Text style={[styles.sectionHeader, styles.recentSectionHeader]}>My Recent</Text>
      <View style={styles.pedestalGrid}>
        {/* Pedestal Card 1: Live AR Board Segmentation & YOLO */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={2}
          style={styles.pedestalCard}
          onPress={onStartScan}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardSubtitle}>YOLO11 • 60 FPS</Text>
            <Text style={styles.cardTitle}>AR Vision</Text>
          </View>
          <View style={styles.pedestalPieceWrap}>
            <ChessPieceArtwork piece="n" size={84} color="white" floatDelay={120} />
          </View>
        </LiquidGlassCard>

        {/* Pedestal Card 2: Deep Stockfish Engine */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={3}
          style={styles.pedestalCard}
          onPress={onOpenAnalysis}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardSubtitle}>Depth 14 Multi-PV</Text>
            <Text style={styles.cardTitle}>Engine Spar</Text>
          </View>
          <View style={styles.pedestalPieceWrap}>
            <ChessPieceArtwork piece="q" size={84} color="white" floatDelay={260} />
          </View>
        </LiquidGlassCard>

        {/* Pedestal Card 3: Interactive Tactical Trainer */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={4}
          style={styles.pedestalCard}
          onPress={onOpenTrainer ?? onOpenAnalysis}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardSubtitle}>25 GM Studies</Text>
            <Text style={styles.cardTitle}>Tactical Rush</Text>
          </View>
          <View style={styles.pedestalPieceWrap}>
            <ChessPieceArtwork piece="r" size={84} color="white" floatDelay={400} />
          </View>
        </LiquidGlassCard>

        {/* Pedestal Card 4: AI Tactical Coach */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={5}
          style={styles.pedestalCard}
          onPress={onOpenCoach}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardSubtitle}>Grounded Mentor</Text>
            <Text style={styles.cardTitle}>AI Coach</Text>
          </View>
          <View style={styles.pedestalPieceWrap}>
            <ChessPieceArtwork piece="k" size={84} color="white" floatDelay={540} />
          </View>
        </LiquidGlassCard>

        {/* Pedestal Card 5: 3D Mascot Studio */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={6}
          style={styles.pedestalCard}
          onPress={onOpenMascot}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardSubtitle}>360° CAD Orbit</Text>
            <Text style={styles.cardTitle}>3D Mascot</Text>
          </View>
          <View style={styles.pedestalPieceWrap}>
            <ChessPieceArtwork piece="b" size={84} color="white" floatDelay={680} />
          </View>
        </LiquidGlassCard>

        {/* Pedestal Card 6: Saved Match & Study Vault */}
        <LiquidGlassCard
          variant="pedestal"
          causticPosition="center"
          staggerIndex={7}
          style={styles.pedestalCard}
          onPress={onOpenHistory ?? onOpenAnalysis}
        >
          <View style={styles.cardMetaWrap}>
            <Text style={styles.cardSubtitle}>Offline PGN</Text>
            <Text style={styles.cardTitle}>Match Vault</Text>
          </View>
          <View style={styles.pedestalPieceWrap}>
            <ChessPieceArtwork piece="p" size={84} color="white" floatDelay={820} />
          </View>
        </LiquidGlassCard>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
    marginBottom: 10,
  },
  recentSectionHeader: {
    marginTop: 22,
  },
  tutorialRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tutorialCard: {
    width: GRID_CARD_WIDTH,
    padding: 14,
    height: 112,
    position: 'relative',
  },
  tutorialTitle: {
    color: '#09090B',
    fontSize: 14.5,
    fontWeight: '800',
    lineHeight: 19,
    letterSpacing: -0.2,
    width: '74%',
    zIndex: 2,
  },
  tutorialOffsetPiece: {
    position: 'absolute',
    right: -12,
    bottom: -10,
    zIndex: 1,
  },
  pedestalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pedestalCard: {
    width: GRID_CARD_WIDTH,
    height: 174,
    padding: 14,
    position: 'relative',
  },
  cardMetaWrap: {
    gap: 2,
    zIndex: 2,
  },
  cardSubtitle: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '600',
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
    bottom: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
