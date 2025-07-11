import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../utils/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressDots({ total, current, size = 'md' }: ProgressDotsProps) {
  const { colors } = useTheme();

  const dotSize = {
    sm: 6,
    md: 8,
    lg: 10,
  }[size];

  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              backgroundColor: i === current ? colors.foreground : colors.muted,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  dot: {
    borderRadius: 999,
  },
});