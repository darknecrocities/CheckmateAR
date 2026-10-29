import React from 'react';
import { G, Rect, Text as SvgText, Circle, Polyline, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Point2D } from '../../types/vision';
import { SquareCoord } from '../../types/chess';

export interface ARLeaderCalloutProps {
  piecePosition: Point2D;
  pieceName: string; // e.g. "QUEEN", "KNIGHT", "ROOK"
  fromCoord: SquareCoord;
  toCoord: SquareCoord;
  evalText?: string;
  motif?: string;
  screenWidth?: number;
  screenHeight?: number;
}

/**
 * AR Tactical HUD Callout with 3D Leader Line.
 * Connects directly from the physical chess piece to a floating tactical card,
 * displaying the recommended next move (e.g. "NEXT MOVE: QUEEN d8 -> g5").
 */
export const ARLeaderCallout: React.FC<ARLeaderCalloutProps> = ({
  piecePosition,
  pieceName,
  fromCoord,
  toCoord,
  evalText,
  motif,
  screenWidth = 400,
  screenHeight = 800,
}) => {
  const { x: cx, y: cy } = piecePosition;

  // Box dimensions
  const boxWidth = Math.max(136, pieceName.length * 8 + 78);
  const boxHeight = evalText ? 44 : 38;

  // Dynamic placement based on piece position on screen
  const isRightSide = cx > screenWidth * 0.52;
  const isBottomSide = cy > screenHeight * 0.55;

  const offsetX = isRightSide ? -(boxWidth + 36) : 36;
  const offsetY = isBottomSide ? -(boxHeight + 28) : 24;

  const boxX = Math.max(12, Math.min(screenWidth - boxWidth - 12, cx + offsetX));
  const boxY = Math.max(70, Math.min(screenHeight - boxHeight - 90, cy + offsetY));

  // Leader line anchor and elbow coordinates
  const elbowX = isRightSide ? boxX + boxWidth : boxX;
  const elbowY = boxY + boxHeight / 2;

  const leaderPoints = `${cx},${cy} ${elbowX + (isRightSide ? 14 : -14)},${elbowY} ${elbowX},${elbowY}`;

  return (
    <G key="ar_leader_callout">
      <Defs>
        <LinearGradient id="hudGlow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#00E676" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#00B0FF" stopOpacity="0.85" />
        </LinearGradient>
      </Defs>

      {/* 1. Tactical Angled Leader Line */}
      <Polyline
        points={leaderPoints}
        stroke="#00E676"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Anchor Dot directly on the physical piece base */}
      <Circle cx={cx} cy={cy} r={4.5} fill="#00E676" />
      <Circle cx={cx} cy={cy} r={2} fill="#FFFFFF" />

      {/* 2. HUD Callout Box Background with Outer Glow */}
      <Rect
        x={boxX - 1.5}
        y={boxY - 1.5}
        width={boxWidth + 3}
        height={boxHeight + 3}
        rx={7}
        ry={7}
        fill="#000000"
        opacity={0.65}
      />
      <Rect
        x={boxX}
        y={boxY}
        width={boxWidth}
        height={boxHeight}
        rx={6}
        ry={6}
        fill="#090B10"
        stroke="#00E676"
        strokeWidth={1.4}
        opacity={0.96}
      />

      {/* Corner Bracket Accents on the HUD Box */}
      <Line x1={boxX} y1={boxY + 6} x2={boxX} y2={boxY} stroke="#FFFFFF" strokeWidth={1.5} />
      <Line x1={boxX} y1={boxY} x2={boxX + 6} y2={boxY} stroke="#FFFFFF" strokeWidth={1.5} />
      <Line x1={boxX + boxWidth - 6} y1={boxY} x2={boxX + boxWidth} y2={boxY} stroke="#FFFFFF" strokeWidth={1.5} />
      <Line x1={boxX + boxWidth} y1={boxY} x2={boxX + boxWidth} y2={boxY + 6} stroke="#FFFFFF" strokeWidth={1.5} />

      {/* 3. Tactical Label: NEXT MOVE: */}
      <SvgText
        x={boxX + 10}
        y={boxY + 14}
        fill="#00E676"
        fontSize={8.5}
        fontWeight="800"
        letterSpacing={0.8}
      >
        NEXT MOVE:
      </SvgText>

      {/* 4. Action Text: e.g. QUEEN d8 -> g5 */}
      <SvgText
        x={boxX + 10}
        y={boxY + 28}
        fill="#FFFFFF"
        fontSize={11.5}
        fontWeight="800"
        letterSpacing={0.2}
      >
        {`${pieceName}  ${fromCoord} ➔ ${toCoord}`}
      </SvgText>

      {/* 5. Eval or Motif Tag */}
      {evalText && (
        <SvgText
          x={boxX + 10}
          y={boxY + 39}
          fill="#A1A1AA"
          fontSize={8}
          fontWeight="700"
        >
          {`EVAL: ${evalText}${motif ? ` • ${motif}` : ''}`}
        </SvgText>
      )}
    </G>
  );
};
