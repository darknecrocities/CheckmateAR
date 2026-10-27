import { TextStyle, Platform } from 'react-native';

const monoFont = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  title1: {
    fontSize: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  title2: {
    fontSize: 18,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  headline: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  monoCoord: {
    fontFamily: monoFont,
    fontSize: 13,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.4,
  },
  monoEval: {
    fontFamily: monoFont,
    fontSize: 15,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
  },
};
