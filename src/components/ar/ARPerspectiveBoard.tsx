import React from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Svg, { Polygon, Line, G, Circle } from 'react-native-svg';
import { QuadPoints, Matrix3x3, DetectedSquare, Point2D } from '../../types/vision';
import { SquareCoord } from '../../types/chess';
import { CandidateMove } from '../../types/stockfish';
import { ARMoveArrow } from './ARMoveArrow';
import { AREvalPill } from './AREvalPill';
import { colors } from '../../theme/colors';

interface ARPerspectiveBoardProps {
  corners: QuadPoints;
  homography: Matrix3x3;
  squares: Record<SquareCoord, DetectedSquare>;
  bestMove?: string;
  bestMoveSan?: string;
  candidates?: CandidateMove[];
  evalText?: string;
  isWhiteBottom?: boolean;
  selectedSquare?: SquareCoord | null;
  uncertainSquares?: SquareCoord[];
  onSquarePress?: (coord: SquareCoord) => void;
  onCornerChange?: (corner: keyof QuadPoints, newPoint: Point2D) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HANDLE_RADIUS = 22;

export const ARPerspectiveBoard: React.FC<ARPerspectiveBoardProps> = ({
  corners,
  homography,
  squares,
  bestMove,
  bestMoveSan = '',
  candidates = [],
  evalText = '+0.00',
  isWhiteBottom = true,
  selectedSquare,
  uncertainSquares = [],
  onSquarePress,
  onCornerChange,
}) => {
  const borderPoints = `${corners.topLeft.x},${corners.topLeft.y} ${corners.topRight.x},${corners.topRight.y} ${corners.bottomRight.x},${corners.bottomRight.y} ${corners.bottomLeft.x},${corners.bottomLeft.y}`;

  const fromSquare = (bestMove && bestMove.length >= 4 ? bestMove.slice(0, 2) : null) as SquareCoord | null;
  const toSquare = (bestMove && bestMove.length >= 4 ? bestMove.slice(2, 4) : null) as SquareCoord | null;
  const toSquareData = toSquare ? squares[toSquare] : null;

  // PanResponder factory for draggable corner handles
  const createCornerPanResponder = (cornerKey: keyof QuadPoints) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (onCornerChange) {
          const newX = Math.max(0, Math.min(SCREEN_WIDTH, gestureState.moveX));
          const newY = Math.max(60, Math.min(SCREEN_HEIGHT - 120, gestureState.moveY));
          onCornerChange(cornerKey, { x: newX, y: newY });
        }
      },
    });
  };

  const panTopLeft = React.useMemo(() => createCornerPanResponder('topLeft'), [onCornerChange]);
  const panTopRight = React.useMemo(() => createCornerPanResponder('topRight'), [onCornerChange]);
  const panBottomRight = React.useMemo(() => createCornerPanResponder('bottomRight'), [onCornerChange]);
  const panBottomLeft = React.useMemo(() => createCornerPanResponder('bottomLeft'), [onCornerChange]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
        {/* Outer Board Neon Frame */}
        <Polygon
          points={borderPoints}
          stroke={colors.ar.boardBorder}
          strokeWidth={2.5}
          strokeOpacity={0.85}
          fill="none"
        />

        {/* Outer Corner Reticle Brackets */}
        <G stroke={colors.ar.cornerBracket} strokeWidth={4} strokeLinecap="round">
          <Line x1={corners.topLeft.x} y1={corners.topLeft.y} x2={corners.topLeft.x + 24} y2={corners.topLeft.y} />
          <Line x1={corners.topLeft.x} y1={corners.topLeft.y} x2={corners.topLeft.x} y2={corners.topLeft.y + 24} />
          <Line x1={corners.topRight.x} y1={corners.topRight.y} x2={corners.topRight.x - 24} y2={corners.topRight.y} />
          <Line x1={corners.topRight.x} y1={corners.topRight.y} x2={corners.topRight.x} y2={corners.topRight.y + 24} />
          <Line x1={corners.bottomRight.x} y1={corners.bottomRight.y} x2={corners.bottomRight.x - 24} y2={corners.bottomRight.y} />
          <Line x1={corners.bottomRight.x} y1={corners.bottomRight.y} x2={corners.bottomRight.x} y2={corners.bottomRight.y - 24} />
          <Line x1={corners.bottomLeft.x} y1={corners.bottomLeft.y} x2={corners.bottomLeft.x + 24} y2={corners.bottomLeft.y} />
          <Line x1={corners.bottomLeft.x} y1={corners.bottomLeft.y} x2={corners.bottomLeft.x} y2={corners.bottomLeft.y - 24} />
        </G>

        {/* Source Square Highlight */}
        {fromSquare && squares[fromSquare] && (
          <Polygon
            points={squares[fromSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke={colors.ar.bestMoveTile}
            strokeWidth={2}
            fill={colors.ar.bestMoveTile}
            fillOpacity={0.35}
          />
        )}

        {/* Destination Square Highlight */}
        {toSquare && squares[toSquare] && (
          <Polygon
            points={squares[toSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke={colors.ar.bestMoveTile}
            strokeWidth={3}
            fill={colors.ar.bestMoveTile}
            fillOpacity={0.65}
          />
        )}

        {/* Selected Square */}
        {selectedSquare && squares[selectedSquare] && (
          <Polygon
            points={squares[selectedSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke="#00E5FF"
            strokeWidth={2.5}
            fill="#00E5FF"
            fillOpacity={0.4}
          />
        )}

        {/* Uncertain Squares */}
        {uncertainSquares.map((coord) => {
          const sq = squares[coord];
          if (!sq) return null;
          return (
            <Polygon
              key={`uncertain_${coord}`}
              points={sq.screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
              stroke={colors.ar.uncertainTile}
              strokeWidth={2}
              strokeDasharray="4 4"
              fill={colors.ar.uncertainTile}
              fillOpacity={0.25}
            />
          );
        })}

        {/* Candidate Arrows */}
        {candidates.slice(1, 3).map((cand, idx) => (
          <ARMoveArrow
            key={`cand_${cand.uci}_${idx}`}
            fromCoord={cand.from}
            toCoord={cand.to}
            homography={homography}
            color={idx === 0 ? colors.ar.candidate2 : colors.ar.candidate3}
            isCandidate={true}
            isWhiteBottom={isWhiteBottom}
          />
        ))}

        {/* Best Move Arrow */}
        {fromSquare && toSquare && (
          <ARMoveArrow
            fromCoord={fromSquare}
            toCoord={toSquare}
            homography={homography}
            color={colors.ar.bestMoveArrow}
            isCandidate={false}
            isWhiteBottom={isWhiteBottom}
          />
        )}

        {/* Floating Evaluation Pill */}
        {toSquareData && (
          <AREvalPill
            position={toSquareData.screenCenter}
            san={bestMoveSan}
            evalText={evalText}
            color={colors.ar.pillBackground}
            textColor={colors.ar.pillText}
          />
        )}
      </Svg>

      {/* Interactive Draggable Corner Touch Targets */}
      <View
        {...panTopLeft.panHandlers}
        style={[styles.cornerHandle, { left: corners.topLeft.x - HANDLE_RADIUS, top: corners.topLeft.y - HANDLE_RADIUS }]}
      />
      <View
        {...panTopRight.panHandlers}
        style={[styles.cornerHandle, { left: corners.topRight.x - HANDLE_RADIUS, top: corners.topRight.y - HANDLE_RADIUS }]}
      />
      <View
        {...panBottomRight.panHandlers}
        style={[styles.cornerHandle, { left: corners.bottomRight.x - HANDLE_RADIUS, top: corners.bottomRight.y - HANDLE_RADIUS }]}
      />
      <View
        {...panBottomLeft.panHandlers}
        style={[styles.cornerHandle, { left: corners.bottomLeft.x - HANDLE_RADIUS, top: corners.bottomLeft.y - HANDLE_RADIUS }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cornerHandle: {
    position: 'absolute',
    width: HANDLE_RADIUS * 2,
    height: HANDLE_RADIUS * 2,
    borderRadius: HANDLE_RADIUS,
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
