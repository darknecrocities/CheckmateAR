import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, TouchableOpacity } from 'react-native';
import Svg, { Polygon, Line, Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { RotateCw, Eye, Sparkles, RefreshCw } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 32, 340);

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 3D Polygonal Mesh of "The Grandmaster Knight" Mascot
const KNIGHT_VERTICES: Point3D[] = [
  // Pedestal base ring
  { x: -35, y: 70, z: -35 }, { x: 35, y: 70, z: -35 },
  { x: 35, y: 70, z: 35 }, { x: -35, y: 70, z: 35 },
  // Lower pedestal neck
  { x: -25, y: 50, z: -25 }, { x: 25, y: 50, z: -25 },
  { x: 25, y: 50, z: 25 }, { x: -25, y: 50, z: 25 },
  // Chest / Shoulder arch
  { x: -28, y: 15, z: -20 }, { x: 28, y: 15, z: -20 },
  { x: 28, y: 15, z: 25 }, { x: -28, y: 15, z: 25 },
  // Neck arch
  { x: -20, y: -20, z: -15 }, { x: 20, y: -20, z: -15 },
  { x: 20, y: -20, z: 20 }, { x: -20, y: -20, z: 20 },
  // Snout forward projection
  { x: -14, y: -30, z: 38 }, { x: 14, y: -30, z: 38 },
  { x: 14, y: -18, z: 32 }, { x: -14, y: -18, z: 32 },
  // Crest / Mane ridge
  { x: -12, y: -55, z: -10 }, { x: 12, y: -55, z: -10 },
  // Left & Right Ears
  { x: -14, y: -65, z: 5 }, { x: 14, y: -65, z: 5 },
];

const KNIGHT_FACES: number[][] = [
  // Base
  [0, 1, 2, 3],
  [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0],
  // Body to Neck
  [4, 8, 9, 5], [5, 9, 10, 6], [6, 10, 11, 7], [7, 11, 8, 4],
  // Neck to Head
  [8, 12, 13, 9], [9, 13, 14, 10], [10, 14, 15, 11], [11, 15, 12, 8],
  // Snout
  [14, 16, 17, 15], [16, 18, 19, 17],
  // Crest & Ears
  [12, 20, 21, 13], [20, 22, 23, 21],
];

interface ChessMascot3DProps {
  onSpawnInAR?: () => void;
}

export const ChessMascot3D: React.FC<ChessMascot3DProps> = ({ onSpawnInAR }) => {
  const [rotY, setRotY] = useState<number>(0.4);
  const [rotX, setRotX] = useState<number>(-0.2);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          setRotY((prev) => prev + gestureState.vx * 0.08);
          setRotX((prev) => Math.max(-0.6, Math.min(0.6, prev - gestureState.vy * 0.06)));
        },
      }),
    []
  );

  // 3D Rotation Matrix Projection
  const projectedFaces = useMemo(() => {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const center = CANVAS_SIZE / 2;
    const fov = 340;

    const rotated = KNIGHT_VERTICES.map((v) => {
      // Rotate Y
      const x1 = v.x * cosY + v.z * sinY;
      const z1 = -v.x * sinY + v.z * cosY;
      // Rotate X
      const y2 = v.y * cosX - z1 * sinX;
      const z2 = v.y * sinX + z1 * cosX;

      const scale = fov / (fov + z2 + 80);
      return {
        x: center + x1 * scale,
        y: center + y2 * scale,
        z: z2,
      };
    });

    return KNIGHT_FACES.map((indices, faceIdx) => {
      const pts = indices.map((idx) => rotated[idx]);
      const avgZ = pts.reduce((sum, p) => sum + p.z, 0) / pts.length;
      return {
        faceIdx,
        points: pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
        avgZ,
      };
    }).sort((a, b) => b.avgZ - a.avgZ);
  }, [rotY, rotX]);

  const snapRotate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRotY((prev) => prev + Math.PI / 2);
  };

  const resetOrbit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRotY(0.4);
    setRotX(-0.2);
  };

  return (
    <View style={styles.cardContainer}>
      {/* 3D Blueprint Viewport */}
      <View {...panResponder.panHandlers} style={styles.viewport}>
        {/* Subtle Isometric Grid Texture */}
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

          {/* Render 3D Mascot Polygons */}
          {projectedFaces.map((f, i) => {
            const depthFactor = Math.max(0.15, Math.min(0.9, (f.avgZ + 60) / 120));
            const fillColor = isWireframe
              ? 'rgba(0, 0, 0, 0.5)'
              : `rgba(255, 255, 255, ${0.12 + depthFactor * 0.45})`;
            return (
              <Polygon
                key={`face_${f.faceIdx}_${i}`}
                points={f.points}
                fill={fillColor}
                stroke={isWireframe ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)'}
                strokeWidth={isWireframe ? 1.4 : 0.8}
              />
            );
          })}

          {/* Dimension Bounds Overlays (Matching Reference Screen 2) */}
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
            75 MM
          </SvgText>
          <SvgText
            x={CANVAS_SIZE * 0.94}
            y={CANVAS_SIZE / 2}
            fill="#FFFFFF"
            fontSize={10}
            fontWeight="700"
            textAnchor="middle"
          >
            150 MM
          </SvgText>

          {/* Corner Bounding Circles */}
          <Circle cx={CANVAS_SIZE * 0.16} cy={CANVAS_SIZE * 0.12} r={3} fill="#FFFFFF" />
          <Circle cx={CANVAS_SIZE * 0.84} cy={CANVAS_SIZE * 0.12} r={3} fill="#FFFFFF" />
          <Circle cx={CANVAS_SIZE * 0.88} cy={CANVAS_SIZE * 0.14} r={3} fill="#FFFFFF" />
          <Circle cx={CANVAS_SIZE * 0.88} cy={CANVAS_SIZE * 0.86} r={3} fill="#FFFFFF" />
        </Svg>

        {/* Top-Right 3D Orientation Cube Indicator */}
        <View style={styles.orientationCube}>
          <Text style={styles.cubeLabel}>3D ORBIT</Text>
        </View>
      </View>

      {/* Control Actions Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={snapRotate}>
          <RotateCw size={15} color="#FFFFFF" />
          <Text style={styles.toolBtnText}>Rotate 90°</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={() => setIsWireframe((p) => !p)}>
          <Eye size={15} color="#FFFFFF" />
          <Text style={styles.toolBtnText}>{isWireframe ? 'Shaded' : 'Wireframe'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolBtn} onPress={resetOrbit}>
          <RefreshCw size={15} color="#FFFFFF" />
          <Text style={styles.toolBtnText}>Reset</Text>
        </TouchableOpacity>

        {onSpawnInAR && (
          <TouchableOpacity style={[styles.toolBtn, styles.arBtn]} onPress={onSpawnInAR}>
            <Sparkles size={15} color="#000000" />
            <Text style={[styles.toolBtnText, styles.arBtnText]}>View AR</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: '#262626',
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
    borderColor: '#171717',
  },
  orientationCube: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cubeLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
  },
  toolBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  arBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  arBtnText: {
    color: '#000000',
    fontWeight: '700',
  },
});
