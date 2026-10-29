import React, { useEffect, useId, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Polygon,
} from 'react-native-svg';
import { radii } from '../../theme/spacing';
import { KineticPressable } from './MotionPrimitives';

export interface LiquidGlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  variant?: 'featured' | 'cube' | 'strategy' | 'spec' | 'lightTutorial' | 'pedestal' | 'default';
  causticPosition?: 'right' | 'corner' | 'center' | 'none';
  staggerIndex?: number;
  scaleTo?: number;
  enableGlareSweep?: boolean;
  testID?: string;
}

/**
 * Kinetic Motion Liquid Glass Card with fluid refraction optics,
 * animated diagonal specular glare sweep, 3D press compression,
 * and optional 3D isometric pedestal stage (`variant="pedestal"` / `"cube"`).
 */
export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  causticPosition = 'right',
  staggerIndex,
  scaleTo,
  enableGlareSweep = true,
  testID,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const glareX = useRef(new Animated.Value(-160)).current;
  const rawId = useId();
  const idPrefix = `lgc_${rawId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const sheenGradId = `${idPrefix}_sheen`;
  const waveGradId = `${idPrefix}_wave`;
  const causticGradId = `${idPrefix}_caustic`;
  const specularGradId = `${idPrefix}_specular`;
  const lightGradId = `${idPrefix}_light`;

  const isLightCard = variant === 'lightTutorial';
  const hasPedestal = variant === 'pedestal' || variant === 'cube';

  const targetScale =
    scaleTo ??
    (variant === 'cube' || variant === 'pedestal' || variant === 'lightTutorial'
      ? 0.945
      : variant === 'featured'
      ? 0.96
      : 0.955);

  const triggerGlareSweep = (delayMs = 0) => {
    if (!enableGlareSweep) return;
    glareX.setValue(-160);
    Animated.timing(glareX, {
      toValue: 380,
      duration: 680,
      delay: delayMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const delay = (staggerIndex ?? 0) * 65 + 180;
    triggerGlareSweep(delay);
  }, [staggerIndex]);

  const handlePressState = (pressed: boolean) => {
    setIsPressed(pressed);
    if (pressed) {
      triggerGlareSweep(0);
    }
  };

  const causticCoords = (() => {
    switch (causticPosition) {
      case 'corner':
        return { cx: '88%', cy: '85%', r: '45%' };
      case 'center':
        return { cx: '50%', cy: '62%', r: '50%' };
      case 'right':
      default:
        return { cx: '82%', cy: '68%', r: '52%' };
    }
  })();

  const renderLiquidOptics = () => {
    const causticPeak = isPressed ? 0.24 : 0.12;
    const specularPeak = isPressed ? 0.65 : 0.32;

    if (isLightCard) {
      return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id={lightGradId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#F5FBF8" stopOpacity={1} />
                <Stop offset="55%" stopColor="#EBF7F1" stopOpacity={1} />
                <Stop offset="100%" stopColor="#E2F2EA" stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill={`url(#${lightGradId})`} />
            <Path
              d="M 52,0 C 66,35 78,65 100,82 L 100,0 Z"
              fill="#D4EDE0"
              fillOpacity={0.45}
            />
          </Svg>
        </View>
      );
    }

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={sheenGradId} x1="0.1" y1="0" x2="0.9" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isPressed ? 0.08 : 0.04} />
              <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.015} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0.35} />
            </LinearGradient>

            <LinearGradient id={waveGradId} x1="0" y1="0.3" x2="1" y2="0.9">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isPressed ? 0.09 : 0.04} />
              <Stop offset="50%" stopColor="#A3A3A3" stopOpacity={0.015} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={isPressed ? 0.1 : 0.05} />
            </LinearGradient>

            <RadialGradient
              id={causticGradId}
              cx={causticCoords.cx}
              cy={causticCoords.cy}
              r={causticCoords.r}
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={causticPeak} />
              <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.04} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>

            <LinearGradient id={specularGradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.05} />
              <Stop offset="30%" stopColor="#FFFFFF" stopOpacity={specularPeak} />
              <Stop offset="70%" stopColor="#FFFFFF" stopOpacity={specularPeak * 0.85} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.04} />
            </LinearGradient>
          </Defs>

          <Rect x="0" y="0" width="100" height="100" fill={`url(#${sheenGradId})`} />

          {/* 3D Isometric Pedestal Stage for Cube / Pedestal Cards (Matching Reference UI) */}
          {hasPedestal && (
            <>
              {/* Isometric Diamond Top Deck */}
              <Polygon
                points="50,62 86,75 50,88 14,75"
                fill="#1D1D22"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.6"
              />
              {/* Left Extruded Pedestal Wall */}
              <Polygon points="14,75 50,88 50,95 14,82" fill="#151519" />
              {/* Right Extruded Pedestal Wall */}
              <Polygon points="86,75 50,88 50,95 86,82" fill="#0E0E11" />
            </>
          )}

          {!hasPedestal && (
            <Path
              d="M 0,56 C 28,42 62,68 100,50 L 100,100 L 0,100 Z"
              fill={`url(#${waveGradId})`}
            />
          )}

          {causticPosition !== 'none' && (
            <Circle
              cx={causticCoords.cx}
              cy={causticCoords.cy}
              r={isPressed ? '38' : '32'}
              fill={`url(#${causticGradId})`}
            />
          )}

          <Path
            d="M 2,0.8 Q 50,0.4 98,0.8"
            stroke={`url(#${specularGradId})`}
            strokeWidth={isPressed ? 1.5 : 1.0}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        {enableGlareSweep && (
          <Animated.View
            style={[
              styles.glareBeam,
              {
                transform: [{ translateX: glareX }, { rotate: '22deg' }],
              },
            ]}
          />
        )}
      </View>
    );
  };

  const containerStyle = [
    styles.glassBase,
    isLightCard && styles.lightTutorialContainer,
    (variant === 'cube' || variant === 'pedestal') && styles.cubeContainer,
    variant === 'featured' && styles.featuredContainer,
    variant === 'strategy' && styles.strategyContainer,
    variant === 'spec' && styles.specContainer,
    isPressed && !isLightCard && styles.pressedGlassBorder,
    style,
  ];

  return (
    <KineticPressable
      style={containerStyle}
      scaleTo={targetScale}
      translateYTo={variant === 'cube' || variant === 'pedestal' ? 2.2 : 1.6}
      staggerIndex={staggerIndex}
      hapticStyle={onPress ? 'light' : 'selection'}
      onPress={onPress ?? (() => {})}
      onPressStateChange={handlePressState}
      testID={testID}
    >
      {renderLiquidOptics()}
      {children}
    </KineticPressable>
  );
};

const styles = StyleSheet.create({
  glassBase: {
    backgroundColor: '#121215',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.34,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  lightTutorialContainer: {
    backgroundColor: '#F2FAF6',
    borderColor: 'rgba(255, 255, 255, 0.9)',
    minHeight: 112,
    justifyContent: 'space-between',
  },
  pressedGlassBorder: {
    borderColor: 'rgba(255, 255, 255, 0.28)',
    backgroundColor: '#18181C',
  },
  glareBeam: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuredContainer: {
    minHeight: 155,
    justifyContent: 'center',
  },
  cubeContainer: {
    height: 172,
    justifyContent: 'space-between',
    backgroundColor: '#121215',
  },
  strategyContainer: {
    minHeight: 155,
  },
  specContainer: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#141418',
  },
});
