import React from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Svg, { Polygon, Line, G, Circle, Text as SvgText } from 'react-native-svg';
import { QuadPoints, Matrix3x3, DetectedSquare, Point2D } from '../../types/vision';
import { SquareCoord } from '../../types/chess';
import { CandidateMove } from '../../types/stockfish';
import { ARMoveArrow } from './ARMoveArrow';
import { AREvalPill } from './AREvalPill';
import { ARLeaderCallout } from './ARLeaderCallout';
import { formatTacticalMoveAction } from '../../services/vision/multimodalChessVision';
import { colors } from '../../theme/colors';

export interface ARPerspectiveBoardProps {
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
  isLocked?: boolean;
  fen?: string;
  arMode?: 'strategy' | 'wireframe' | 'hybrid';
  showPieceTokens?: boolean;
  onSquarePress?: (coord: SquareCoord) => void;
  onCornerChange?: (corner: keyof QuadPoints, newPoint: Point2D) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HANDLE_RADIUS = 22;

/**
 * True Real-Time Strategy AR Overlay for Physical Chessboards.
 * Plots directly onto physical chessboards and pieces with 3D homography:
 * - Glowing tactical green source quad on the physical piece (e.g. d8)
 * - Glowing tactical target quad on the destination tile (e.g. g5)
 * - AR 3D leader line and HUD callout badge ("NEXT MOVE: QUEEN d8 -> g5")
 * - Cyan glowing perimeter halo tracing the board rim with coordinates
 */
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
  isLocked = false,
  fen,
  arMode = 'strategy',
  showPieceTokens = false,
  onSquarePress,
  onCornerChange,
}) => {
  const borderPoints = `${corners.topLeft.x},${corners.topLeft.y} ${corners.topRight.x},${corners.topRight.y} ${corners.bottomRight.x},${corners.bottomRight.y} ${corners.bottomLeft.x},${corners.bottomLeft.y}`;

  const moveDetails = React.useMemo(
    () => formatTacticalMoveAction(fen || '', bestMove),
    [fen, bestMove]
  );

  const fromSquare = (bestMove && bestMove.length >= 4 ? bestMove.slice(0, 2) : null) as SquareCoord | null;
  const toSquare = (bestMove && bestMove.length >= 4 ? bestMove.slice(2, 4) : null) as SquareCoord | null;
  const toSquareData = toSquare ? squares[toSquare] : null;
  const fromSquareData = fromSquare ? squares[fromSquare] : null;

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

  const fileLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rankLabels = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const isWireframe = arMode === 'wireframe' || arMode === 'hybrid';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
        {/* Subtle Perspective Grid Lines (Wireframe/Calibration Only) */}
        {isWireframe &&
          Object.values(squares).map((sq) => {
            const polyStr = sq.screenPolygon.map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <Polygon
                key={`tile_${sq.coord}`}
                points={polyStr}
                fill="none"
                stroke="rgba(0, 229, 255, 0.22)"
                strokeWidth={0.8}
              />
            );
          })}

        {/* 1. Outer Board Perimeter Frame — High-Contrast Cyan Glow */}
        <Polygon
          points={borderPoints}
          stroke="#000000"
          strokeWidth={isLocked ? 5.5 : 4.5}
          strokeOpacity={0.65}
          fill="none"
        />
        <Polygon
          points={borderPoints}
          stroke="#00E5FF"
          strokeWidth={isLocked ? 3.5 : 2.5}
          strokeDasharray={isLocked ? undefined : '10 6'}
          strokeOpacity={isLocked ? 1.0 : 0.85}
          fill="none"
        />

        {/* Outer Corner Reticle Brackets */}
        <G stroke="#00E5FF" strokeWidth={isLocked ? 4.5 : 3.5} strokeLinecap="round">
          <Line x1={corners.topLeft.x} y1={corners.topLeft.y} x2={corners.topLeft.x + 24} y2={corners.topLeft.y} />
          <Line x1={corners.topLeft.x} y1={corners.topLeft.y} x2={corners.topLeft.x} y2={corners.topLeft.y + 24} />
          <Line x1={corners.topRight.x} y1={corners.topRight.y} x2={corners.topRight.x - 24} y2={corners.topRight.y} />
          <Line x1={corners.topRight.x} y1={corners.topRight.y} x2={corners.topRight.x} y2={corners.topRight.y + 24} />
          <Line x1={corners.bottomRight.x} y1={corners.bottomRight.y} x2={corners.bottomRight.x - 24} y2={corners.bottomRight.y} />
          <Line x1={corners.bottomRight.x} y1={corners.bottomRight.y} x2={corners.bottomRight.x} y2={corners.bottomRight.y - 24} />
          <Line x1={corners.bottomLeft.x} y1={corners.bottomLeft.y} x2={corners.bottomLeft.x + 24} y2={corners.bottomLeft.y} />
          <Line x1={corners.bottomLeft.x} y1={corners.bottomLeft.y} x2={corners.bottomLeft.x} y2={corners.bottomLeft.y - 24} />
        </G>

        {/* Perspective Coordinates Along Board Rim */}
        {fileLabels.map((f) => {
          const sq = squares[`${f}1` as SquareCoord];
          if (!sq) return null;
          return (
            <SvgText
              key={`file_${f}`}
              x={sq.screenCenter.x}
              y={sq.screenPolygon[2].y + 13}
              fill="#00E5FF"
              fontSize={10}
              fontWeight="800"
              textAnchor="middle"
            >
              {f}
            </SvgText>
          );
        })}

        {rankLabels.map((r) => {
          const sq = squares[`a${r}` as SquareCoord];
          if (!sq) return null;
          return (
            <SvgText
              key={`rank_${r}`}
              x={sq.screenPolygon[0].x - 9}
              y={sq.screenCenter.y + 3}
              fill="#00E5FF"
              fontSize={10}
              fontWeight="800"
              textAnchor="end"
            >
              {r}
            </SvgText>
          );
        })}

        {/* 2. Tactical Source Square Quad (Under Physical Piece to Move) */}
        {fromSquareData && (
          <G key="source_tactical_quad">
            <Polygon
              points={fromSquareData.screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
              stroke="#00E676"
              strokeWidth={3}
              fill="rgba(0, 230, 118, 0.22)"
            />
            {/* Glowing Corner Notches on Source Square */}
            <Circle
              cx={fromSquareData.screenCenter.x}
              cy={fromSquareData.screenCenter.y}
              r={12}
              stroke="#00E676"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              fill="none"
            />
          </G>
        )}

        {/* 3. Tactical Destination Square Quad (Target Square on Physical Board) */}
        {toSquareData && (
          <G key="dest_tactical_quad">
            <Polygon
              points={toSquareData.screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
              stroke="#00E676"
              strokeWidth={3}
              fill="rgba(0, 230, 118, 0.22)"
            />
            {/* Concentric Target Rings */}
            <Circle
              cx={toSquareData.screenCenter.x}
              cy={toSquareData.screenCenter.y}
              r={14}
              stroke="#00E676"
              strokeWidth={2}
              fill="rgba(0, 230, 118, 0.15)"
            />
            <Circle
              cx={toSquareData.screenCenter.x}
              cy={toSquareData.screenCenter.y}
              r={4}
              fill="#FFFFFF"
            />
          </G>
        )}

        {/* Selected Square Highlight */}
        {selectedSquare && squares[selectedSquare] && (
          <Polygon
            points={squares[selectedSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="rgba(255, 255, 255, 0.2)"
          />
        )}

        {/* Candidate Move Vectors */}
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

        {/* 3D Curved Best Move Vector Arrow */}
        {fromSquare && toSquare && (
          <ARMoveArrow
            fromCoord={fromSquare}
            toCoord={toSquare}
            homography={homography}
            color="#00E676"
            isCandidate={false}
            isWhiteBottom={isWhiteBottom}
          />
        )}

        {/* 4. AR Tactical Leader Callout Badge ("NEXT MOVE: QUEEN d8 -> g5") */}
        {fromSquare && toSquare && fromSquareData && (
          <ARLeaderCallout
            piecePosition={fromSquareData.screenCenter}
            pieceName={moveDetails.pieceName}
            fromCoord={fromSquare}
            toCoord={toSquare}
            evalText={evalText}
            screenWidth={SCREEN_WIDTH}
            screenHeight={SCREEN_HEIGHT}
          />
        )}
      </Svg>

      {/* Interactive Draggable Corner Touch Targets (When not locked) */}
      {!isLocked && (
        <>
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
        </>
      )}
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
