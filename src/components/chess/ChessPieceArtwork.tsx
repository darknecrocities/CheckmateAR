import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Rect,
} from 'react-native-svg';
import { PieceType } from '../../types/chess';

interface ChessPieceArtworkProps {
  piece: PieceType;
  size?: number;
  color?: 'white' | 'black' | 'silver';
  showFadeTexture?: boolean;
  style?: ViewStyle;
}

/**
 * High-fidelity 3D-shaded vector chess piece artwork with transparent background.
 * Optimized for card overlays, corner peeks, and radial fade textures.
 */
export const ChessPieceArtwork: React.FC<ChessPieceArtworkProps> = ({
  piece,
  size = 90,
  color = 'white',
  showFadeTexture = true,
  style,
}) => {
  const isDark = color === 'black';
  const gradId = `piece_grad_${piece}_${color}`;
  const fadeId = `fade_texture_${piece}_${color}`;

  // Primary body gradient
  const startColor = isDark ? '#404040' : '#FFFFFF';
  const midColor = isDark ? '#1C1C1C' : '#D4D4D4';
  const endColor = isDark ? '#0A0A0A' : '#737373';
  const strokeColor = isDark ? '#525252' : '#FFFFFF';

  return (
    <View style={[styles.container, { width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* 3D Directional Lighting Gradient */}
          <LinearGradient id={gradId} x1="0.2" y1="0.1" x2="0.8" y2="0.9">
            <Stop offset="0%" stopColor={startColor} stopOpacity="1" />
            <Stop offset="45%" stopColor={midColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={endColor} stopOpacity="1" />
          </LinearGradient>

          {/* Radial Fade Texture Shadow underneath */}
          <RadialGradient id={fadeId} cx="50%" cy="88%" r="45%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <Stop offset="60%" stopColor="#000000" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Ambient Radial Fade Shadow */}
        {showFadeTexture && (
          <Circle cx="50" cy="88" r="38" fill={`url(#${fadeId})`} />
        )}

        {/* Render 3D Piece Geometry */}
        <G stroke={strokeColor} strokeWidth={1.5} strokeLinejoin="round" fill={`url(#${gradId})`}>
          {piece === 'n' && (
            // Sculpted 3D Knight
            <Path
              d="M 24,84 L 76,84 C 76,80 72,76 68,74 C 68,64 74,54 74,44 C 74,32 64,22 52,18 C 50,14 44,12 40,14 C 40,18 42,22 40,24 C 36,24 28,30 26,38 C 24,44 26,50 32,54 C 28,58 22,64 22,74 C 22,78 20,82 24,84 Z"
            />
          )}

          {piece === 'k' && (
            // Sculpted 3D King with Imperial Cross
            <G>
              {/* Cross */}
              <Path d="M 48,12 L 52,12 L 52,16 L 56,16 L 56,19 L 52,19 L 52,24 L 48,24 L 48,19 L 44,19 L 44,16 L 48,16 Z" />
              {/* Crown */}
              <Path d="M 32,32 C 32,24 68,24 68,32 C 68,44 60,54 62,74 L 38,74 C 40,54 32,44 32,32 Z" />
              {/* Pedestal */}
              <Path d="M 26,84 L 74,84 L 70,74 L 30,74 Z" />
            </G>
          )}

          {piece === 'q' && (
            // Sculpted 3D Queen with Coronet
            <G>
              {/* Coronet Points */}
              <Circle cx="30" cy="24" r="3" />
              <Circle cx="50" cy="20" r="3.5" />
              <Circle cx="70" cy="24" r="3" />
              {/* Body */}
              <Path d="M 28,34 L 36,46 L 50,28 L 64,46 L 72,34 C 72,52 64,62 62,74 L 38,74 C 36,62 28,52 28,34 Z" />
              {/* Pedestal */}
              <Path d="M 24,84 L 76,84 L 70,74 L 30,74 Z" />
            </G>
          )}

          {piece === 'b' && (
            // Sculpted 3D Bishop with Mitre
            <G>
              {/* Top finial */}
              <Circle cx="50" cy="18" r="3" />
              {/* Mitre head with slash */}
              <Path d="M 38,36 C 36,24 64,24 62,36 C 62,48 58,56 58,74 L 42,74 C 42,56 38,48 38,36 Z" />
              {/* Mitre cut */}
              <Path d="M 46,32 L 54,42" stroke="#171717" strokeWidth={2} />
              {/* Base */}
              <Path d="M 28,84 L 72,84 L 68,74 L 32,74 Z" />
            </G>
          )}

          {piece === 'r' && (
            // Sculpted 3D Rook Castle Turret
            <G>
              {/* Crenellations */}
              <Path d="M 32,24 L 40,24 L 40,30 L 46,30 L 46,24 L 54,24 L 54,30 L 60,30 L 60,24 L 68,24 L 68,36 L 32,36 Z" />
              {/* Tower Body */}
              <Path d="M 36,36 L 64,36 L 62,74 L 38,74 Z" />
              {/* Base */}
              <Path d="M 28,84 L 72,84 L 68,74 L 32,74 Z" />
            </G>
          )}

          {piece === 'p' && (
            // Sculpted 3D Pawn
            <G>
              {/* Head */}
              <Circle cx="50" cy="28" r="10" />
              {/* Neck & Body */}
              <Path d="M 44,40 C 44,48 40,58 38,74 L 62,74 C 60,58 56,48 56,40 Z" />
              {/* Base */}
              <Path d="M 30,84 L 70,84 L 66,74 L 34,74 Z" />
            </G>
          )}
        </G>

        {/* Specular 3D Reflection Arc */}
        <Path
          d="M 36,34 C 42,26 58,26 64,34"
          stroke="#FFFFFF"
          strokeWidth={1.8}
          strokeOpacity={0.65}
          fill="none"
        />
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
