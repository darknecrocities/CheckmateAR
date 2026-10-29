import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import Svg, { Polygon, Line, Circle, Ellipse, G, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { RotateCw, Eye, Sparkles, Zap } from 'lucide-react-native';
import { KineticPressable } from '../ui/MotionPrimitives';
import { motion } from '../../theme/motion';
import { spacing, radii } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 32, 340);

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 3D Polygonal Mesh of "The Grandmaster Queen" Mascot
const QUEEN_VERTICES: Point3D[] = [
  // 0..7: Base ring (r=36, y=70)
  { x: 36.0, y: 70, z: 0.0 }, { x: 25.5, y: 70, z: 25.5 },
  { x: 0.0, y: 70, z: 36.0 }, { x: -25.5, y: 70, z: 25.5 },
  { x: -36.0, y: 70, z: 0.0 }, { x: -25.5, y: 70, z: -25.5 },
  { x: 0.0, y: 70, z: -36.0 }, { x: 25.5, y: 70, z: -25.5 },
  // 8..15: Pedestal collar (r=28, y=54)
  { x: 28.0, y: 54, z: 0.0 }, { x: 19.8, y: 54, z: 19.8 },
  { x: 0.0, y: 54, z: 28.0 }, { x: -19.8, y: 54, z: 19.8 },
  { x: -28.0, y: 54, z: 0.0 }, { x: -19.8, y: 54, z: -19.8 },
  { x: 0.0, y: 54, z: -28.0 }, { x: 19.8, y: 54, z: -19.8 },
  // 16..23: Waist torus (r=18, y=32)
  { x: 18.0, y: 32, z: 0.0 }, { x: 12.7, y: 32, z: 12.7 },
  { x: 0.0, y: 32, z: 18.0 }, { x: -12.7, y: 32, z: 12.7 },
  { x: -18.0, y: 32, z: 0.0 }, { x: -12.7, y: 32, z: -12.7 },
  { x: 0.0, y: 32, z: -18.0 }, { x: 12.7, y: 32, z: -12.7 },
  // 24..31: Bodice flare (r=24, y=8)
  { x: 24.0, y: 8, z: 0.0 }, { x: 17.0, y: 8, z: 17.0 },
  { x: 0.0, y: 8, z: 24.0 }, { x: -17.0, y: 8, z: 17.0 },
  { x: -24.0, y: 8, z: 0.0 }, { x: -17.0, y: 8, z: -17.0 },
  { x: 0.0, y: 8, z: -24.0 }, { x: 17.0, y: 8, z: -17.0 },
  // 32..39: Slender draped neck (r=16, y=-12)
  { x: 16.0, y: -12, z: 0.0 }, { x: 11.3, y: -12, z: 11.3 },
  { x: 0.0, y: -12, z: 16.0 }, { x: -11.3, y: -12, z: 11.3 },
  { x: -16.0, y: -12, z: 0.0 }, { x: -11.3, y: -12, z: -11.3 },
  { x: 0.0, y: -12, z: -16.0 }, { x: 11.3, y: -12, z: -11.3 },
  // 40..47: Coronet crown base (r=26, y=-28)
  { x: 26.0, y: -28, z: 0.0 }, { x: 18.4, y: -28, z: 18.4 },
  { x: 0.0, y: -28, z: 26.0 }, { x: -18.4, y: -28, z: 18.4 },
  { x: -26.0, y: -28, z: 0.0 }, { x: -18.4, y: -28, z: -18.4 },
  { x: 0.0, y: -28, z: -26.0 }, { x: 18.4, y: -28, z: -18.4 },
  // 48..55: Crown 8 royal spires (alternating y=-50 and y=-42, r=28)
  { x: 28.0, y: -50, z: 0.0 }, { x: 19.8, y: -42, z: 19.8 },
  { x: 0.0, y: -50, z: 28.0 }, { x: -19.8, y: -42, z: 19.8 },
  { x: -28.0, y: -50, z: 0.0 }, { x: -19.8, y: -42, z: -19.8 },
  { x: 0.0, y: -50, z: -28.0 }, { x: 19.8, y: -42, z: -19.8 },
  // 56: Imperial crown pearl finial apex
  { x: 0.0, y: -62.0, z: 0.0 },
];

