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
  color = '#FFFFFF',
  textColor = '#000000',
}) => {
  const displayText = `${san} ${evalText}`.trim();
  // Pill dimensions based on text length
  const width = Math.max(76, displayText.length * 9.5 + 24);
  const height = 30;
  const x = position.x - width / 2;
  const y = position.y - height - 12; // float 12px above target tile center

  return (
    <G>
      {/* Outer ambient drop contour */}
      <Rect
        x={x - 1.5}
        y={y - 1.5}
        width={width + 3}
        height={height + 3}
        rx={16}
        ry={16}
        fill="#000000"
        opacity={0.7}
      />
      {/* Main Pill Surface - High Contrast Monochrome */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={15}
        ry={15}
        fill={color}
        stroke="#111111"
        strokeWidth={1}
        opacity={0.98}
      />
      {/* Pill Text */}
      <Text
        x={position.x}
        y={y + 19}
        textAnchor="middle"
        fill={textColor}
        fontSize={13}
        fontWeight="bold"
      >
        {displayText}
      </Text>
    </G>
  );
};
