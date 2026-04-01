// Datefully Design System — Theme Tokens

export const Colors = {
  // Backgrounds
  background: '#000000',
  card: '#111111',
  cardAlt: '#1a1a1a',
  cardBorder: '#2a2a2a',

  // Accent
  gold: '#c9a84c',
  goldDark: '#a8893e',
  goldLight: '#e0be7a',

  // CTA
  red: '#c0392b',
  redDark: '#a93226',

  // Status
  success: '#27ae60',
  error: '#e74c3c',
  warning: '#f39c12',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#aaaaaa',
  textMuted: '#666666',

  // Misc
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.7)',

  // Input
  inputBackground: '#1a1a1a',
  inputBorder: '#333333',
  inputBorderFocus: '#c9a84c',

  // Chat bubbles
  userBubble: '#2a2000',
  aiBubble: '#1a1a1a',
} as const;

export const Typography = {
  // Font families
  heading: 'Georgia',
  body: 'System',

  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,
  display: 48,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  screen: 20,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const Shadow = {
  gold: {
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;
