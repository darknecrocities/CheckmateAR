import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sparkles, Box } from 'lucide-react-native';
import { ChessPieceArtwork } from '../chess/ChessPieceArtwork';
import { KineticPressable } from '../ui/MotionPrimitives';
import { motion } from '../../theme/motion';
import { spacing, radii } from '../../theme/spacing';

interface MascotMaxim {
  badge: string;
  quote: string;
}

const GRANDMASTER_MAXIMS: MascotMaxim[] = [
  {
    badge: 'KNIGHT GUARD',
    quote: 'Control the center squares (d4, d5, e4, e5) before launching a flank attack.',
  },
  {
    badge: 'TACTICAL PULSE',
    quote: 'Scan every position for forcing moves first: Checks, Captures, and Threats.',
  },
  {
    badge: 'KUBBEL MOTIF',
    quote: 'A discovered check lets your front piece capture anything with impunity.',
  },
  {
    badge: '7TH RANK LAW',
    quote: 'Doubled Rooks on the 7th rank paralyze the opponent King and harvest pawns.',
  },
];

export interface KineticMascotCompanionProps {
  reactionTrigger?: string | number;
  onOpenMascotStudio: () => void;
}

/**
 * Interactive Living 3D Knight Mascot Companion that leaps and reacts kinetically
 * to user interactions, tab switches, and direct taps.
 */
export const KineticMascotCompanion: React.FC<KineticMascotCompanionProps> = ({
  reactionTrigger,
  onOpenMascotStudio,
}) => {
  const [maximIndex, setMaximIndex] = useState(0);
  const leapY = useRef(new Animated.Value(0)).current;
  const leapScale = useRef(new Animated.Value(1)).current;
  const spinVal = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(0.85)).current;

  // Continuous ambient halo ring breathing
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ringPulse, {
          toValue: 0.85,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ringPulse]);

  const triggerMascotLeap = (advanceQuote: boolean) => {
    if (advanceQuote) {
      setMaximIndex((prev) => (prev + 1) % GRANDMASTER_MAXIMS.length);
    }
    spinVal.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(leapY, {
          toValue: -12,
          ...motion.spring.mascotLeap,
          useNativeDriver: true,
        }),
        Animated.spring(leapY, {
          toValue: 0,
          ...motion.spring.bouncy,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.spring(leapScale, {
          toValue: 1.18,
          ...motion.spring.mascotLeap,
          useNativeDriver: true,
        }),
        Animated.spring(leapScale, {
          toValue: 1,
          ...motion.spring.bouncy,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(spinVal, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // React kinetically whenever parent tab/screen changes
  useEffect(() => {
    if (reactionTrigger !== undefined) {
      triggerMascotLeap(false);
    }
  }, [reactionTrigger]);

  const handleCompanionTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    triggerMascotLeap(true);
  };

  const rotateInterpolate = spinVal.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '-14deg', '0deg'],
  });

  const currentMaxim = GRANDMASTER_MAXIMS[maximIndex];

  return (
    <View style={styles.wrapper}>
      <KineticPressable
        style={styles.companionBar}
        scaleTo={0.97}
        hapticStyle="medium"
        onPress={handleCompanionTap}
        testID="kinetic-mascot-companion"
      >
        {/* Left: Animated 3D Knight Mascot Pod */}
        <View style={styles.avatarContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: ringPulse }],
              },
            ]}
          />
          <Animated.View
            style={{
              transform: [
                { translateY: leapY },
                { scale: leapScale },
                { rotate: rotateInterpolate },
              ],
            }}
          >
            <ChessPieceArtwork piece="n" size={44} color="white" showFadeTexture={false} />
          </Animated.View>
        </View>

        {/* Center: Cycling Grandmaster Maxim */}
        <View style={styles.textColumn}>
          <View style={styles.badgeRow}>
            <Sparkles size={10} color="#FFFFFF" />
            <Text style={styles.badgeText}>{currentMaxim.badge}</Text>
            <Text style={styles.tapHint}>• Tap Knight</Text>
          </View>
          <Text style={styles.quoteText} numberOfLines={2}>
            {currentMaxim.quote}
          </Text>
        </View>

        {/* Right: Quick 3D Studio Launch Pill */}
        <KineticPressable
          style={styles.studioPill}
          scaleTo={0.9}
          hapticStyle="light"
          onPress={onOpenMascotStudio}
          accessibilityLabel="Open 3D Mascot Studio"
        >
          <Box size={13} color="#000000" />
          <Text style={styles.studioPillText}>3D</Text>
        </KineticPressable>
      </KineticPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  companionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 24, 0.78)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 8,
    gap: spacing.sm,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tapHint: {
    color: '#737373',
    fontSize: 9,
    fontWeight: '600',
  },
  quoteText: {
    color: '#D4D4D4',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  studioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  studioPillText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
});
