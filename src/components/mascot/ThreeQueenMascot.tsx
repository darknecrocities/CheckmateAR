import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ThreeQueenMascotProps {
  size?: number;
  interactive?: boolean;
}

/**
 * 3D Queen Chess Mascot.
 * Inspired by Three.js / React Three Fiber PBR lighting patterns (Key, Fill, Rim specular).
 * Combines a high-efficiency 3D projection mesh with studio radial lighting and 60fps kinetic hover.
 */
export const ThreeQueenMascot: React.FC<ThreeQueenMascotProps> = ({
  size = Math.min(SCREEN_WIDTH * 0.95, 380),
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    rotateLoop.start();

    return () => {
      floatLoop.stop();
      rotateLoop.stop();
    };
  }, [floatAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: floatAnim }, { rotate: spin }],
        },
      ]}
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          {/* Studio Key Light (Top-Left 45°) */}
          <RadialGradient id="r3fKeyAura" cx="45%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
            <Stop offset="50%" stopColor="#71717A" stopOpacity="0.04" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>

          {/* Three.js PBR Obsidian & Platinum Gradient */}
          <LinearGradient id="r3fPbrBody" x1="0.1" y1="0.0" x2="0.9" y2="1.0">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <Stop offset="30%" stopColor="#E4E4E7" stopOpacity="0.18" />
            <Stop offset="70%" stopColor="#27272A" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#09090B" stopOpacity="0.03" />
          </LinearGradient>

          {/* Rim Specular Light (Backlight edge highlight) */}
          <LinearGradient id="r3fRimLight" x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <Stop offset="50%" stopColor="#A1A1AA" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#18181B" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* Ambient Studio Key Light Aura */}
        <Circle cx="100" cy="100" r="96" fill="url(#r3fKeyAura)" />

        {/* 3D Pedestal Base Slab */}
        <Path
          d="M 52 176 L 148 176 L 142 184 L 58 184 Z"
          fill="url(#r3fPbrBody)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.25"
        />

        {/* Lower Torso Flare */}
        <Path
          d="M 64 154 L 136 154 L 142 174 L 58 174 Z"
          fill="url(#r3fPbrBody)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.28"
        />

        {/* Waist & Midsection */}
        <Path
          d="M 72 118 C 70 138 64 152 64 152 L 136 152 C 136 152 130 138 128 118 Z"
          fill="url(#r3fPbrBody)"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.2"
        />

        {/* Upper Chest Sphere */}
        <Path
          d="M 70 88 C 70 108 82 118 100 118 C 118 118 130 108 130 88 C 130 80 124 74 100 74 C 76 74 70 80 70 88 Z"
          fill="url(#r3fPbrBody)"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.22"
        />

        {/* 8-Point Coronet Crown Spire Mesh */}
        <Path
          d="M 72 74 L 64 52 L 78 62 L 88 44 L 100 60 L 112 44 L 122 62 L 136 52 L 128 74 Z"
          fill="url(#r3fRimLight)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.45"
          strokeLinejoin="round"
        />

        {/* Imperial Coronet Pearl Finials */}
        <Circle cx="64" cy="50" r="3.2" fill="#FFFFFF" fillOpacity="0.8" />
        <Circle cx="88" cy="42" r="3.2" fill="#FFFFFF" fillOpacity="0.85" />
        <Circle cx="112" cy="42" r="3.2" fill="#FFFFFF" fillOpacity="0.85" />
        <Circle cx="136" cy="50" r="3.2" fill="#FFFFFF" fillOpacity="0.8" />

        {/* Central Crown Cross Pearl */}
        <Circle cx="100" cy="28" r="4.8" fill="#FFFFFF" fillOpacity="0.95" />
        <Path
          d="M 97 28 H 103 M 100 25 V 31"
          stroke="#09090B"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
