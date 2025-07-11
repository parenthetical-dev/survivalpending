import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { fontSize, fontWeight } from '../../utils/theme';
import { getFontFamily } from '../../utils/fonts';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'mono';
  color?: 'primary' | 'secondary' | 'muted' | 'destructive' | 'inherit';
  weight?: keyof typeof fontWeight;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export function Text({
  variant = 'body',
  color = 'inherit',
  weight,
  align,
  children,
  style,
  ...props
}: TextProps) {
  const { colors } = useTheme();

  const getColor = () => {
    switch (color) {
      case 'primary':
        return colors.foreground;
      case 'secondary':
        return colors.secondaryForeground;
      case 'muted':
        return colors.mutedForeground;
      case 'destructive':
        return colors.destructive;
      case 'inherit':
      default:
        return colors.foreground;
    }
  };

  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'h4':
        return styles.h4;
      case 'h5':
        return styles.h5;
      case 'h6':
        return styles.h6;
      case 'caption':
        return styles.caption;
      case 'mono':
        return styles.mono;
      case 'body':
      default:
        return styles.body;
    }
  };

  const textStyles: (TextStyle | undefined)[] = [
    getVariantStyles(),
    { color: getColor() },
    weight ? { fontWeight: fontWeight[weight] } : undefined,
    align ? { textAlign: align } : undefined,
    style,
  ].filter((s): s is TextStyle => s !== undefined);

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * 1.1,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['3xl'] * 1.2,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * 1.3,
  },
  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * 1.4,
  },
  h5: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.lg * 1.4,
  },
  h6: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.base * 1.5,
  },
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.base * 1.5,
  },
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * 1.4,
  },
  mono: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    fontFamily: getFontFamily('mono'),
    lineHeight: fontSize.sm * 1.5,
  },
});