import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const Typography = StyleSheet.create({
  heroTitle: {
    fontSize: FontSize['5xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: FontSize['5xl'] * 1.1,
    letterSpacing: -1,
  },
  h1: {
    fontSize: FontSize['4xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  h4: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  h5: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: FontSize.md,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: FontSize.md * 1.6,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: FontSize.base * 1.6,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.textMuted,
    lineHeight: FontSize.sm * 1.5,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  button: {
    fontSize: FontSize.base,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  price: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  tag: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
});
