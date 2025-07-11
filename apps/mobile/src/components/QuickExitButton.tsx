import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from './ui';
import { useTheme } from '../contexts/ThemeContext';
import { quickExit } from '../services/quickExit';
import { spacing, radius, shadows } from '../utils/theme';

interface QuickExitButtonProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  style?: any;
}

export function QuickExitButton({ 
  position = 'top-right',
  style 
}: QuickExitButtonProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    quickExit.handleTap();
  };

  const positionStyles = {
    'top-right': { top: spacing[12], right: spacing[4] },
    'top-left': { top: spacing[12], left: spacing[4] },
    'bottom-right': { bottom: spacing[8], right: spacing[4] },
    'bottom-left': { bottom: spacing[8], left: spacing[4] },
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        positionStyles[position],
        { backgroundColor: colors.destructive },
        style,
      ]}
      activeOpacity={0.8}
    >
      <Text variant="caption" weight="semibold" style={{ color: colors.destructiveForeground }}>
        EXIT
      </Text>
      <View style={styles.tapIndicator}>
        <Text variant="caption" style={{ color: colors.destructiveForeground, fontSize: 10 }}>
          3x
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    ...shadows.lg,
  },
  tapIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
});