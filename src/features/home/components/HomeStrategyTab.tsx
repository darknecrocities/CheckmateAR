import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight } from 'lucide-react-native';
import {
  StrategyCategory,
  StrategyItem,
  getStrategiesByCategory,
} from '../../../services/chess/strategyLibrary';
import { ChessPieceArtwork } from '../../../components/chess/ChessPieceArtwork';
import { spacing, radii } from '../../../theme/spacing';

interface HomeStrategyTabProps {
  onAnalyzePosition: (fen: string) => void;
}

export const HomeStrategyTab: React.FC<HomeStrategyTabProps> = ({ onAnalyzePosition }) => {
  const [strategyCategory, setStrategyCategory] = useState<StrategyCategory>('all');

  const filteredStrategies = getStrategiesByCategory(strategyCategory);

  const handleCategorySwitch = (cat: StrategyCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStrategyCategory(cat);
  };

  return (
    <>
      {/* Category Filter Horizontal Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {(['all', 'openings', 'tactics', 'middlegame', 'endgame'] as StrategyCategory[]).map(
          (cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                strategyCategory === cat && styles.activeCategoryPill,
              ]}
              onPress={() => handleCategorySwitch(cat)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  strategyCategory === cat && styles.activeCategoryPillText,
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* Strategy Cards List */}
      <View style={styles.strategyList}>
        {filteredStrategies.map((item: StrategyItem) => (
          <TouchableOpacity
            key={item.id}
            style={styles.strategyCard}
            activeOpacity={0.88}
            onPress={() => onAnalyzePosition(item.fen)}
          >
            <View style={styles.strategyContent}>
              <View style={styles.strategyBadgeRow}>
                <View style={styles.strategyCategoryBadge}>
                  <Text style={styles.strategyCategoryText}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.strategyWinRate}>{item.masterWinRate}</Text>
              </View>

              <Text style={styles.strategyTitle}>{item.title}</Text>
              <Text style={styles.strategyMoves}>{item.moves}</Text>
              <Text style={styles.strategyConcept}>{item.concept}</Text>

              <View style={styles.analyzeActionRow}>
                <Text style={styles.analyzeActionText}>Analyze Position</Text>
                <ChevronRight size={14} color="#FFFFFF" />
              </View>
            </View>

            {/* Offset 3D Chess Piece with Fade Texture */}
            <View style={styles.strategyOffsetPiece}>
              <ChessPieceArtwork piece={item.featuredPiece} size={100} color="white" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  categoryScroll: {
    marginVertical: spacing.xs,
  },
  categoryScrollContent: {
    gap: spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#262626',
  },
  activeCategoryPill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryPillText: {
    color: '#737373',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategoryPillText: {
    color: '#000000',
    fontWeight: '800',
  },
  strategyList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  strategyCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#262626',
    padding: spacing.md,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 155,
  },
  strategyContent: {
    width: '72%',
    gap: 4,
    zIndex: 2,
  },
  strategyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  strategyCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.sm,
  },
  strategyCategoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  strategyWinRate: {
    color: '#A3A3A3',
    fontSize: 10,
    fontWeight: '600',
  },
  strategyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  strategyMoves: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  strategyConcept: {
    color: '#A3A3A3',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  analyzeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  analyzeActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  strategyOffsetPiece: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
});
