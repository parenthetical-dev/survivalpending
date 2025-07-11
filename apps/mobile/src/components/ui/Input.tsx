import React, { forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, radius, shadows } from '../../utils/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerStyle, style, ...props }, ref) => {
    const { colors, isDark } = useTheme();

    const inputStyles = [
      styles.input,
      {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.background,
        borderColor: error ? colors.destructive : colors.input,
        color: colors.foreground,
      },
      style,
    ];

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
        )}
        <TextInput
          ref={ref}
          style={inputStyles}
          placeholderTextColor={colors.mutedForeground}
          selectionColor={colors.primary}
          {...props}
        />
        {error && (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: fontSize.sm,
    marginBottom: spacing[2],
    fontWeight: '500',
  },
  input: {
    height: 36,
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    fontSize: fontSize.base,
    borderWidth: 1,
    ...shadows.xs,
  },
  error: {
    fontSize: fontSize.xs,
    marginTop: spacing[1],
    marginLeft: spacing[1],
  },
});