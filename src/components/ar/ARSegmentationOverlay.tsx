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
 * Renders the 3-Stage Computer Vision Overlay inspired by
 * dopaul/chess-board-segmentation and FloudMe77/Chess_Position_Recognition_System:
 *  - Stage 1: Royal-blue polygon segmentation mask + `chess_board 0.97` bounding box
 *  - Stage 3: 12-class YOLO piece bounding boxes (`white-knight 0.92`, `black-rook 0.97`, etc.)
 */
export const ARSegmentationOverlay: React.FC<ARSegmentationOverlayProps> = ({
  segmentation,
  detections,
  showBoardMask = true,
  showPieceBoxes = true,
  width,
  height,
}) => {
  const polygonPoints = segmentation.polygon
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const { x: bx, y: by, width: bw, height: bh } = segmentation.boundingBox;
  const boardHeaderLabel = `${segmentation.label} ${segmentation.confidence.toFixed(2)}`;
  const boardLabelWidth = Math.max(96, boardHeaderLabel.length * 6.4);
  const boardLabelY = Math.max(8, by - 20);

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height}>
        {/* Stage 1: Chess Board Segmentation Polygon Mask + Bounding Box */}
        {showBoardMask && (
          <G>
            {/* Translucent Segmentation Mask over Board Polygon */}
            <Polygon
              points={polygonPoints}
              fill="rgba(37, 99, 235, 0.22)"
              stroke="#3B82F6"
              strokeWidth={2}
            />

            {/* Outer Axis-Aligned Bounding Box (dopaul / FloudMe77 style) */}
            <Rect
              x={bx}
              y={by}
              width={bw}
              height={bh}
              fill="none"
              stroke="#2563EB"
              strokeWidth={2.2}
              strokeDasharray="6,3"
            />

            {/* Top-Left `chess_board 0.97` Classification Tag */}
            <Rect
              x={bx}
              y={boardLabelY}
              width={boardLabelWidth}
              height={20}
              rx={3}
              fill="#2563EB"
            />
            <SvgText
              x={bx + 6}
              y={boardLabelY + 14}
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="800"
            >
              {boardHeaderLabel}
            </SvgText>
          </G>
        )}

        {/* Stage 3: 12-Class YOLO Piece Detection Bounding Boxes */}
        {showPieceBoxes &&
          detections.map((det) => {
            const label = `${det.className} ${det.confidence.toFixed(2)}`;
            const tagW = Math.max(74, label.length * 5.2 + 8);
            const tagH = 15;
            const tagX = det.bbox.x;
            const tagY = Math.max(4, det.bbox.y - tagH);

            return (
              <G key={det.id}>
                {/* 3D Piece Bounding Box */}
                <Rect
                  x={det.bbox.x}
                  y={det.bbox.y}
                  width={det.bbox.width}
                  height={det.bbox.height}
                  fill="rgba(37, 99, 235, 0.08)"
                  stroke={det.boxColor}
                  strokeWidth={1.8}
                  rx={2}
                />

                {/* YOLO Class + Confidence Pill Header */}
                <Rect
                  x={tagX}
                  y={tagY}
                  width={tagW}
                  height={tagH}
                  fill={det.boxColor}
                  rx={2}
                />
                <SvgText
                  x={tagX + 4}
                  y={tagY + 11}
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontWeight="800"
                >
                  {label}
                </SvgText>
              </G>
            );
          })}
      </Svg>
    </View>
  );
};
