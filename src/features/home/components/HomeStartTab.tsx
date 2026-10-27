import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowRight, ShieldCheck } from 'lucide-react-native';
import { ChessPieceArtwork } from '../../../components/chess/ChessPieceArtwork';
import { spacing, radii } from '../../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUBE_CARD_WIDTH = (SCREEN_WIDTH - 40) / 2;

interface HomeStartTabProps {
  onStartScan: () => void;
  onOpenAnalysis: () => void;
  onOpenMascot: () => void;
  onOpenCoach: () => void;
}

export const HomeStartTab: React.FC<HomeStartTabProps> = ({
  onStartScan,
  onOpenAnalysis,
  onOpenMascot,
  onOpenCoach,
}) => {
  return (
    <>
      {/* Horizontal Featured Banner Card with Offset 3D Knight */}
      <Text style={styles.sectionHeader}>Featured System</Text>
      <TouchableOpacity
        style={styles.featuredCard}
        activeOpacity={0.88}
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

        {/* Offset 3D Knight Artwork with Fade Texture */}
        <View style={styles.offsetPieceWrap}>
          <ChessPieceArtwork piece="n" size={135} color="white" />
        </View>
      </TouchableOpacity>

      {/* 2-Column Cube Cards Grid (Matching Reference "My Last Work") */}
      <Text style={styles.sectionHeader}>Core Capabilities</Text>
      <View style={styles.cubeGrid}>
        {/* Cube Card 1: Live AR Scan */}
        <TouchableOpacity
          style={styles.cubeCard}
          activeOpacity={0.85}
          onPress={onStartScan}
        >
          <Text style={styles.cubeDate}>CameraX Stream</Text>
          <Text style={styles.cubeTitle}>AR Vision</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="b" size={82} color="white" />
          </View>
        </TouchableOpacity>

        {/* Cube Card 2: Deep Stockfish Analysis */}
        <TouchableOpacity
          style={styles.cubeCard}
          activeOpacity={0.85}
          onPress={onOpenAnalysis}
        >
          <Text style={styles.cubeDate}>Depth 14 Multi-PV</Text>
          <Text style={styles.cubeTitle}>Engine Spar</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="q" size={82} color="white" />
          </View>
        </TouchableOpacity>

        {/* Cube Card 3: 3D Mascot Studio */}
        <TouchableOpacity
          style={styles.cubeCard}
          activeOpacity={0.85}
          onPress={onOpenMascot}
        >
          <Text style={styles.cubeDate}>CAD Blueprint</Text>
          <Text style={styles.cubeTitle}>3D Mascot</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="n" size={82} color="white" />
          </View>
        </TouchableOpacity>

        {/* Cube Card 4: AI Tactical Coach */}
        <TouchableOpacity
          style={styles.cubeCard}
          activeOpacity={0.85}
          onPress={onOpenCoach}
        >
          <Text style={styles.cubeDate}>Grounded Mentor</Text>
          <Text style={styles.cubeTitle}>AI Coach</Text>
          <View style={styles.cubeOffsetPiece}>
            <ChessPieceArtwork piece="k" size={82} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Offline Guarantee Footer Banner */}
      <View style={styles.offlineCard}>
        <ShieldCheck size={18} color="#FFFFFF" />
        <View style={styles.offlineTextWrap}>
          <Text style={styles.offlineTitle}>100% On-Device Offline Privacy</Text>
          <Text style={styles.offlineSub}>
            Camera analysis and Stockfish engine run entirely local without network latency.
          </Text>
        </View>
      </View>
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
    backgroundColor: '#0F0F0F',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#262626',
    padding: spacing.lg,
    overflow: 'hidden',
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
    color: '#A3A3A3',
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
    height: 145,
    backgroundColor: '#0F0F0F',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#262626',
    padding: spacing.md,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cubeDate: {
    color: '#737373',
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
    backgroundColor: '#0A0A0A',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#1F1F1F',
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
