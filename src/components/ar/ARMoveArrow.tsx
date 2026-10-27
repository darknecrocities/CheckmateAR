import React from 'react';
import { Path, Polygon, G } from 'react-native-svg';
import { Point2D, Matrix3x3 } from '../../types/vision';
import { SquareCoord } from '../../types/chess';
import { transformPoint, CANONICAL_SQUARE_SIZE } from '../../services/vision/homography';
import { FILES } from '../../services/vision/boardDetector';

interface ARMoveArrowProps {
  fromCoord: SquareCoord;
  toCoord: SquareCoord;
  homography: Matrix3x3;
  color?: string;
  isCandidate?: boolean;
  isWhiteBottom?: boolean;
}

/**
 * Computes canonical center point (in 800x800 space) for a given square coordinate.
 */
function getCanonicalCoordCenter(coord: SquareCoord, isWhiteBottom: boolean): Point2D {
  const fileLetter = coord[0];
  const rankNum = parseInt(coord[1], 10);

  const fileIdx = FILES.indexOf(fileLetter as any);
  const rankIdx = isWhiteBottom ? 8 - rankNum : rankNum - 1;

  return {
    x: (fileIdx + 0.5) * CANONICAL_SQUARE_SIZE,
    y: (rankIdx + 0.5) * CANONICAL_SQUARE_SIZE,
  };
}

export const ARMoveArrow: React.FC<ARMoveArrowProps> = ({
  fromCoord,
  toCoord,
  homography,
  color = '#00E676',
  isCandidate = false,
  isWhiteBottom = true,
}) => {
  const fromCanonical = getCanonicalCoordCenter(fromCoord, isWhiteBottom);
  const toCanonical = getCanonicalCoordCenter(toCoord, isWhiteBottom);

  const fromFile = FILES.indexOf(fromCoord[0] as any);
  const toFile = FILES.indexOf(toCoord[0] as any);
  const fromRank = parseInt(fromCoord[1], 10);
  const toRank = parseInt(toCoord[1], 10);

  const dFile = Math.abs(toFile - fromFile);
  const dRank = Math.abs(toRank - fromRank);
  const isKnightMove = (dFile === 1 && dRank === 2) || (dFile === 2 && dRank === 1);

  let pathD = '';
  let headPoints = '';

  const pFrom = transformPoint(homography, fromCanonical);
  const pTo = transformPoint(homography, toCanonical);

  if (isKnightMove) {
    // For knight moves, canonical bend point follows the longer rank/file trajectory
    const cornerCanonical: Point2D =
      dRank === 2
        ? { x: fromCanonical.x, y: toCanonical.y }
        : { x: toCanonical.x, y: fromCanonical.y };

    const pCorner = transformPoint(homography, cornerCanonical);

    // Quadratic bezier curve through the corner creates smooth bend
    pathD = `M ${pFrom.x} ${pFrom.y} Q ${pCorner.x} ${pCorner.y} ${pTo.x} ${pTo.y}`;

    // Angle of approach to destination
    const angle = Math.atan2(pTo.y - pCorner.y, pTo.x - pCorner.x);
    const headLen = isCandidate ? 14 : 20;
    const x1 = pTo.x - headLen * Math.cos(angle - Math.PI / 6);
    const y1 = pTo.y - headLen * Math.sin(angle - Math.PI / 6);
    const x2 = pTo.x - headLen * Math.cos(angle + Math.PI / 6);
    const y2 = pTo.y - headLen * Math.sin(angle + Math.PI / 6);
    headPoints = `${pTo.x},${pTo.y} ${x1},${y1} ${x2},${y2}`;
  } else {
    // Straight arrow
    pathD = `M ${pFrom.x} ${pFrom.y} L ${pTo.x} ${pTo.y}`;

    const angle = Math.atan2(pTo.y - pFrom.y, pTo.x - pFrom.x);
    const headLen = isCandidate ? 14 : 20;
    const x1 = pTo.x - headLen * Math.cos(angle - Math.PI / 6);
    const y1 = pTo.y - headLen * Math.sin(angle - Math.PI / 6);
    const x2 = pTo.x - headLen * Math.cos(angle + Math.PI / 6);
    const y2 = pTo.y - headLen * Math.sin(angle + Math.PI / 6);
    headPoints = `${pTo.x},${pTo.y} ${x1},${y1} ${x2},${y2}`;
  }

  const strokeWidth = isCandidate ? 3.5 : 6;
  const strokeOpacity = isCandidate ? 0.75 : 0.95;

  return (
    <G>
      {/* Subtle outer glow layer */}
      <Path
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth + 4}
        strokeOpacity={0.3}
        strokeLinecap="round"
        fill="none"
      />
      {/* Main core arrow line */}
      <Path
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow head polygon */}
      <Polygon points={headPoints} fill={color} opacity={strokeOpacity} />
    </G>
  );
};
