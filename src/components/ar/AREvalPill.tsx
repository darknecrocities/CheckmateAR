import React from 'react';
import { G, Rect, Text } from 'react-native-svg';
import { Point2D } from '../../types/vision';

interface AREvalPillProps {
  position: Point2D;
  san: string; // e.g. "Nf6"
  evalText: string; // e.g. "+0.26"
  color?: string;
  textColor?: string;
}

export const AREvalPill: React.FC<AREvalPillProps> = ({
  position,
  san,
  evalText,
  color = '#00E676',
  textColor = '#052312',
}) => {
  const displayText = `${san} ${evalText}`.trim();
  // Pill dimensions based on text length
  const width = Math.max(76, displayText.length * 9.5 + 24);
  const height = 30;
  const x = position.x - width / 2;
  const y = position.y - height - 12; // float 12px above target tile center

  return (
    <G>
      {/* Outer ambient glow */}
      <Rect
        x={x - 2}
        y={y - 2}
        width={width + 4}
        height={height + 4}
        rx={17}
        ry={17}
        fill={color}
        opacity={0.35}
      />
      {/* Main Pill Surface */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={15}
        ry={15}
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={1.5}
        opacity={0.96}
      />
      {/* Pill Text */}
      <Text
        x={position.x}
        y={y + 19}
        textAnchor="middle"
        fill={textColor}
        fontSize={14}
        fontWeight="bold"
      >
        {displayText}
      </Text>
    </G>
  );
};
