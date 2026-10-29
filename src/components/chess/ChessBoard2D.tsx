import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Line, Polygon, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { Chess } from 'chess.js';
import { SquareCoord } from '../../types/chess';
import { colors } from '../../theme/colors';
import { radii } from '../../theme/spacing';

interface ChessBoard2DProps {
  fen: string;
  bestMove?: string; // UCI e.g. "f3g5"
  secondaryMove?: string; // Next predicted reply UCI e.g. "d7d5"
  predictionLabel?: string; // e.g. "Nxe5" or "Best"
  flipped?: boolean;
  onSquarePress?: (square: SquareCoord) => void;
  selectedSquare?: SquareCoord | null;
  boardSize?: number;
}

const PIECE_UNICODE: Record<string, string> = {
  wK: '♔',
  wQ: '♕',
  wR: '♖',
  wB: '♗',
  wN: '♘',
  wP: '♙',
  bK: '♚',
  bQ: '♛',
  bR: '♜',
  bB: '♝',
  bN: '♞',
  bP: '♟',
};

function squareToPixelCenter(
  sq: string,
  cellSize: number,
  flipped: boolean
): { x: number; y: number } | null {
  if (!sq || sq.length < 2) return null;
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const fileIdx = files.indexOf(sq[0]);
  const rankNum = parseInt(sq[1], 10);
  if (fileIdx < 0 || isNaN(rankNum) || rankNum < 1 || rankNum > 8) return null;

  const col = flipped ? 7 - fileIdx : fileIdx;
  const row = flipped ? rankNum - 1 : 8 - rankNum;

  return {
    x: (col + 0.5) * cellSize,
    y: (row + 0.5) * cellSize,
  };
}

function buildArrowGeometry(
  fromSq: string,
  toSq: string,
  cellSize: number,
  flipped: boolean
) {
  const p1 = squareToPixelCenter(fromSq, cellSize, flipped);
  const p2 = squareToPixelCenter(toSq, cellSize, flipped);
  if (!p1 || !p2) return null;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;

  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  const headLength = Math.max(11, cellSize * 0.36);
  const headWidth = Math.max(10, cellSize * 0.32);

  // Pull tip slightly inside target center so piece glyph remains clear
  const tipX = p2.x - ux * (cellSize * 0.12);
  const tipY = p2.y - uy * (cellSize * 0.12);
  const baseX = tipX - ux * headLength;
  const baseY = tipY - uy * headLength;

  const leftX = baseX + px * (headWidth / 2);
  const leftY = baseY + py * (headWidth / 2);
  const rightX = baseX - px * (headWidth / 2);
  const rightY = baseY - py * (headWidth / 2);

  return {
    startX: p1.x + ux * (cellSize * 0.14),
    startY: p1.y + uy * (cellSize * 0.14),
    baseX,
    baseY,
    targetX: p2.x,
    targetY: p2.y,
    midX: (p1.x + p2.x) / 2,
    midY: (p1.y + p2.y) / 2,
    headPoints: `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`,
  };
}

