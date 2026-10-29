import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Search, Bookmark, PlayCircle, ArrowUpRight } from 'lucide-react-native';
import {
  StrategyCategory,
  StrategyItem,
  filterStrategies,
} from '../../../services/chess/strategyLibrary';
import {
  loadTrainerProfile,
  toggleStrategyBookmark,
} from '../../../services/storage/trainerStorage';
import { ChessPieceArtwork } from '../../../components/chess/ChessPieceArtwork';
import { LiquidGlassCard } from '../../../components/ui/LiquidGlassCard';
import { KineticPressable } from '../../../components/ui/MotionPrimitives';
import { StrategyInspectorModal } from './StrategyInspectorModal';
import { spacing, radii } from '../../../theme/spacing';

interface HomeStrategyTabProps {
  onAnalyzePosition: (fen: string) => void;
  onPracticeStrategy?: (strategy: StrategyItem) => void;
  onProjectInAR?: (strategy: StrategyItem, activeFen?: string) => void;
}

const CATEGORIES: StrategyCategory[] = [
  'all',
  'openings',
  'tactics',
  'attack',
  'middlegame',
  'endgame',
];

function formatPredictionArrowTag(uci?: string, keySquare?: string): string {
  if (uci && uci.length >= 4) {
    return `${uci.slice(0, 2).toUpperCase()} → ${uci.slice(2, 4).toUpperCase()}`;
  }
  return `TARGET ${(keySquare || 'e4').toUpperCase()}`;
}

