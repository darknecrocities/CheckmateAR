import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Rect, Text as SvgText, G } from 'react-native-svg';
import {
  BoardSegmentationMask,
  PieceDetectionBox,
} from '../../services/vision/boardSegmentationEngine';

export interface ARSegmentationOverlayProps {
  segmentation: BoardSegmentationMask;
  detections: PieceDetectionBox[];
  showBoardMask?: boolean;
  showPieceBoxes?: boolean;
  width: number;
  height: number;
}

/**
 * Clean Computer Vision AR Overlay:
 *  - Royal-blue board segmentation polygon & boundary header
 *  - Clean piece bounding boxes (without spammy text tags cluttering the board)
 */
export const ARSegmentationOverlay: React.FC<ARSegmentationOverlayProps> = ({
  segmentation,
  detections,
  showBoardMask = true,
  showPieceBoxes = false,
  width,
  height,
}) => {
  const polygonPoints = segmentation.polygon
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const { x: bx, y: by, width: bw, height: bh } = segmentation.boundingBox;
  const boardHeaderLabel = `chess_board ${segmentation.confidence.toFixed(2)}`;
  const boardLabelWidth = 104;
  const boardLabelY = Math.max(8, by - 22);

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height}>
        {/* Stage 1: Chess Board Segmentation Polygon Mask */}
        {showBoardMask && (
          <G>
            {/* Translucent Board Segmentation Polygon */}
            <Polygon
              points={polygonPoints}
              fill="rgba(37, 99, 235, 0.14)"
              stroke="#3B82F6"
              strokeWidth={1.8}
            />

            {/* Subtle Outer Axis-Aligned Bounding Box */}
            <Rect
              x={bx}
              y={by}
              width={bw}
              height={bh}
              fill="none"
              stroke="#2563EB"
              strokeWidth={1.5}
              strokeDasharray="6,4"
              opacity={0.7}
            />

            {/* Top-Left `chess_board 0.97` Classification Tag */}
            <Rect
              x={bx}
              y={boardLabelY}
              width={boardLabelWidth}
              height={18}
              rx={3}
              fill="#2563EB"
            />
            <SvgText
              x={bx + 6}
              y={boardLabelY + 13}
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="800"
            >
              {boardHeaderLabel}
            </SvgText>
          </G>
        )}

        {/* Minimal Piece Boundary Rings (Clean, zero text clutter) */}
        {showPieceBoxes &&
          detections.map((det) => (
            <Rect
              key={det.id}
              x={det.bbox.x}
              y={det.bbox.y}
              width={det.bbox.width}
              height={det.bbox.height}
              fill="none"
              stroke={det.boxColor}
              strokeWidth={1.2}
              strokeDasharray="4,3"
              rx={3}
              opacity={0.75}
            />
          ))}
      </Svg>
    </View>
  );
};
