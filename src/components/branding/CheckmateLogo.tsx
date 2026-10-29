import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export interface CheckmateLogoProps {
  size?: number;
  variant?: 'badge' | 'icon' | 'standalone';
  style?: StyleProp<ViewStyle>;
}

/**
 * Two-Tone Monochrome App Logo for CheckmateAR.
 * High-contrast pure white (#FFFFFF) and deep obsidian (#09090B).
 */
export const CheckmateLogo: React.FC<CheckmateLogoProps> = ({
  size = 36,
  variant = 'badge',
  style,
}) => {
  const isBadge = variant === 'badge';

  return (
    <View
      style={[
        styles.container,
        isBadge && styles.badgeWrap,
        isBadge && { width: size + 10, height: size + 10 },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <Defs>
          <LinearGradient id="logoWhiteGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#D4D4D8" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="logoObsidianGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#27272A" stopOpacity="1" />
            <Stop offset="100%" stopColor="#09090B" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* 4-Corner AR Reticle Brackets */}
        <Path d="M4 14 V4 H14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
        <Path d="M50 4 H60 V14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
        <Path d="M60 50 V60 H50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
        <Path d="M14 60 H4 V50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />

        {/* Minimalist Geometric Queen Crown Base (Obsidian) */}
        <Path
          d="M16 45 H48 L45 52 H19 Z"
          fill="url(#logoObsidianGrad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Queen Coronet Body (Pure White) */}
        <Path
          d="M17 43 L14 26 L24 35 L32 20 L40 35 L50 26 L47 43 Z"
          fill="url(#logoWhiteGrad)"
          stroke="#09090B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Crown Pearl Finials */}
        <Circle cx="14" cy="24" r="2.5" fill="#FFFFFF" />
        <Circle cx="24" cy="33" r="2" fill="#09090B" stroke="#FFFFFF" strokeWidth="1" />
        <Circle cx="32" cy="18" r="3" fill="#FFFFFF" stroke="#09090B" strokeWidth="1" />
        <Circle cx="40" cy="33" r="2" fill="#09090B" stroke="#FFFFFF" strokeWidth="1" />
        <Circle cx="50" cy="24" r="2.5" fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
});