export const HomeStrategyTab: React.FC<HomeStrategyTabProps> = ({
  onAnalyzePosition,
  onPracticeStrategy,
  onProjectInAR,
}) => {
  const [strategyCategory, setStrategyCategory] = useState<StrategyCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [inspectedStrategy, setInspectedStrategy] = useState<StrategyItem | null>(null);

  useEffect(() => {
    loadTrainerProfile().then((p) => setBookmarkedIds(p.bookmarkedStrategyIds));
  }, []);

  const filteredStrategies = filterStrategies({
    category: strategyCategory,
    query: searchQuery,
    bookmarkedIds,
    onlyBookmarked: onlySaved,
  });

  const handleCategorySwitch = (cat: StrategyCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setStrategyCategory(cat);
  };

  const handleToggleBookmark = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const updated = await toggleStrategyBookmark(id);
    setBookmarkedIds(updated.bookmarkedStrategyIds);
  };

  return (
    <>
      {/* Instant Search Bar & Saved Bookmarks Toggle */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Search size={14} color="#737373" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search 25 openings, sacrifices, endgames..."
            placeholderTextColor="#525252"
            style={styles.searchInput}
          />
        </View>

        <KineticPressable
          scaleTo={0.9}
          style={[styles.savedFilterBtn, onlySaved && styles.savedFilterBtnActive]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setOnlySaved((prev) => !prev);
          }}
          accessibilityLabel="Filter Bookmarked Strategies"
        >
          <Bookmark
            size={14}
            color={onlySaved ? '#09090B' : '#FFFFFF'}
            fill={onlySaved ? '#09090B' : 'none'}
          />
          <Text style={[styles.savedFilterText, onlySaved && styles.savedFilterTextActive]}>
            {bookmarkedIds.length}
          </Text>
        </KineticPressable>
      </View>

      {/* Category Filter Horizontal Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {CATEGORIES.map((cat) => (
          <KineticPressable
            key={cat}
            scaleTo={0.9}
            hapticStyle="selection"
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
          </KineticPressable>
        ))}
      </ScrollView>

      {/* Strategy Cards List with Prediction Arrow Indicator & Glare Sweep */}
      <View style={styles.strategyList}>
        {filteredStrategies.map((item: StrategyItem, idx: number) => {
          const isSaved = bookmarkedIds.includes(item.id);
          const arrowTag = formatPredictionArrowTag(item.uciMoves[0], item.keySquare);

          return (
            <LiquidGlassCard
              key={`${strategyCategory}_${item.id}`}
              variant="strategy"
              causticPosition="right"
              staggerIndex={idx}
              style={styles.strategyCard}
              onPress={() => setInspectedStrategy(item)}
            >
              <View style={styles.strategyContent}>
                <View style={styles.strategyBadgeRow}>
                  <View style={styles.strategyCategoryBadge}>
                    <Text style={styles.strategyCategoryText}>
                      {item.category.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.arrowPredBadge}>
                    <ArrowUpRight size={10} color="#10B981" />
                    <Text style={styles.arrowPredText}>{arrowTag}</Text>
                  </View>

                  <Text style={styles.strategyWinRate}>• {item.masterWinRate}</Text>
                </View>

                <Text style={styles.strategyTitle}>{item.title}</Text>
                <Text style={styles.strategyMoves}>{item.moves}</Text>
                <Text style={styles.strategyConcept} numberOfLines={2}>
                  {item.concept}
                </Text>

                <View style={styles.analyzeActionRow}>
                  <PlayCircle size={13} color="#10B981" />
                  <Text style={styles.analyzeActionText}>
                    Play with Move Prediction Arrow
                  </Text>
                  <ChevronRight size={14} color="#10B981" />
                </View>
              </View>

              {/* Top-Right Bookmark Button */}
              <View style={styles.bookmarkAnchor}>
                <KineticPressable
                  scaleTo={0.85}
                  style={styles.bookmarkBtn}
                  onPress={() => handleToggleBookmark(item.id)}
                  accessibilityLabel={`Bookmark ${item.title}`}
                >
                  <Bookmark
                    size={15}
                    color="#FFFFFF"
                    fill={isSaved ? '#FFFFFF' : 'none'}
                  />
                </KineticPressable>
              </View>

              {/* Offset 3D Chess Piece with Fade Texture & Counter-Parallax */}
              <View style={styles.strategyOffsetPiece}>
                <ChessPieceArtwork
                  piece={item.featuredPiece}
                  size={96}
                  color="white"
                  floatDelay={idx * 140}
                />
              </View>
            </LiquidGlassCard>
          );
        })}
      </View>

      {/* Interactive Step-by-Step Replayer Modal with Live Prediction Arrows */}
      <StrategyInspectorModal
        strategy={inspectedStrategy}
        visible={inspectedStrategy !== null}
        onClose={() => setInspectedStrategy(null)}
        onAnalyzeInEngine={onAnalyzePosition}
        onPracticeInTrainer={(strat) => {
          if (onPracticeStrategy) {
            onPracticeStrategy(strat);
          } else {
            onAnalyzePosition(strat.fen);
          }
        }}
        onProjectInAR={(strat, activeFen) => {
          onProjectInAR?.(strat, activeFen);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121215',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm + 2,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    paddingVertical: 0,
  },
  savedFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radii.lg,
    backgroundColor: '#121215',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  savedFilterBtnActive: {
    backgroundColor: '#EAF7F0',
    borderColor: '#EAF7F0',
  },
  savedFilterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  savedFilterTextActive: {
    color: '#09090B',
  },
  categoryScroll: {
    marginVertical: spacing.xs,
  },
  categoryScrollContent: {
    gap: spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: '#121215',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeCategoryPill: {
    backgroundColor: '#EAF7F0',
    borderColor: '#EAF7F0',
  },
  categoryPillText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategoryPillText: {
    color: '#09090B',
    fontWeight: '800',
  },
  strategyList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  strategyCard: {
    padding: spacing.md,
    position: 'relative',
    minHeight: 158,
  },
  strategyContent: {
    width: '75%',
    gap: 4,
    zIndex: 2,
  },
  strategyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strategyCategoryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.sm,
  },
  strategyCategoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  arrowPredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderRadius: radii.sm,
    borderWidth: 0.8,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  arrowPredText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  strategyWinRate: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '600',
  },
  strategyTitle: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    marginTop: 2,
  },
  strategyMoves: {
    color: '#E4E4E7',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  strategyConcept: {
    color: '#A1A1AA',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  analyzeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  analyzeActionText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  bookmarkAnchor: {
    position: 'absolute',
    top: spacing.sm + 2,
    right: spacing.sm + 2,
    zIndex: 4,
  },
  bookmarkBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strategyOffsetPiece: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
  },
});
