import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../utils/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style }: CardTitleProps) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.title, { color: colors.cardForeground }, style]}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.description, { color: colors.mutedForeground }, style]}>
      {children}
    </Text>
  );
}

export function CardContent({ children, style, ...props }: CardContentProps) {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style, ...props }: CardFooterProps) {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    ...shadows.sm,
  },
  header: {
    padding: spacing[6],
    paddingBottom: 0,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize['2xl'] * 1.2,
  },
  description: {
    fontSize: fontSize.sm,
    marginTop: spacing[2],
    lineHeight: fontSize.sm * 1.5,
  },
  content: {
    padding: spacing[6],
  },
  footer: {
    padding: spacing[6],
    paddingTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});