const QUEEN_FACES: number[][] = [
  // Pedestal base
  [0, 1, 2, 3, 4, 5, 6, 7],
  // Ring quads
  [0, 1, 9, 8], [1, 2, 10, 9], [2, 3, 11, 10], [3, 4, 12, 11],
  [4, 5, 13, 12], [5, 6, 14, 13], [6, 7, 15, 14], [7, 0, 8, 15],
  [8, 9, 17, 16], [9, 10, 18, 17], [10, 11, 19, 18], [11, 12, 20, 19],
  [12, 13, 21, 20], [13, 14, 22, 21], [14, 15, 23, 22], [15, 8, 16, 23],
  [16, 17, 25, 24], [17, 18, 26, 25], [18, 19, 27, 26], [19, 20, 28, 27],
  [20, 21, 29, 28], [21, 22, 30, 29], [22, 23, 31, 30], [23, 16, 24, 31],
  [24, 25, 33, 32], [25, 26, 34, 33], [26, 27, 35, 34], [27, 28, 36, 35],
  [28, 29, 37, 36], [29, 30, 38, 37], [30, 31, 39, 38], [31, 24, 32, 39],
  [32, 33, 41, 40], [33, 34, 42, 41], [34, 35, 43, 42], [35, 36, 44, 43],
  [36, 37, 45, 44], [37, 38, 46, 45], [38, 39, 47, 46], [39, 32, 40, 47],
  // Crown spires
  [40, 48, 41], [41, 49, 42], [42, 50, 43], [43, 51, 44],
  [44, 52, 45], [45, 53, 46], [46, 54, 47], [47, 55, 40],
  // Pearl finial triangles
  [48, 49, 56], [49, 50, 56], [50, 51, 56], [51, 52, 56],
  [52, 53, 56], [53, 54, 56], [54, 55, 56], [55, 48, 56],
];

interface ChessMascot3DProps {
  onSpawnInAR?: () => void;
}

