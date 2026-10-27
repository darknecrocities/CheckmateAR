import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatEvaluationScore } from '../../services/stockfish/uciProtocol';
import { typography } from '../../theme/typography';

interface EvaluationBarProps {
  scoreCp?: number;
  mateIn?: number;
  height?: number;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  scoreCp = 0,
  mateIn,
  height = 14,
}) => {
  // Convert centipawns or mate into a percentage (0% = Black winning, 100% = White winning)
  let whitePercent = 50;

  if (mateIn !== undefined) {
    whitePercent = mateIn > 0 ? 100 : 0;
  } else {
    // Sigmoid function mapping centipawns to percentage
    const winProb = 1 / (1 + Math.exp(-0.0035 * scoreCp));
    whitePercent = Math.min(100, Math.max(0, winProb * 100));
  }

  const evalString = formatEvaluationScore(scoreCp, mateIn);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.barContainer, { height }]}>
        <View style={[styles.whiteFill, { width: `${whitePercent}%` }]} />
        <View style={[styles.blackFill, { width: `${100 - whitePercent}%` }]} />
      </View>
      <Text style={styles.evalText}>{evalString}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  whiteFill: {
    backgroundColor: '#F8FAFC',
    height: '100%',
  },
  blackFill: {
    backgroundColor: '#0F172A',
    height: '100%',
  },
  evalText: {
    ...typography.monoEval,
    fontSize: 13,
    color: '#00E676',
    minWidth: 46,
    textAlign: 'right',
  },
});
