import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Quote, Sparkles } from 'lucide-react-native';

import { KineticPressable } from '../ui/MotionPrimitives';
import { GM_WISDOM_QUOTES, GMQuote } from '../../services/chess/gmWisdom';
import { spacing, radii } from '../../theme/spacing';

export interface AnimatedGMWisdomBannerProps {
  onQuoteChange?: (quote: GMQuote) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Animated Grandmaster Wisdom Banner.
 * Positioned directly above the [ Start | Strategy | Vault ] tab switcher.
 * Features a kinetic typewriter/streaming text reveal with blinking cursor,
 * smooth crossfade on cycle, tactile haptics, and pure monochrome styling.
 */
export const AnimatedGMWisdomBanner: React.FC<AnimatedGMWisdomBannerProps> = ({
  onQuoteChange,
  style,
}) => {
  const [quoteIndex, setQuoteIndex] = useState<number>(() =>
    Math.floor(Math.random() * GM_WISDOM_QUOTES.length)
  );
  const [displayedLength, setDisplayedLength] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [showCursor, setShowCursor] = useState<boolean>(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const currentQuote = GM_WISDOM_QUOTES[quoteIndex];
  const fullQuoteText = currentQuote.quote;

  // Kinetic Typewriter Effect
  useEffect(() => {
    setDisplayedLength(0);
    setIsTyping(true);
    setShowCursor(true);

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 1;
      setDisplayedLength(currentIndex);
      if (currentIndex >= fullQuoteText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20); // 20ms per character for responsive kinetic streaming

    return () => clearInterval(interval);
  }, [quoteIndex, fullQuoteText]);

  // Cursor Blinking Animation
  useEffect(() => {
    if (!isTyping) {
      const timer = setTimeout(() => setShowCursor(false), 800);
      return () => clearTimeout(timer);
    }
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 450);
    return () => clearInterval(blinkInterval);
  }, [isTyping]);

  const handleNextQuote = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});

    // If currently typing, fast-forward to full quote on first tap
    if (isTyping && displayedLength < fullQuoteText.length) {
      setDisplayedLength(fullQuoteText.length);
      setIsTyping(false);
      setShowCursor(false);
      return;
    }

    // Smooth dissolve and slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -4,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuoteIndex((prev) => {
        let nextIndex = Math.floor(Math.random() * GM_WISDOM_QUOTES.length);
        while (nextIndex === prev && GM_WISDOM_QUOTES.length > 1) {
          nextIndex = Math.floor(Math.random() * GM_WISDOM_QUOTES.length);
        }
        onQuoteChange?.(GM_WISDOM_QUOTES[nextIndex]);
        return nextIndex;
      });

      translateYAnim.setValue(4);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [isTyping, displayedLength, fullQuoteText, fadeAnim, translateYAnim, onQuoteChange]);

  const visibleText = fullQuoteText.slice(0, displayedLength);

  return (
    <KineticPressable
      style={[styles.container, style]}
      scaleTo={0.98}
      hapticStyle="selection"
      onPress={handleNextQuote}
      accessibilityRole="button"
      accessibilityLabel={`Grandmaster Quote: ${currentQuote.quote} by ${currentQuote.author}. Tap to cycle.`}
    >
      {/* Top Meta Line: Category Badge & Tap Prompt */}
      <View style={styles.metaRow}>
        <View style={styles.badgeLeft}>
          <Quote size={11} color="#A1A1AA" />
          <Text style={styles.badgeLabel}>GRANDMASTER WISDOM</Text>
        </View>
        <View style={styles.badgeRight}>
          <Sparkles size={10} color="#71717A" />
          <Text style={styles.shuffleHint}>TAP TO SHUFFLE</Text>
        </View>
      </View>

      {/* Main Kinetic Animated Quote Content */}
      <Animated.View
        style={[
          styles.contentWrap,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <Text style={styles.quoteText}>
          &ldquo;{visibleText}&rdquo;
          {showCursor && <Text style={styles.cursor}>|</Text>}
        </Text>

        <View style={styles.authorRow}>
          <View style={styles.gmTag}>
            <Text style={styles.gmTagText}>GM</Text>
          </View>
          <Text style={styles.authorText}>
            {currentQuote.author}
          </Text>
        </View>
      </Animated.View>
    </KineticPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(18, 18, 22, 0.78)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 10,
    paddingBottom: 11,
    paddingHorizontal: 14,
    marginHorizontal: spacing.md,
    marginBottom: 8,
    position: 'relative',
    zIndex: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
  },
  badgeLabel: {
    color: '#71717A',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  badgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    opacity: 0.8,
  },
  shuffleHint: {
    color: '#52525B',
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contentWrap: {
    gap: 6,
  },
  quoteText: {
    color: '#F4F4F5',
    fontSize: 13,
    lineHeight: 18.5,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: -0.15,
  },
  cursor: {
    color: '#FFFFFF',
    fontWeight: '300',
    fontSize: 13,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  gmTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 4,
    paddingHorizontal: 4.5,
    paddingVertical: 1,
  },
  gmTagText: {
    color: '#E4E4E7',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  authorText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
