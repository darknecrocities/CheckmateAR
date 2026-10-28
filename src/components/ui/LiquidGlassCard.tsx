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
} from 'react-native-svg';
import { radii } from '../../theme/spacing';
import { KineticPressable } from './MotionPrimitives';

export interface LiquidGlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  variant?: 'featured' | 'cube' | 'strategy' | 'spec' | 'default';
  causticPosition?: 'right' | 'corner' | 'center' | 'none';
  staggerIndex?: number;
  scaleTo?: number;
  enableGlareSweep?: boolean;
  testID?: string;
}

/**
 * Kinetic Motion Liquid Glass Card with fluid refraction optics,
 * animated diagonal specular glare sweep, 3D press compression,
 * and automatic 3D piece counter-parallax.
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

  const targetScale =
    scaleTo ?? (variant === 'cube' ? 0.935 : variant === 'featured' ? 0.96 : 0.955);

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

  // Initial staggered kinetic glare sweep on mount
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
        return { cx: '50%', cy: '50%', r: '50%' };
      case 'right':
      default:
        return { cx: '82%', cy: '68%', r: '52%' };
    }
  })();

  const renderLiquidOptics = () => {
    const causticPeak = isPressed ? 0.28 : 0.16;
    const specularPeak = isPressed ? 0.72 : 0.42;

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={sheenGradId} x1="0.1" y1="0" x2="0.9" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isPressed ? 0.12 : 0.07} />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.025} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0.45} />
            </LinearGradient>

            <LinearGradient id={waveGradId} x1="0" y1="0.3" x2="1" y2="0.9">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isPressed ? 0.13 : 0.08} />
              <Stop offset="50%" stopColor="#A3A3A3" stopOpacity={0.03} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={isPressed ? 0.15 : 0.09} />
            </LinearGradient>

            <RadialGradient
              id={causticGradId}
              cx={causticCoords.cx}
              cy={causticCoords.cy}
              r={causticCoords.r}
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={causticPeak} />
              <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.06} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>

            <LinearGradient id={specularGradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.08} />
              <Stop offset="25%" stopColor="#FFFFFF" stopOpacity={specularPeak} />
              <Stop offset="75%" stopColor="#FFFFFF" stopOpacity={specularPeak * 0.88} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.05} />
            </LinearGradient>
          </Defs>

          <Rect x="0" y="0" width="100" height="100" fill={`url(#${sheenGradId})`} />

          <Path
            d="M 0,52 C 28,38 62,68 100,48 L 100,100 L 0,100 Z"
            fill={`url(#${waveGradId})`}
          />

          <Path
            d="M 0,72 C 32,84 68,64 100,76 L 100,100 L 0,100 Z"
            fill="#FFFFFF"
            fillOpacity={isPressed ? 0.05 : 0.025}
          />

          {causticPosition !== 'none' && (
            <Circle
              cx={causticCoords.cx}
              cy={causticCoords.cy}
              r={isPressed ? '39' : '34'}
              fill={`url(#${causticGradId})`}
            />
          )}

          <Path
            d="M 2,1.2 Q 50,0.5 98,1.2"
            stroke={`url(#${specularGradId})`}
            strokeWidth={isPressed ? 1.9 : 1.4}
            strokeLinecap="round"
            fill="none"
          />

          {variant !== 'spec' && (
            <>
              <Circle cx="8" cy="8" r="1.8" fill="#FFFFFF" fillOpacity={isPressed ? 0.38 : 0.2} />
              <Circle cx="7.4" cy="7.4" r="0.6" fill="#FFFFFF" fillOpacity={0.65} />
            </>
          )}
        </Svg>

        {/* Kinetic Diagonal Specular Glare Sweep */}
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
    variant === 'cube' && styles.cubeContainer,
    variant === 'featured' && styles.featuredContainer,
    variant === 'strategy' && styles.strategyContainer,
    variant === 'spec' && styles.specContainer,
    isPressed && styles.pressedGlassBorder,
    style,
  ];

  return (
    <KineticPressable
      style={containerStyle}
      scaleTo={targetScale}
      translateYTo={variant === 'cube' ? 2.5 : 1.8}
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
    backgroundColor: 'rgba(16, 16, 18, 0.75)',
    borderRadius: radii.xl,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.38,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pressedGlassBorder: {
    borderColor: 'rgba(255, 255, 255, 0.34)',
    backgroundColor: 'rgba(24, 24, 28, 0.84)',
  },
  glareBeam: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  featuredContainer: {
    minHeight: 165,
    justifyContent: 'center',
  },
  cubeContainer: {
    height: 145,
    justifyContent: 'space-between',
  },
  strategyContainer: {
    minHeight: 155,
  },
  specContainer: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(18, 18, 20, 0.65)',
  },
});
