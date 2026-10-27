import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Line, G, Rect } from 'react-native-svg';
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
  bestMove?: string; // e.g. "g8f6"
  bestMoveSan?: string; // e.g. "Nf6"
  candidates?: CandidateMove[];
  evalText?: string;
  isWhiteBottom?: boolean;
  selectedSquare?: SquareCoord | null;
  uncertainSquares?: SquareCoord[];
  onSquarePress?: (coord: SquareCoord) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
}) => {
  // Border polygon points (outer board perimeter)
  const borderPoints = `${corners.topLeft.x},${corners.topLeft.y} ${corners.topRight.x},${corners.topRight.y} ${corners.bottomRight.x},${corners.bottomRight.y} ${corners.bottomLeft.x},${corners.bottomLeft.y}`;

  const fromSquare = (bestMove && bestMove.length >= 4 ? bestMove.slice(0, 2) : null) as SquareCoord | null;
  const toSquare = (bestMove && bestMove.length >= 4 ? bestMove.slice(2, 4) : null) as SquareCoord | null;

  const toSquareData = toSquare ? squares[toSquare] : null;

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
          {/* Top-Left Corner */}
          <Line x1={corners.topLeft.x} y1={corners.topLeft.y} x2={corners.topLeft.x + 24} y2={corners.topLeft.y} />
          <Line x1={corners.topLeft.x} y1={corners.topLeft.y} x2={corners.topLeft.x} y2={corners.topLeft.y + 24} />
          {/* Top-Right Corner */}
          <Line x1={corners.topRight.x} y1={corners.topRight.y} x2={corners.topRight.x - 24} y2={corners.topRight.y} />
          <Line x1={corners.topRight.x} y1={corners.topRight.y} x2={corners.topRight.x} y2={corners.topRight.y + 24} />
          {/* Bottom-Right Corner */}
          <Line x1={corners.bottomRight.x} y1={corners.bottomRight.y} x2={corners.bottomRight.x - 24} y2={corners.bottomRight.y} />
          <Line x1={corners.bottomRight.x} y1={corners.bottomRight.y} x2={corners.bottomRight.x} y2={corners.bottomRight.y - 24} />
          {/* Bottom-Left Corner */}
          <Line x1={corners.bottomLeft.x} y1={corners.bottomLeft.y} x2={corners.bottomLeft.x + 24} y2={corners.bottomLeft.y} />
          <Line x1={corners.bottomLeft.x} y1={corners.bottomLeft.y} x2={corners.bottomLeft.x} y2={corners.bottomLeft.y - 24} />
        </G>

        {/* Highlight Source Square */}
        {fromSquare && squares[fromSquare] && (
          <Polygon
            points={squares[fromSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke={colors.ar.bestMoveTile}
            strokeWidth={2}
            fill={colors.ar.bestMoveTile}
            fillOpacity={0.35}
          />
        )}

        {/* Highlight Destination Square */}
        {toSquare && squares[toSquare] && (
          <Polygon
            points={squares[toSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke={colors.ar.bestMoveTile}
            strokeWidth={3}
            fill={colors.ar.bestMoveTile}
            fillOpacity={0.65}
          />
        )}

        {/* Highlight Selected Square (if user tapped a square) */}
        {selectedSquare && squares[selectedSquare] && (
          <Polygon
            points={squares[selectedSquare].screenPolygon.map((p) => `${p.x},${p.y}`).join(' ')}
            stroke="#00E5FF"
            strokeWidth={2.5}
            fill="#00E5FF"
            fillOpacity={0.4}
          />
        )}

        {/* Highlight Uncertain Recognition Squares */}
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

        {/* Render Alternative Candidate Move Arrows (Candidate 2 & 3) */}
        {candidates.slice(1, 3).map((cand, idx) => {
          const candColor = idx === 0 ? colors.ar.candidate2 : colors.ar.candidate3;
          return (
            <ARMoveArrow
              key={`cand_${cand.uci}_${idx}`}
              fromCoord={cand.from}
              toCoord={cand.to}
              homography={homography}
              color={candColor}
              isCandidate={true}
              isWhiteBottom={isWhiteBottom}
            />
          );
        })}

        {/* Render Primary Best Move Arrow */}
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

        {/* Floating Evaluation Pill above destination square */}
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
    </View>
  );
};