export const ChessMascot3D: React.FC<ChessMascot3DProps> = ({ onSpawnInAR }) => {
  const [rotY, setRotY] = useState<number>(0.45);
  const [rotX, setRotX] = useState<number>(-0.2);
  const [hoverPhase, setHoverPhase] = useState<number>(0);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const leapY = useRef(new Animated.Value(0)).current;
  const leapScale = useRef(new Animated.Value(1)).current;

  // Continuous Autonomous 3D Orbit & Breathing Levitation
  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setRotY((prev) => prev + 0.025);
      setHoverPhase((prev) => prev + 0.09);
    }, 32);

    return () => clearInterval(timer);
  }, [isDragging]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setIsDragging(true);
          Haptics.selectionAsync().catch(() => {});
        },
        onPanResponderMove: (_, gestureState) => {
          setRotY((prev) => prev + gestureState.vx * 0.08);
          setRotX((prev) => Math.max(-0.6, Math.min(0.6, prev - gestureState.vy * 0.06)));
        },
        onPanResponderRelease: () => setIsDragging(false),
        onPanResponderTerminate: () => setIsDragging(false),
      }),
    []
  );

  const hoverOffsetY = Math.sin(hoverPhase) * 6;
  const shadowRadiusX = 48 - Math.sin(hoverPhase) * 6;

  // 3D Rotation Matrix Projection
  const projectedFaces = useMemo(() => {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const center = CANVAS_SIZE / 2;
    const fov = 340;

    const rotated = QUEEN_VERTICES.map((v) => {
      const x1 = v.x * cosY + v.z * sinY;
      const z1 = -v.x * sinY + v.z * cosY;
      const y2 = (v.y + hoverOffsetY) * cosX - z1 * sinX;
      const z2 = (v.y + hoverOffsetY) * sinX + z1 * cosX;

      const scale = fov / (fov + z2 + 80);
      return {
        x: center + x1 * scale,
        y: center + y2 * scale,
        z: z2,
      };
    });

    return QUEEN_FACES.map((indices, faceIdx) => {
      const pts = indices.map((idx) => rotated[idx]);
      const avgZ = pts.reduce((sum, p) => sum + p.z, 0) / pts.length;
      return {
        faceIdx,
        points: pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
        avgZ,
      };
    }).sort((a, b) => b.avgZ - a.avgZ);
  }, [rotY, rotX, hoverOffsetY]);

  const snapRotate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRotY((prev) => prev + Math.PI / 2);
  };

  const triggerQueenAscent = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setRotY((prev) => prev + Math.PI);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(leapY, {
          toValue: -24,
          ...motion.spring.mascotLeap,
          useNativeDriver: true,
        }),
        Animated.spring(leapY, {
          toValue: 0,
          ...motion.spring.bouncy,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.spring(leapScale, {
          toValue: 1.09,
          ...motion.spring.mascotLeap,
          useNativeDriver: true,
        }),
        Animated.spring(leapScale, {
          toValue: 1,
          ...motion.spring.bouncy,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  return (
    <View style={styles.cardContainer}>
      {/* 3D Blueprint Viewport */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.viewport,
          {
            transform: [{ translateY: leapY }, { scale: leapScale }],
          },
        ]}
      >
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={StyleSheet.absoluteFill}>
          {[40, 90, 140, 190, 240, 290].map((coord) => (
            <Line
              key={`grid_x_${coord}`}
              x1={coord}
              y1={0}
              x2={coord}
              y2={CANVAS_SIZE}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={1}
            />
          ))}
          {[40, 90, 140, 190, 240, 290].map((coord) => (
            <Line
              key={`grid_y_${coord}`}
              x1={0}
              y1={coord}
              x2={CANVAS_SIZE}
              y2={coord}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={1}
            />
          ))}

          {/* Dynamic Levitation Shadow Ring under Pedestal */}
          <Ellipse
            cx={CANVAS_SIZE / 2}
            cy={CANVAS_SIZE * 0.78}
            rx={shadowRadiusX}
            ry={shadowRadiusX * 0.28}
            fill="rgba(255, 255, 255, 0.08)"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth={1}
          />

          {/* Render 3D Mascot Polygons */}
          {projectedFaces.map((f, i) => {
            const depthFactor = Math.max(0.15, Math.min(0.9, (f.avgZ + 60) / 120));
            const fillColor = isWireframe
              ? 'rgba(0, 0, 0, 0.5)'
              : `rgba(255, 255, 255, ${0.14 + depthFactor * 0.48})`;
            return (
              <Polygon
                key={`face_${f.faceIdx}_${i}`}
                points={f.points}
                fill={fillColor}
                stroke={isWireframe ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}
                strokeWidth={isWireframe ? 1.4 : 0.85}
              />
            );
          })}

          {/* Dimension Bounds Overlays */}
          <G stroke="#FFFFFF" strokeWidth={1} strokeDasharray="3 3">
            <Line x1={CANVAS_SIZE * 0.16} y1={CANVAS_SIZE * 0.12} x2={CANVAS_SIZE * 0.84} y2={CANVAS_SIZE * 0.12} />
            <Line x1={CANVAS_SIZE * 0.88} y1={CANVAS_SIZE * 0.14} x2={CANVAS_SIZE * 0.88} y2={CANVAS_SIZE * 0.86} />
          </G>

          {/* Dimension Labels */}
          <SvgText
            x={CANVAS_SIZE / 2}
            y={CANVAS_SIZE * 0.09}
            fill="#FFFFFF"
            fontSize={10}
            fontWeight="700"
            textAnchor="middle"
          >
            72 MM
          </SvgText>
          <SvgText
            x={CANVAS_SIZE * 0.94}
            y={CANVAS_SIZE / 2}
            fill="#FFFFFF"
            fontSize={10}
            fontWeight="700"
            textAnchor="middle"
          >
            180 MM
          </SvgText>

          {/* Corner Bounding Circles */}
          <Circle cx={CANVAS_SIZE * 0.16} cy={CANVAS_SIZE * 0.12} r={3} fill="#FFFFFF" />
          <Circle cx={CANVAS_SIZE * 0.84} cy={CANVAS_SIZE * 0.12} r={3} fill="#FFFFFF" />
          <Circle cx={CANVAS_SIZE * 0.88} cy={CANVAS_SIZE * 0.14} r={3} fill="#FFFFFF" />
          <Circle cx={CANVAS_SIZE * 0.88} cy={CANVAS_SIZE * 0.86} r={3} fill="#FFFFFF" />
        </Svg>

        {/* Top-Right 3D Orientation Cube Indicator */}
        <View style={styles.orientationCube}>
          <Text style={styles.cubeLabel}>{isDragging ? 'MANUAL ORBIT' : 'LIVE KINETIC 3D'}</Text>
        </View>
      </Animated.View>

      {/* Kinetic Control Actions Toolbar */}
      <View style={styles.toolbar}>
        <KineticPressable style={styles.toolBtn} scaleTo={0.9} hapticStyle="medium" onPress={triggerQueenAscent}>
          <Zap size={14} color="#FFFFFF" />
          <Text style={styles.toolBtnText}>Ascend</Text>
        </KineticPressable>

        <KineticPressable style={styles.toolBtn} scaleTo={0.9} hapticStyle="medium" onPress={snapRotate}>
          <RotateCw size={14} color="#FFFFFF" />
          <Text style={styles.toolBtnText}>Spin 90°</Text>
        </KineticPressable>

        <KineticPressable
          style={styles.toolBtn}
          scaleTo={0.9}
          hapticStyle="light"
          onPress={() => setIsWireframe((p) => !p)}
        >
          <Eye size={14} color="#FFFFFF" />
          <Text style={styles.toolBtnText}>{isWireframe ? 'Shaded' : 'Mesh'}</Text>
        </KineticPressable>

        {onSpawnInAR && (
          <KineticPressable
            style={[styles.toolBtn, styles.arBtn]}
            scaleTo={0.9}
            enablePulse
            hapticStyle="medium"
            onPress={onSpawnInAR}
          >
            <Sparkles size={14} color="#000000" />
            <Text style={[styles.toolBtnText, styles.arBtnText]}>View AR</Text>
          </KineticPressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(16, 16, 18, 0.8)',
    borderRadius: radii.xl,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    padding: spacing.md,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  viewport: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#050505',
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  orientationCube: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  cubeLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginTop: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 3,
    borderRadius: radii.md,
    backgroundColor: 'rgba(28, 28, 32, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  toolBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  arBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  arBtnText: {
    color: '#000000',
    fontWeight: '800',
  },
});
