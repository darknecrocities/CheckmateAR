import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Chess } from 'chess.js';
import { SquareCoord, PieceColor, PieceType } from '../../types/chess';
import { colors } from '../../theme/colors';

interface ChessBoard2DProps {
  fen: string;
  selectedSquare?: SquareCoord | null;
  bestMove?: string;
  onSquarePress?: (square: SquareCoord) => void;
  boardSize?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_BOARD_SIZE = Math.min(SCREEN_WIDTH - 32, 380);

const PIECE_SYMBOLS: Record<string, string> = {
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔',
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
};

export const ChessBoard2D: React.FC<ChessBoard2DProps> = ({
  fen,
  selectedSquare,
  bestMove,
  onSquarePress,
  boardSize = DEFAULT_BOARD_SIZE,
}) => {
  const chess = React.useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const tileSize = boardSize / 8;
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const bestFrom = bestMove && bestMove.length >= 4 ? bestMove.slice(0, 2) : null;
  const bestTo = bestMove && bestMove.length >= 4 ? bestMove.slice(2, 4) : null;

  return (
    <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
      {ranks.map((rank, rIdx) => (
        <View key={`rank_${rank}`} style={styles.rankRow}>
          {files.map((file, fIdx) => {
            const coord = `${file}${rank}` as SquareCoord;
            const isLightSquare = (rIdx + fIdx) % 2 === 0;
            const piece = chess.get(coord as any);

            const isSelected = selectedSquare === coord;
            const isBestFrom = bestFrom === coord;
            const isBestTo = bestTo === coord;

            let bgColor = isLightSquare ? colors.chess.lightSquare : colors.chess.darkSquare;
            if (isSelected) bgColor = 'rgba(0, 229, 255, 0.5)';
            else if (isBestTo) bgColor = colors.chess.highlightTarget;
            else if (isBestFrom) bgColor = colors.chess.highlightSource;

            return (
              <TouchableOpacity
                key={coord}
                activeOpacity={0.8}
                style={[
                  styles.tile,
                  { width: tileSize, height: tileSize, backgroundColor: bgColor },
                ]}
                onPress={() => onSquarePress?.(coord)}
              >
                {/* File coordinate label at bottom rank */}
                {rank === 1 && (
                  <Text style={[styles.coordFile, { color: isLightSquare ? '#64748B' : '#CBD5E1' }]}>
                    {file}
                  </Text>
                )}
                {/* Rank coordinate label at left file */}
                {file === 'a' && (
                  <Text style={[styles.coordRank, { color: isLightSquare ? '#64748B' : '#CBD5E1' }]}>
                    {rank}
                  </Text>
                )}

                {/* Chess piece symbol */}
                {piece && (
                  <Text
                    style={[
                      styles.pieceText,
                      {
                        fontSize: tileSize * 0.72,
                        color: piece.color === 'w' ? '#FFFFFF' : '#0F172A',
                        textShadowColor: piece.color === 'w' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 1,
                      },
                    ]}
                  >
                    {PIECE_SYMBOLS[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2A2D3D',
    alignSelf: 'center',
  },
  rankRow: {
    flexDirection: 'row',
  },
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pieceText: {
    textAlign: 'center',
  },
  coordFile: {
    position: 'absolute',
    bottom: 1,
    right: 2,
    fontSize: 9,
    fontWeight: '700',
  },
  coordRank: {
    position: 'absolute',
    top: 1,
    left: 2,
    fontSize: 9,
    fontWeight: '700',
  },
});
