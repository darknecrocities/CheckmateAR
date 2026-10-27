export const colors = {
  dark: {
    background: '#090A0F',
    surface: '#13141C',
    surfaceElevated: '#1D1F2C',
    border: '#2A2D3D',
    borderSpecular: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#00E676', // Emerald for Best Move
    accentSubtle: 'rgba(0, 230, 118, 0.15)',
    danger: '#FF5252',
    warning: '#FFD600',
    info: '#00E5FF',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    border: '#E2E8F0',
    borderSpecular: 'rgba(0, 0, 0, 0.08)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    accent: '#059669',
    accentSubtle: 'rgba(5, 150, 105, 0.12)',
    danger: '#DC2626',
    warning: '#D97706',
    info: '#0284C7',
  },
  ar: {
    boardBorder: '#00E5FF', // Neon cyan border frame
    cornerBracket: '#00E5FF',
    bestMoveTile: '#00E676', // Vibrant green tile glow (matches reference)
    bestMoveArrow: '#00E676',
    candidate2: '#00B0FF', // Sky blue candidate
    candidate3: '#D500F9', // Purple candidate
    threatTile: '#FF1744',
    uncertainTile: '#FFD600',
    hudBackground: 'rgba(10, 14, 23, 0.82)',
    hudBorder: 'rgba(0, 229, 255, 0.28)',
    pillBackground: 'rgba(0, 230, 118, 0.92)',
    pillText: '#052312',
  },
  chess: {
    lightSquare: '#E2E8F0',
    darkSquare: '#475569',
    whitePiece: '#F8FAFC',
    blackPiece: '#0F172A',
    highlightSource: 'rgba(0, 230, 118, 0.45)',
    highlightTarget: 'rgba(0, 230, 118, 0.65)',
    highlightLastMove: 'rgba(255, 214, 0, 0.35)',
  },
};

export type ThemeColors = typeof colors.dark;
