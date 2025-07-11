import React from 'react';
import {
  View,
  ViewProps,
  StatusBar,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SafeAreaViewProps extends ViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeAreaView({ 
  children, 
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  ...props 
}: SafeAreaViewProps) {
  const { colors } = useTheme();

  // Custom insets for specific edges
  const customStyle = {
    paddingTop: edges.includes('top') ? (StatusBar.currentHeight || 0) : 0,
    paddingBottom: edges.includes('bottom') ? (Platform.OS === 'ios' ? 34 : 0) : 0,
    paddingLeft: edges.includes('left') ? 0 : 0,
    paddingRight: edges.includes('right') ? 0 : 0,
  };

  return (
    <View 
      style={[
        { flex: 1, backgroundColor: colors.background },
        customStyle,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}