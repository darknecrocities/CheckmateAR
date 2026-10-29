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
 * Ambient 3D Chess Mascot Background watermark.
 * Transparent background, zero interference with touches (`pointerEvents="none"`).
 */
export const ChessMascotBackground: React.FC = () => {
  const size = Math.min(SCREEN_WIDTH * 0.95, 380);

  return (
    <View style={styles.backgroundWrap} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          {/* Subtle Ambient Radial Glow */}
          <RadialGradient id="mascotAura" cx="50%" cy="45%" r="55%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.20" />
            <Stop offset="50%" stopColor="#1D4ED8" stopOpacity="0.07" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* 3D Knight Metallic Gradient */}
          <LinearGradient id="knightBody" x1="0.2" y1="0.1" x2="0.8" y2="0.9">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <Stop offset="35%" stopColor="#A1A1AA" stopOpacity="0.16" />
            <Stop offset="75%" stopColor="#27272A" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#09090B" stopOpacity="0.02" />
          </LinearGradient>

          {/* Visor / Eye Glow */}
          <LinearGradient id="visorGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {/* Ambient Aura */}
        <Circle cx="100" cy="95" r="90" fill="url(#mascotAura)" />

        {/* Sculpted Knight Silhouette */}
        <G stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1.2">
          {/* Mane and Head Arc */}
          <Path
            d="M 50,170 C 50,158 45,142 55,130 C 50,118 48,105 56,92 C 52,78 56,60 72,44 C 84,32 104,24 122,26 C 132,27 140,34 144,42 C 148,50 144,58 136,62 C 146,72 152,86 148,100 C 144,114 132,126 126,132 C 132,144 142,156 150,170 Z"
            fill="url(#knightBody)"
          />

          {/* Snout and Jaw */}
          <Path
            d="M 122,26 C 138,28 152,40 156,54 C 158,62 152,70 144,74 C 136,78 126,82 120,92 C 114,102 112,118 116,132"
            fill="none"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.5"
          />

          {/* Cyber Visor / Mascot Eye */}
          <Path
            d="M 112,52 L 132,58 L 126,64 L 108,58 Z"
            fill="url(#visorGlow)"
            stroke="#93C5FD"
            strokeWidth="1"
          />

          {/* Geometric Chest Plate Armor Lines */}
          <Path
            d="M 76,110 L 108,124 L 98,144 L 66,132 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.10)"
            strokeWidth="1"
          />

          {/* Pedestal Base */}
          <Path
            d="M 40,170 L 160,170 L 152,182 L 48,182 Z"
            fill="rgba(255, 255, 255, 0.05)"
            stroke="rgba(255, 255, 255, 0.14)"
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
