import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Eye, Cpu, Bot, Sparkles } from 'lucide-react-native';
import { ThreeQueenMascot } from '../../components/mascot/ThreeQueenMascot';
import { CheckmateLogo } from '../../components/branding/CheckmateLogo';
import { radii, spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WelcomeScreenProps {
  onComplete: () => void;
}

/**
 * 3D Morphing Welcome Screen for CheckmateAR.
 * Features 3D spatial mesh with interactive touch-tilt, entrance fade-in,
 * and a smooth circular portal morphing transition on entry to the main arena.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  // Entrance fade-in and scale animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;

  // Interactive 3D tilt coordinates
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  // Exit morphing animations
  const morphScale = useRef(new Animated.Value(1)).current;
  const morphOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance Fade-In and Spring Scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtle 3D Floating Bobbing
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: -8,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    return () => floatLoop.stop();
  }, [fadeAnim, scaleAnim, logoFloatAnim]);

  // Touch gesture responder for interactive 3D piece tilting
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const factorX = Math.max(-15, Math.min(15, gestureState.dx / 10));
        const factorY = Math.max(-12, Math.min(12, gestureState.dy / 12));
        tiltX.setValue(factorX);
        tiltY.setValue(-factorY);
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(tiltX, { toValue: 0, friction: 6, useNativeDriver: true }),
          Animated.spring(tiltY, { toValue: 0, friction: 6, useNativeDriver: true }),
        ]).start();
      },
    })
  ).current;

  const handleEnterArena = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Circular morph portal expansion + content fade out
    Animated.parallel([
      Animated.timing(morphOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(morphScale, {
        toValue: 36,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  const featurePillars = [
    {
      icon: Eye,
      title: 'Unoccluded Strategy AR',
      desc: 'Transparent physical camera view with glowing 3D tactical vectors.',
    },
    {
      icon: Cpu,
      title: 'Stockfish 18 UCI Engine',
      desc: 'Real-time deep positional calculation and grandmaster move paths.',
    },
    {
      icon: Bot,
      title: 'Gemma AI Chess Coach',
      desc: 'Conversational mentor grounded in master theory, openings, and endgame.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Morph Expanding Portal */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.morphPortal,
          {
            opacity: morphOpacity,
            transform: [{ scale: morphScale }],
          },
        ]}
      />

      {/* Main Animated Surface */}
      <Animated.View
        style={[
          styles.contentWrap,
          {
            opacity: Animated.multiply(fadeAnim, contentOpacity),
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Top Header Pill with Badge */}
        <View style={styles.topBar}>
          <CheckmateLogo size={28} variant="icon" />
          <View style={styles.tagRow}>
            <Sparkles size={12} color="#FFFFFF" />
            <Text style={styles.tagText}>SPATIAL CHESS INTELLIGENCE</Text>
          </View>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleEnterArena}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* 3D Spatial Interactive Hero Section */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.hero3DContainer,
            {
              transform: [
                { translateY: logoFloatAnim },
                {
                  perspective: 600,
                },
                {
                  rotateY: tiltX.interpolate({
                    inputRange: [-15, 15],
                    outputRange: ['-14deg', '14deg'],
                  }),
                },
                {
                  rotateX: tiltY.interpolate({
                    inputRange: [-12, 12],
                    outputRange: ['-12deg', '12deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.heroAuraBackdrop} />
          <ThreeQueenMascot size={Math.min(SCREEN_WIDTH * 0.58, 220)} />
        </Animated.View>

        {/* Title and Strategic Subtext */}
        <View style={styles.headerWrap}>
          <Text style={styles.brandTitle}>CHECKMATE AR</Text>
          <Text style={styles.brandSubtitle}>
            Real-time holographic edge vision, Stockfish calculations, and Gemma AI master coaching.
          </Text>
        </View>

        {/* 3 Value Pillars */}
        <View style={styles.pillarsContainer}>
          {featurePillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <View key={idx} style={styles.pillarCard}>
                <View style={styles.pillarIconWrap}>
                  <Icon size={18} color="#FFFFFF" />
                </View>
                <View style={styles.pillarTextWrap}>
                  <Text style={styles.pillarTitle}>{item.title}</Text>
                  <Text style={styles.pillarDesc}>{item.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Morphing CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleEnterArena}
          activeOpacity={0.88}
          accessibilityLabel="Enter The Arena"
        >
          <Text style={styles.ctaText}>Enter The Arena</Text>
          <View style={styles.ctaArrowWrap}>
            <ArrowRight size={16} color="#09090B" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morphPortal: {
    position: 'absolute',
    bottom: 52,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#09090B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 50,
  },
  contentWrap: {
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  tagText: {
    color: '#D4D4D8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skipText: {
    color: '#A1A1AA',
    fontSize: 12.5,
    fontWeight: '600',
  },
  hero3DContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 190,
    position: 'relative',
  },
  heroAuraBackdrop: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerWrap: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  brandSubtitle: {
    color: '#A1A1AA',
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    maxWidth: 320,
  },
  pillarsContainer: {
    gap: 9,
    marginVertical: spacing.xs,
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 16, 20, 0.82)',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: spacing.md,
  },
  pillarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  pillarTextWrap: {
    flex: 1,
  },
  pillarTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pillarDesc: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14.5,
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: radii.pill,
    gap: spacing.sm,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaText: {
    color: '#09090B',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  ctaArrowWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(9, 9, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
