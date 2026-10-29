import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Scan } from 'lucide-react-native';
import { radii, spacing } from '../../theme/spacing';

interface ARScanningReticleProps {
  width: number;
  height: number;
  statusText?: string;
}

/**
 * Animated Scanning Viewfinder Reticle.
 * Displays when no chessboard is detected, avoiding fake/bias static AR overlays.
 */
export const ARScanningReticle: React.FC<ARScanningReticleProps> = ({
  width,
  height,
  statusText = 'Scanning for Chessboard...',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const boxSize = Math.min(width * 0.78, 320);
  const left = (width - boxSize) / 2;
  const top = height * 0.22;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: boxSize,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    scanLoop.start();

    return () => {
      pulseLoop.stop();
      scanLoop.stop();
    };
  }, [boxSize, pulseAnim, scanLineAnim]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Target Reticle Frame */}
      <Animated.View
        style={[
          styles.reticleWrap,
          {
            left,
            top,
            width: boxSize,
            height: boxSize,
            opacity: pulseAnim,
          },
        ]}
      >
        <Svg width={boxSize} height={boxSize} viewBox={`0 0 ${boxSize} ${boxSize}`}>
          {/* Corner Guides */}
          <Path
            d={`M 0 32 L 0 0 L 32 0`}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${boxSize - 32} 0 L ${boxSize} 0 L ${boxSize} 32`}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${boxSize} ${boxSize - 32} L ${boxSize} ${boxSize} L ${boxSize - 32} ${boxSize}`}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M 32 ${boxSize} L 0 ${boxSize} L 0 ${boxSize - 32}`}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Faint 8x8 Grid Preview Outline */}
          <Rect
            x="8"
            y="8"
            width={boxSize - 16}
            height={boxSize - 16}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
            strokeDasharray="6,6"
            fill="none"
          />
        </Svg>

        {/* Animated Scanning Laser Line */}
        <Animated.View
          style={[
            styles.scanLine,
            {
              width: boxSize - 16,
              transform: [{ translateY: scanLineAnim }],
            },
          ]}
        />
      </Animated.View>

      {/* Guidance Pill */}
      <View style={[styles.guidancePillWrap, { top: top + boxSize + 24 }]}>
        <View style={styles.guidancePill}>
          <Scan size={14} color="#FFFFFF" />
          <Text style={styles.guidanceTitle}>{statusText}</Text>
        </View>
        <Text style={styles.guidanceSub}>
          Align phone over physical chessboard or computer screen
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reticleWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    position: 'absolute',
    top: 8,
    left: 8,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  guidancePillWrap: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  guidancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(12, 12, 16, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  guidanceTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  guidanceSub: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
});
