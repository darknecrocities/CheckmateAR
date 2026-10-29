import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { ThreeQueenMascot } from './ThreeQueenMascot';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Ambient 3D Queen Chess Mascot Background watermark.
 * Renders ThreeQueenMascot with studio PBR highlights and continuous kinetic hover.
 */
export const ChessMascotBackground: React.FC = () => {
  const size = Math.min(SCREEN_WIDTH * 0.95, 380);

  return (
    <View style={styles.backgroundWrap} pointerEvents="none">
      <ThreeQueenMascot size={size} />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundWrap: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.16,
    left: (SCREEN_WIDTH - Math.min(SCREEN_WIDTH * 0.95, 380)) / 2,
    zIndex: 1,
    opacity: 0.88,
  },
});
