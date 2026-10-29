import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  G,
} from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Ambient 3D Queen Chess Mascot Background watermark.
 * Pure monochrome aesthetic, zero blue badges, transparent background (`pointerEvents="none"`).
 */
export const ChessMascotBackground: React.FC = () => {
  const size = Math.min(SCREEN_WIDTH * 0.95, 380);

  return (
    <View style={styles.backgroundWrap} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          {/* Subtle Ambient Monochrome Radial Glow */}
          <RadialGradient id="queenAura" cx="50%" cy="45%" r="55%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <Stop offset="45%" stopColor="#71717A" stopOpacity="0.04" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* 3D Queen Obsidian & Platinum Gradient */}
          <LinearGradient id="queenBody" x1="0.2" y1="0.1" x2="0.8" y2="0.9">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.26" />
            <Stop offset="35%" stopColor="#D4D4D8" stopOpacity="0.14" />
            <Stop offset="75%" stopColor="#27272A" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="#09090B" stopOpacity="0.02" />
          </LinearGradient>

          {/* Pearl & Crown Finial Gradient */}
          <LinearGradient id="pearlGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#71717A" stopOpacity="0.35" />
          </LinearGradient>
        </Defs>

        {/* Ambient Aura */}
        <Circle cx="100" cy="100" r="95" fill="url(#queenAura)" />

        {/* Sculpted Queen Chess Piece Silhouette */}
        <G stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1.2">
          {/* Main Queen Bodice and Flared Base */}
          <Path
            d="M 64,175 C 64,152 72,130 76,108 C 70,102 68,90 74,84 C 78,80 84,78 86,70 C 88,64 86,54 84,48 L 92,58 L 100,42 L 108,58 L 116,48 C 114,54 112,64 114,70 C 116,78 122,80 126,84 C 132,90 130,102 124,108 C 128,130 136,152 136,175 Z"
            fill="url(#queenBody)"
          />

          {/* Pedestal Base Tiers */}
          <Path
            d="M 52,175 L 148,175 L 142,185 L 58,185 Z"
            fill="rgba(255, 255, 255, 0.06)"
            stroke="rgba(255, 255, 255, 0.22)"
          />
          <Path
            d="M 60,165 L 140,165"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.4"
          />

          {/* Waist Torus Ring */}
          <Path
            d="M 74,116 C 84,120 116,120 126,116"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Royal Coronet Crown Base Ring */}
          <Path
            d="M 80,72 C 90,75 110,75 120,72"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Crown Spires & Jewels */}
          <Circle cx="84" cy="46" r="3.2" fill="url(#pearlGlow)" />
          <Circle cx="100" cy="38" r="4.2" fill="url(#pearlGlow)" />
          <Circle cx="116" cy="46" r="3.2" fill="url(#pearlGlow)" />

          {/* Imperial Apex Pearl Cross / Orb */}
          <Circle cx="100" cy="30" r="4.8" fill="url(#pearlGlow)" stroke="#FFFFFF" strokeWidth="0.8" />
          <Path
            d="M 100,22 L 100,27 M 97.5,24.5 L 102.5,24.5"
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundWrap: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.12,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
    opacity: 0.85,
  },
});
