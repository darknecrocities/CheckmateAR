import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export interface CheckmateLogoProps {
  size?: number;
  variant?: 'badge' | 'icon' | 'standalone';
  style?: StyleProp<ViewStyle>;
}

/**
 * Premium Two-Tone Obsidian & Platinum App Logo for CheckmateAR.
 * Geometric Queen & Knight Coronet fused with spatial AR reticles.
 */
export const CheckmateLogo: React.FC<CheckmateLogoProps> = ({
  size = 40,
  variant = 'badge',
  style,
}) => {
  const isBadge = variant === 'badge';

  return (
    <View
      style={[
        styles.container,
        isBadge && styles.badgeWrap,
        isBadge && { width: size + 12, height: size + 12 },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <Defs>
          {/* Platinum Specular Gradient */}
          <LinearGradient id="logoPlatinum" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="50%" stopColor="#E4E4E7" stopOpacity="1" />
            <Stop offset="100%" stopColor="#A1A1AA" stopOpacity="1" />
          </LinearGradient>

          {/* Obsidian Body Gradient */}
          <LinearGradient id="logoObsidian" x1="0" y1="0" x2="0.8" y2="1">
            <Stop offset="0%" stopColor="#27272A" stopOpacity="1" />
            <Stop offset="60%" stopColor="#18181B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#09090B" stopOpacity="1" />
          </LinearGradient>

          {/* AR Hologram Cyan Highlight */}
          <LinearGradient id="logoGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#D4D4D8" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* 4 Precision Corner AR Reticles */}
        <Path d="M 5 15 V 5 H 15" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.85" />
        <Path d="M 49 5 H 59 V 15" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.85" />
        <Path d="M 59 49 V 59 H 49" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.85" />
        <Path d="M 15 59 H 5 V 49" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeOpacity="0.85" />

        {/* Base Pedestal with Perspective Bevel */}
        <Path
          d="M 14 50 H 50 L 46 55 H 18 Z"
          fill="url(#logoObsidian)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />

        {/* Geometric Queen Coronet Spire Wings */}
        <Path
          d="M 15 47 L 13 28 L 22 36 L 32 18 L 42 36 L 51 28 L 49 47 Z"
          fill="url(#logoPlatinum)"
          stroke="#09090B"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Center Knight Head Contour Overlay in Coronet */}
        <Path
          d="M 28 47 V 34 C 28 31 31 29 33 27 C 34 26 36 28 36 30 C 34 32 35 34 36 35 L 36 47 Z"
          fill="url(#logoObsidian)"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.45"
        />

        {/* Imperial Coronet Pearl Finials */}
        <Circle cx="13" cy="26" r="2.2" fill="#FFFFFF" />
        <Circle cx="22" cy="34" r="1.8" fill="#18181B" stroke="#FFFFFF" strokeWidth="1" />
        <Circle cx="32" cy="16" r="2.8" fill="#FFFFFF" stroke="#09090B" strokeWidth="1.2" />
        <Circle cx="42" cy="34" r="1.8" fill="#18181B" stroke="#FFFFFF" strokeWidth="1" />
        <Circle cx="51" cy="26" r="2.2" fill="#FFFFFF" />

        {/* Center Diamond AR Focal Crosshair */}
        <Circle cx="32" cy="38" r="2" fill="#FFFFFF" fillOpacity="0.9" />
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
