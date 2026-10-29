import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Circle,
} from 'react-native-svg';

export interface CheckmateAppIconProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * CheckmateAR App Icon Vector Representation.
 * 512x512 High-Contrast Obsidian & Platinum Squircle with AR Target Brackets.
 */
export const CheckmateAppIcon: React.FC<CheckmateAppIconProps> = ({
  size = 120,
  style,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Defs>
          {/* Deep Obsidian Squircle Background */}
          <LinearGradient id="iconBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#18181B" />
            <Stop offset="60%" stopColor="#0E0E11" />
            <Stop offset="100%" stopColor="#040405" />
          </LinearGradient>

          {/* Platinum Metallic Shading */}
          <LinearGradient id="iconPlatinum" x1="0.1" y1="0" x2="0.9" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="45%" stopColor="#E4E4E7" />
            <Stop offset="85%" stopColor="#A1A1AA" />
            <Stop offset="100%" stopColor="#71717A" />
          </LinearGradient>

          {/* Ambient Radial Spotlight */}
          <RadialGradient id="iconGlow" cx="50%" cy="40%" r="55%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.03" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Squircle Base with 1px Specular Border */}
        <Rect width="512" height="512" rx="116" fill="url(#iconBg)" />
        <Rect
          x="1"
          y="1"
          width="510"
          height="510"
          rx="115"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.22"
          fill="none"
        />

        {/* Ambient Center Glow */}
        <Circle cx="256" cy="240" r="210" fill="url(#iconGlow)" />

        {/* 2. AR Perspective Matrix Grid Lines (Subtle) */}
        <Path
          d="M 120 180 H 392 M 120 256 H 392 M 120 332 H 392"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeOpacity="0.12"
          strokeDasharray="6 8"
        />
        <Path
          d="M 180 120 V 392 M 256 120 V 392 M 332 120 V 392"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeOpacity="0.12"
          strokeDasharray="6 8"
        />

        {/* 3. High-Precision AR HUD Corner Brackets */}
        <Path d="M 80 150 V 80 H 150" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
        <Path d="M 362 80 H 432 V 150" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
        <Path d="M 432 362 V 432 H 362" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
        <Path d="M 150 432 H 80 V 362" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />

        {/* 4. Royal Crown Base Slab */}
        <Path
          d="M 136 380 H 376 L 350 412 H 162 Z"
          fill="#18181B"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeOpacity="0.75"
        />

        {/* 5. Geometric Imperial Queen & Knight Coronet */}
        <Path
          d="M 148 360 L 130 220 L 200 274 L 256 150 L 312 274 L 382 220 L 364 360 Z"
          fill="url(#iconPlatinum)"
          stroke="#09090B"
          strokeWidth="8"
          strokeLinejoin="round"
        />

        {/* Knight Inner Contour Profile */}
        <Path
          d="M 230 360 V 270 C 230 248 250 236 264 224 C 272 216 286 230 286 244 C 274 258 280 274 286 284 L 286 360 Z"
          fill="#18181B"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeOpacity="0.6"
        />

        {/* 6. Coronet Pearl Jewels */}
        <Circle cx="130" cy="208" r="16" fill="#FFFFFF" />
        <Circle cx="200" cy="262" r="14" fill="#18181B" stroke="#FFFFFF" strokeWidth="5" />
        <Circle cx="256" cy="136" r="20" fill="#FFFFFF" stroke="#09090B" strokeWidth="5" />
        <Circle cx="312" cy="262" r="14" fill="#18181B" stroke="#FFFFFF" strokeWidth="5" />
        <Circle cx="382" cy="208" r="16" fill="#FFFFFF" />

        {/* Center Spatial Diamond Reticle */}
        <Circle cx="256" cy="305" r="12" fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
