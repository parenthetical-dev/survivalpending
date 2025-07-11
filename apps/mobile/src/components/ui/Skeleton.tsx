import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radius } from '../../utils/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = radius.md,
  style,
}: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const baseStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius,
    backgroundColor: isDark ? colors.secondary : colors.muted,
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        baseStyle,
        { opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});