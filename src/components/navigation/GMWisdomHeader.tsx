import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sparkles } from 'lucide-react-native';

import { CheckmateLogo } from '../branding/CheckmateLogo';
import { KineticPressable } from '../ui/MotionPrimitives';
import { GM_WISDOM_QUOTES, GMQuote } from '../../services/chess/gmWisdom';
import { spacing, radii } from '../../theme/spacing';

interface GMWisdomHeaderProps {
  onOpenMascot: () => void;
  onStartScan: () => void;
}

export const GMWisdomHeader: React.FC<GMWisdomHeaderProps> = ({
  onOpenMascot,
  onStartScan,
}) => {
  const [quoteIndex, setQuoteIndex] = useState<number>(() =>
    Math.floor(Math.random() * GM_WISDOM_QUOTES.length)
  );
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentQuote = GM_WISDOM_QUOTES[quoteIndex];

  const handleNextQuote = () => {
    Haptics.selectionAsync().catch(() => {});
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setQuoteIndex((prev) => (prev + 1 + Math.floor(Math.random() * (GM_WISDOM_QUOTES.length - 1))) % GM_WISDOM_QUOTES.length);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.headerContainer}>
      {/* Two-Tone Brand Icon */}
      <KineticPressable
        style={styles.logoBadge}
        scaleTo={0.9}
        hapticStyle="light"
        onPress={onOpenMascot}
        accessibilityLabel="Open 3D Mascot Studio"
      >
        <CheckmateLogo size={22} variant="icon" />
      </KineticPressable>

      {/* Textured GM Motivational Quote Pill */}
      <KineticPressable
        style={styles.quotePill}
        scaleTo={0.97}
        hapticStyle="selection"
        onPress={handleNextQuote}
        accessibilityLabel="Cycle Grandmaster Wisdom Quote"
      >
        <Animated.View style={[styles.quoteContent, { opacity: fadeAnim }]}>
          <Text style={styles.quoteText} numberOfLines={1}>
            "{currentQuote.quote}"
          </Text>
          <Text style={styles.authorText} numberOfLines={1}>
            — {currentQuote.author}
          </Text>
        </Animated.View>
      </KineticPressable>

      {/* AR Launch Power Action */}
      <KineticPressable
        style={styles.powerAction}
        scaleTo={0.92}
        hapticStyle="medium"
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          onStartScan();
        }}
        accessibilityLabel="Launch Full Power AR"
      >
        <Sparkles size={13} color="#FFFFFF" />
        <Text style={styles.powerActionText}>AR</Text>
      </KineticPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(12, 12, 16, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.sm,
    zIndex: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quotePill: {
    flex: 1,
    backgroundColor: 'rgba(22, 22, 28, 0.92)',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
  },
  quoteContent: {
    flexDirection: 'column',
  },
  quoteText: {
    color: '#F4F4F5',
    fontSize: 11.5,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: -0.2,
  },
  authorText: {
    color: '#A1A1AA',
    fontSize: 9.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  powerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  powerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
});
