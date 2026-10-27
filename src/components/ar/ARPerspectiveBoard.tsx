import React from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Svg, { Polygon, Line, G, Circle, Text as SvgText } from 'react-native-svg';
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
  isLocked?: boolean;
  fen?: string;
  onSquarePress?: (coord: SquareCoord) => void;
  onCornerChange?: (corner: keyof QuadPoints, newPoint: Point2D) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HANDLE_RADIUS = 22;

function parsePiecesFromFen(fen?: string): Record<SquareCoord, { type: string; color: 'w' | 'b' }> {
  if (!fen) return {} as Record<SquareCoord, { type: string; color: 'w' | 'b' }>;
  const placement = fen.split(' ')[0];
  const rows = placement.split('/');
  const result: Record<string, { type: string; color: 'w' | 'b' }> = {};

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  for (let r = 0; r < 8 && r < rows.length; r++) {
    const rank = 8 - r;
    let fileIdx = 0;
    const row = rows[r];

    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char >= '1' && char <= '8') {
        fileIdx += parseInt(char, 10);
      } else if (fileIdx < 8) {
        const file = files[fileIdx];
        const isWhite = char === char.toUpperCase();
        result[`${file}${rank}`] = {
          type: char.toUpperCase(),
          color: isWhite ? 'w' : 'b',
        };
        fileIdx++;
      }
    }
  }
  return result as Record<SquareCoord, { type: string; color: 'w' | 'b' }>;
}

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
  onSquarePress,
  onCornerChange,
}) => {
  const borderPoints = `${corners.topLeft.x},${corners.topLeft.y} ${corners.topRight.x},${corners.topRight.y} ${corners.bottomRight.x},${corners.bottomRight.y} ${corners.bottomLeft.x},${corners.bottomLeft.y}`;

  const fromSquare = (bestMove && bestMove.length >= 4 ? bestMove.slice(0, 2) : null) as SquareCoord | null;
  const toSquare = (bestMove && bestMove.length >= 4 ? bestMove.slice(2, 4) : null) as SquareCoord | null;
  const toSquareData = toSquare ? squares[toSquare] : null;

  const parsedPieces = React.useMemo(() => parsePiecesFromFen(fen), [fen]);

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

  const fileLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rankLabels = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFill}>
        {/* Full 64 Perspective AR Chessboard Tiles */}
        {Object.values(squares).map((sq) => {
          const polyStr = sq.screenPolygon.map((p) => `${p.x},${p.y}`).join(' ');
          const isLight = (sq.fileIndex + sq.rankIndex) % 2 === 0;
          return (
            <Polygon
              key={`tile_${sq.coord}`}
              points={polyStr}
              fill={isLight ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.22)'}
              stroke="rgba(255, 255, 255, 0.24)"
              strokeWidth={0.8}
            />
          );
        })}

        {/* Outer Board Frame */}
        <Polygon
          points={borderPoints}
          stroke="#000000"
          strokeWidth={isLocked ? 5.5 : 4}
          strokeOpacity={0.7}
          fill="none"
        />
        <Polygon
          points={borderPoints}
          stroke="#FFFFFF"
          strokeWidth={isLocked ? 3 : 2}
          strokeDasharray={isLocked ? undefined : '8 6'}
          strokeOpacity={isLocked ? 1.0 : 0.85}
          fill="none"
        />

        {/* Outer Corner Reticle Brackets */}
        <G stroke="#FFFFFF" strokeWidth={isLocked ? 4.5 : 3.5} strokeLinecap="round">
          <Line x1={corners.topLeft.x} y1={corners.topLeft.y} x2={corners.topLeft.x + 28} y2={corners.topLeft.y} />
          <Line x1={corners.topLeft.x} y1={corners.topLeft.y} x2={corners.topLeft.x} y2={corners.topLeft.y + 28} />
          <Line x1={corners.topRight.x} y1={corners.topRight.y} x2={corners.topRight.x - 28} y2={corners.topRight.y} />
          <Line x1={corners.topRight.x} y1={corners.topRight.y} x2={corners.topRight.x} y2={corners.topRight.y + 28} />
          <Line x1={corners.bottomRight.x} y1={corners.bottomRight.y} x2={corners.bottomRight.x - 28} y2={corners.bottomRight.y} />
          <Line x1={corners.bottomRight.x} y1={corners.bottomRight.y} x2={corners.bottomRight.x} y2={corners.bottomRight.y - 28} />
          <Line x1={corners.bottomLeft.x} y1={corners.bottomLeft.y} x2={corners.bottomLeft.x + 28} y2={corners.bottomLeft.y} />
          <Line x1={corners.bottomLeft.x} y1={corners.bottomLeft.y} x2={corners.bottomLeft.x} y2={corners.bottomLeft.y - 28} />
        </G>

        {/* File and Rank Labels in Perspective */}
        {fileLabels.map((f) => {
          const sq = squares[`${f}1` as SquareCoord];
          if (!sq) return null;
          return (
            <SvgText
              key={`file_${f}`}
              x={sq.screenCenter.x}
              y={sq.screenPolygon[2].y + 11}
              fill="#FFFFFF"
              fontSize={9}
              fontWeight="700"
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
              x={sq.screenPolygon[0].x - 8}
              y={sq.screenCenter.y + 3}
              fill="#FFFFFF"
              fontSize={9}
              fontWeight="700"
              textAnchor="end"
            >
              {r}
            </SvgText>
          );
        })}

        {/* Source Square Tactical Highlight */}
        {fromSquare && squares[fromSquare] && (
          <Polygon
            points={squares[fromSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke={colors.ar.bestMoveTile}
            strokeWidth={2.5}
            fill={colors.ar.bestMoveTile}
            fillOpacity={0.4}
          />
        )}

        {/* Destination Square Tactical Highlight */}
        {toSquare && squares[toSquare] && (
          <Polygon
            points={squares[toSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke={colors.ar.bestMoveTile}
            strokeWidth={3}
            fill={colors.ar.bestMoveTile}
            fillOpacity={0.65}
          />
        )}

        {/* Selected Square Highlight */}
        {selectedSquare && squares[selectedSquare] && (
          <Polygon
            points={squares[selectedSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="#FFFFFF"
            fillOpacity={0.25}
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

        {/* Recognized Piece Indicators on Tiles */}
        {Object.entries(parsedPieces).map(([coord, piece]) => {
          const sq = squares[coord as SquareCoord];
          if (!sq) return null;
          const isWhite = piece.color === 'w';
          const isFrom = coord === fromSquare;
          return (
            <G key={`piece_${coord}`}>
              <Circle
                cx={sq.screenCenter.x}
                cy={sq.screenCenter.y}
                r={isFrom ? 12 : 10}
                fill={isWhite ? '#FFFFFF' : '#141414'}
                stroke={isWhite ? '#000000' : '#FFFFFF'}
                strokeWidth={isFrom ? 2 : 1.2}
              />
              <SvgText
                x={sq.screenCenter.x}
                y={sq.screenCenter.y + 3.5}
                textAnchor="middle"
                fontSize={10}
                fontWeight="800"
                fill={isWhite ? '#000000' : '#FFFFFF'}
              >
                {piece.type}
              </SvgText>
            </G>
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
