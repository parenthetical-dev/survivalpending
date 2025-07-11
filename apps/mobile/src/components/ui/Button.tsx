import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../utils/theme';
import { useHaptics } from '../../hooks/useHaptics';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'default',
  size = 'default',
  children,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const haptics = useHaptics();

  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[size],
    ...(fullWidth ? [styles.fullWidth] : []),
    ...(disabled ? [styles.disabled] : []),
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
  ];

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.primary,
        };
      case 'destructive':
        return {
          backgroundColor: colors.destructive,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.input,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          paddingHorizontal: 0,
          paddingVertical: 0,
        };
      default:
        return {};
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'default':
        return colors.primaryForeground;
      case 'destructive':
        return colors.destructiveForeground;
      case 'outline':
      case 'ghost':
      case 'link':
        return colors.foreground;
      case 'secondary':
        return colors.secondaryForeground;
      default:
        return colors.foreground;
    }
  };

  const handlePress = (event: any) => {
    if (!disabled && !loading) {
      // Trigger haptic feedback based on variant
      if (variant === 'destructive') {
        haptics.warning();
      } else if (variant === 'ghost' || variant === 'link') {
        haptics.light();
      } else {
        haptics.medium();
      }
    }
    onPress?.(event);
  };

  return (
    <TouchableOpacity
      style={[buttonStyles, getVariantStyles(), style]}
      disabled={disabled || loading}
      onPress={handlePress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : typeof children === 'string' ? (
        <Text style={[textStyles, { color: getTextColor() }]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    ...shadows.xs,
  },
  
  // Size variants
  default: {
    height: 36,
    paddingHorizontal: spacing[4],
  },
  sm: {
    height: 32,
    paddingHorizontal: spacing[3],
  },
  lg: {
    height: 40,
    paddingHorizontal: spacing[6],
  },
  icon: {
    width: 36,
    height: 36,
    padding: 0,
  },
  
  // Variant styles (base colors set dynamically)
  destructive: {},
  outline: {},
  secondary: {},
  ghost: {},
  link: {
    height: 'auto',
  },
  
  // Text styles
  text: {
    fontWeight: fontWeight.semibold,
  },
  defaultText: {
    fontSize: fontSize.base,
  },
  smText: {
    fontSize: fontSize.sm,
  },
  lgText: {
    fontSize: fontSize.base,
  },
  iconText: {
    fontSize: fontSize.base,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});