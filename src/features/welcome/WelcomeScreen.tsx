import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Eye, Cpu, Crown, Sparkles } from 'lucide-react-native';

import { CheckmateLogo } from '../../components/branding/CheckmateLogo';
import { radii, spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const morphScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim]);

  const handleEnterArena = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.parallel([
      Animated.timing(morphScale, {
        toValue: 28,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  const featurePillars = [
    {
      icon: Eye,
      title: 'Dynamic AR Vision',
      desc: 'Point camera at any physical board or online screen for live piece detection.',
    },
    {
      icon: Cpu,
      title: 'Stockfish 18 Engine',
      desc: 'Offline deep calculations, perspective move vectors, and GM tactical plans.',
    },
    {
      icon: Crown,
      title: '3D Queen Mascot',
      desc: 'Tactile low-poly spatial mascot with Grandmaster motivational insights.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Morph Expanding Circle Portal */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.morphCircle,
          {
            transform: [{ scale: morphScale }],
          },
        ]}
      />

      {/* Main Animated Content */}
      <Animated.View style={[styles.contentWrap, { opacity: contentOpacity }]}>
        {/* Floating Two-Tone Logo with Ambient Glow */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              transform: [{ translateY: floatAnim }],
            },
          ]}
        >
          <View style={styles.glowRing} />
          <CheckmateLogo size={84} variant="badge" style={styles.logoBadge} />
        </Animated.View>

        {/* Headlines */}
        <View style={styles.headerWrap}>
          <View style={styles.tagRow}>
            <Sparkles size={13} color="#FFFFFF" />
            <Text style={styles.tagText}>SPATIAL CHESS INTELLIGENCE</Text>
          </View>
          <Text style={styles.title}>CHECKMATE AR</Text>
          <Text style={styles.subtitle}>
            Master every position with real-time dynamic edge vision and Grandmaster strategy.
          </Text>
        </View>

        {/* Value Pillars */}
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

        {/* Morph Action Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleEnterArena}
          activeOpacity={0.88}
          accessibilityLabel="Enter CheckmateAR"
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
  morphCircle: {
    position: 'absolute',
    bottom: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#09090B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 50,
  },
  contentWrap: {
    flex: 1,
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: spacing.md,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoBadge: {
    width: 104,
    height: 104,
    borderRadius: 26,
    backgroundColor: 'rgba(18, 18, 22, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  headerWrap: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    marginBottom: spacing.xs,
  },
  tagText: {
    color: '#D4D4D8',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 320,
  },
  pillarsContainer: {
    gap: 10,
    marginVertical: spacing.sm,
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 16, 20, 0.78)',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: spacing.md,
  },
  pillarIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
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
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pillarDesc: {
    color: '#71717A',
    fontSize: 11.5,
    fontWeight: '400',
    lineHeight: 15,
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: radii.pill,
    gap: spacing.sm,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaText: {
    color: '#09090B',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  ctaArrowWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(9, 9, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
