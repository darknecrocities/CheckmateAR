import React, { useId } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Platform,
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

export interface LiquidGlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  variant?: 'featured' | 'cube' | 'strategy' | 'spec' | 'default';
  causticPosition?: 'right' | 'corner' | 'center' | 'none';
  testID?: string;
}

/**
 * Apple-grade Glassmorphism container with fluid liquid refraction optics,
 * organic caustics, and specular meniscus edge highlights.
 */
export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  onPress,
  activeOpacity = 0.88,
  variant = 'default',
  causticPosition = 'right',
  testID,
}) => {
  const rawId = useId();
  const idPrefix = `lgc_${rawId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const sheenGradId = `${idPrefix}_sheen`;
  const waveGradId = `${idPrefix}_wave`;
  const causticGradId = `${idPrefix}_caustic`;
  const specularGradId = `${idPrefix}_specular`;

  // Caustic center based on variant/prop
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
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            {/* Ambient Frosted Translucent Glass Sheen */}
            <LinearGradient id={sheenGradId} x1="0.1" y1="0" x2="0.9" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.07} />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.02} />
              <Stop offset="100%" stopColor="#000000" stopOpacity={0.45} />
            </LinearGradient>

            {/* Flowing Liquid Wave Gradient */}
            <LinearGradient id={waveGradId} x1="0" y1="0.3" x2="1" y2="0.9">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.08} />
              <Stop offset="50%" stopColor="#A3A3A3" stopOpacity={0.03} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.09} />
            </LinearGradient>

            {/* Fluid Refractive Caustic Pool (Beneath 3D Pieces) */}
            <RadialGradient
              id={causticGradId}
              cx={causticCoords.cx}
              cy={causticCoords.cy}
              r={causticCoords.r}
            >
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.16} />
              <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.05} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>

            {/* Zenith Specular Lip Highlight */}
            <LinearGradient id={specularGradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.08} />
              <Stop offset="25%" stopColor="#FFFFFF" stopOpacity={0.4} />
              <Stop offset="75%" stopColor="#FFFFFF" stopOpacity={0.35} />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.05} />
            </LinearGradient>
          </Defs>

          {/* 1. Base Frosted Glass Fill */}
          <Rect x="0" y="0" width="100" height="100" fill={`url(#${sheenGradId})`} />

          {/* 2. Primary Fluid Liquid Wave */}
          <Path
            d="M 0,52 C 28,38 62,68 100,48 L 100,100 L 0,100 Z"
            fill={`url(#${waveGradId})`}
          />

          {/* 3. Secondary Micro Fluid Swell */}
          <Path
            d="M 0,72 C 32,84 68,64 100,76 L 100,100 L 0,100 Z"
            fill="#FFFFFF"
            fillOpacity={0.025}
          />

          {/* 4. Refractive Caustic Glow Blob */}
          {causticPosition !== 'none' && (
            <Circle
              cx={causticCoords.cx}
              cy={causticCoords.cy}
              r="34"
              fill={`url(#${causticGradId})`}
            />
          )}

          {/* 5. Liquid Meniscus Top Lip Highlight (Simulates Glass Edge Glint) */}
          <Path
            d="M 2,1.2 Q 50,0.5 98,1.2"
            stroke={`url(#${specularGradId})`}
            strokeWidth={1.4}
            strokeLinecap="round"
            fill="none"
          />

          {/* 6. Liquid Droplet Refraction Lens (Top-Left Specular Node) */}
          {variant !== 'spec' && (
            <>
              <Circle cx="8" cy="8" r="1.8" fill="#FFFFFF" fillOpacity={0.2} />
              <Circle cx="7.4" cy="7.4" r="0.6" fill="#FFFFFF" fillOpacity={0.55} />
            </>
          )}
        </Svg>
      </View>
    );
  };

  const containerStyle = [
    styles.glassBase,
    variant === 'cube' && styles.cubeContainer,
    variant === 'featured' && styles.featuredContainer,
    variant === 'strategy' && styles.strategyContainer,
    variant === 'spec' && styles.specContainer,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        activeOpacity={activeOpacity}
        onPress={onPress}
        testID={testID}
      >
        {renderLiquidOptics()}
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {renderLiquidOptics()}
      {children}
    </View>
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
