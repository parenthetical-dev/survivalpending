import { StyleSheet, TextStyle } from 'react-native';

// Border radius values matching web app
export const radius = {
  sm: 6,    // 0.375rem
  md: 10,   // 0.625rem (base)
  lg: 12,   // 0.75rem
  xl: 16,   // 1rem
  full: 9999,
} as const;

// Spacing values (matching Tailwind scale)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
} as const;

// Font sizes matching web app
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
  '8xl': 96,
  '9xl': 128,
} as const;

// Font weights
export const fontWeight = {
  thin: '100' as TextStyle['fontWeight'],
  extralight: '200' as TextStyle['fontWeight'],
  light: '300' as TextStyle['fontWeight'],
  normal: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
  black: '900' as TextStyle['fontWeight'],
} as const;

// Shadow styles matching web app
export const shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.13,
    shadowRadius: 25,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 16,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

// Helper to create themed styles
export function createThemedStyles<T extends StyleSheet.NamedStyles<any>>(
  stylesFn: (themeColors: any, isDark: boolean) => T
) {
  return (themeColors: any, isDark: boolean) => {
    return StyleSheet.create(stylesFn(themeColors, isDark));
  };
}

// Common component styles
export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    padding: spacing[4],
  },
  
  // Text styles
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },
  
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
  
  body: {
    fontSize: fontSize.base,
    lineHeight: fontSize.base * 1.5,
  },
  
  // Button base styles
  button: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  
  // Input base styles
  input: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fontSize.base,
  },
  
  // Card styles
  card: {
    padding: spacing[4],
    borderRadius: radius.lg,
    ...shadows.sm,
  },
});

// Animation durations matching web app
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;