export const ChessBoard2D: React.FC<ChessBoard2DProps> = ({
  fen,
  bestMove,
  secondaryMove,
  predictionLabel,
  flipped = false,
  onSquarePress,
  selectedSquare,
  boardSize,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const size = boardSize || Math.min(screenWidth - 32, 360);
  const cellSize = size / 8;

  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    chess = new Chess();
  }

  const files = flipped
    ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
    : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

  const bestFrom = bestMove && bestMove.length >= 4 ? bestMove.slice(0, 2) : null;
  const bestTo = bestMove && bestMove.length >= 4 ? bestMove.slice(2, 4) : null;

  const secFrom =
    secondaryMove && secondaryMove.length >= 4 ? secondaryMove.slice(0, 2) : null;
  const secTo =
    secondaryMove && secondaryMove.length >= 4 ? secondaryMove.slice(2, 4) : null;

  const primaryArrow =
    bestFrom && bestTo ? buildArrowGeometry(bestFrom, bestTo, cellSize, flipped) : null;
  const replyArrow =
    secFrom && secTo ? buildArrowGeometry(secFrom, secTo, cellSize, flipped) : null;

  return (
    <View style={[styles.boardContainer, { width: size, height: size }]}>
      {ranks.map((rank, rIdx) => (
        <View key={rank} style={styles.row}>
          {files.map((file, fIdx) => {
            const sq = `${file}${rank}` as SquareCoord;
            const isDark = (rIdx + fIdx) % 2 === 1;
            const piece = chess.get(sq as any);
            const isHighlighted = sq === bestFrom || sq === bestTo;
            const isSelected = sq === selectedSquare;

            let bgColor = isDark ? colors.chess.darkSquare : colors.chess.lightSquare;
            if (isSelected) {
              bgColor = 'rgba(59, 130, 246, 0.5)';
            } else if (sq === bestTo) {
              bgColor = 'rgba(16, 185, 129, 0.36)';
            } else if (isHighlighted) {
              bgColor = 'rgba(56, 189, 248, 0.28)';
            }

            return (
              <TouchableOpacity
                key={sq}
                activeOpacity={0.8}
                onPress={() => onSquarePress?.(sq)}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: bgColor,
                  },
                ]}
              >
                {fIdx === 0 && (
                  <Text
                    style={[
                      styles.coordRank,
                      { color: isDark ? colors.chess.lightSquare : colors.chess.darkSquare },
                    ]}
                  >
                    {rank}
                  </Text>
                )}

                {rIdx === 7 && (
                  <Text
                    style={[
                      styles.coordFile,
                      { color: isDark ? colors.chess.lightSquare : colors.chess.darkSquare },
                    ]}
                  >
                    {file}
                  </Text>
                )}

                {piece && (
                  <Text
                    style={[
                      styles.pieceText,
                      {
                        fontSize: cellSize * 0.68,
                        color: piece.color === 'w' ? '#FFFFFF' : '#111827',
                      },
                    ]}
                  >
                    {PIECE_UNICODE[`${piece.color}${piece.type.toUpperCase()}`]}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* SVG Move Prediction & Continuation Arrow Layer */}
      {(primaryArrow || replyArrow) && (
        <View style={[StyleSheet.absoluteFill, { width: size, height: size }]} pointerEvents="none">
          <Svg width={size} height={size}>
            {/* Secondary Predicted Opponent Response Arrow (Dashed Amber) */}
            {replyArrow && (
              <G opacity={0.85}>
                <Line
                  x1={replyArrow.startX}
                  y1={replyArrow.startY}
                  x2={replyArrow.baseX}
                  y2={replyArrow.baseY}
                  stroke="#F59E0B"
                  strokeWidth={Math.max(3, cellSize * 0.11)}
                  strokeDasharray="5,4"
                  strokeLinecap="round"
                />
                <Polygon points={replyArrow.headPoints} fill="#F59E0B" />
              </G>
            )}

            {/* Primary Move Prediction Arrow (Glowing Emerald / Sky Vector) */}
            {primaryArrow && (
              <G>
                <Circle
                  cx={primaryArrow.targetX}
                  cy={primaryArrow.targetY}
                  r={cellSize * 0.4}
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="rgba(16, 185, 129, 0.14)"
                />
                <Line
                  x1={primaryArrow.startX}
                  y1={primaryArrow.startY}
                  x2={primaryArrow.baseX}
                  y2={primaryArrow.baseY}
                  stroke="rgba(0, 0, 0, 0.65)"
                  strokeWidth={Math.max(6.5, cellSize * 0.2)}
                  strokeLinecap="round"
                />
                <Line
                  x1={primaryArrow.startX}
                  y1={primaryArrow.startY}
                  x2={primaryArrow.baseX}
                  y2={primaryArrow.baseY}
                  stroke="#10B981"
                  strokeWidth={Math.max(4, cellSize * 0.13)}
                  strokeLinecap="round"
                />
                <Polygon
                  points={primaryArrow.headPoints}
                  fill="#10B981"
                  stroke="#052E16"
                  strokeWidth={1}
                />

                {predictionLabel ? (
                  <G>
                    <Rect
                      x={primaryArrow.midX - 24}
                      y={primaryArrow.midY - 10}
                      width={48}
                      height={18}
                      rx={5}
                      fill="rgba(9, 9, 11, 0.9)"
                      stroke="#10B981"
                      strokeWidth={1}
                    />
                    <SvgText
                      x={primaryArrow.midX}
                      y={primaryArrow.midY + 2.5}
                      fill="#10B981"
                      fontSize="9.5"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {predictionLabel}
                    </SvgText>
                  </G>
                ) : null}
              </G>
            )}
          </Svg>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.dark.border,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coordRank: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 9,
    fontWeight: '700',
  },
  coordFile: {
    position: 'absolute',
    bottom: 1,
    right: 3,
    fontSize: 9,
    fontWeight: '700',
  },
  pieceText: {
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
