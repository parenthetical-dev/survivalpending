// OKLCH color system matching the web app
// Note: React Native doesn't support OKLCH natively, so we convert to hex

export const colors = {
  light: {
    // Background & Foreground
    background: '#ffffff', // oklch(1 0 0)
    foreground: '#1c1917', // oklch(0.141 0.005 285.823)
    
    // Card & Popover
    card: '#ffffff', // oklch(1 0 0)
    cardForeground: '#1c1917', // oklch(0.141 0.005 285.823)
    popover: '#ffffff', // oklch(1 0 0)
    popoverForeground: '#1c1917', // oklch(0.141 0.005 285.823)
    
    // Primary
    primary: '#1c1917', // oklch(0.21 0.006 285.885)
    primaryForeground: '#fafaf9', // oklch(0.982 0.001 286.027)
    
    // Secondary/Muted/Accent
    secondary: '#f5f5f4', // oklch(0.967 0.001 286.375)
    secondaryForeground: '#1c1917', // oklch(0.141 0.005 285.823)
    muted: '#f5f5f4', // oklch(0.967 0.001 286.375)
    mutedForeground: '#78716c', // oklch(0.5 0.015 286.067)
    accent: '#f5f5f4', // oklch(0.967 0.001 286.375)
    accentForeground: '#1c1917', // oklch(0.141 0.005 285.823)
    
    // Destructive
    destructive: '#dc2626', // oklch(0.577 0.245 27.325)
    destructiveForeground: '#fafaf9', // oklch(0.982 0.001 286.027)
    
    // Border & Ring
    border: '#e7e5e4', // oklch(0.92 0.004 286.32)
    input: '#e7e5e4', // oklch(0.92 0.004 286.32)
    ring: '#1c1917', // oklch(0.141 0.005 285.823)
    
    // Chart colors
    chart1: '#e11d48', // oklch(0.601 0.24 17.686)
    chart2: '#14b8a6', // oklch(0.698 0.17 172.612)
    chart3: '#06b6d4', // oklch(0.693 0.167 222.394)
    chart4: '#f59e0b', // oklch(0.719 0.19 80.257)
    chart5: '#10b981', // oklch(0.697 0.168 160.156)
    
    // Sidebar
    sidebar: '#fafaf9', // oklch(0.982 0.001 286.027)
    sidebarForeground: '#1c1917', // oklch(0.141 0.005 285.823)
    sidebarPrimary: '#1c1917', // oklch(0.141 0.005 285.823)
    sidebarPrimaryForeground: '#fafaf9', // oklch(0.982 0.001 286.027)
    sidebarAccent: '#f5f5f4', // oklch(0.967 0.001 286.375)
    sidebarAccentForeground: '#1c1917', // oklch(0.141 0.005 285.823)
    sidebarBorder: '#e7e5e4', // oklch(0.92 0.004 286.32)
    sidebarRing: '#1c1917', // oklch(0.141 0.005 285.823)
    
    // Status colors
    warning: '#f59e0b',
    success: '#10b981',
  },
  dark: {
    // Background & Foreground
    background: '#1c1917', // oklch(0.141 0.005 285.823)
    foreground: '#fafaf9', // oklch(0.985 0 0)
    
    // Card & Popover
    card: '#1c1917', // oklch(0.141 0.005 285.823)
    cardForeground: '#fafaf9', // oklch(0.985 0 0)
    popover: '#1c1917', // oklch(0.141 0.005 285.823)
    popoverForeground: '#fafaf9', // oklch(0.985 0 0)
    
    // Primary
    primary: '#e7e5e4', // oklch(0.92 0.004 286.32)
    primaryForeground: '#1c1917', // oklch(0.141 0.005 285.823)
    
    // Secondary/Muted/Accent
    secondary: '#44403c', // oklch(0.274 0.006 286.033)
    secondaryForeground: '#fafaf9', // oklch(0.985 0 0)
    muted: '#44403c', // oklch(0.274 0.006 286.033)
    mutedForeground: '#a8a29e', // oklch(0.676 0.01 285.938)
    accent: '#44403c', // oklch(0.274 0.006 286.033)
    accentForeground: '#fafaf9', // oklch(0.985 0 0)
    
    // Destructive
    destructive: '#991b1b', // oklch(0.403 0.181 22.216)
    destructiveForeground: '#fafaf9', // oklch(0.985 0 0)
    
    // Border & Ring
    border: '#44403c', // oklch(0.274 0.006 286.033)
    input: '#44403c', // oklch(0.274 0.006 286.033)
    ring: '#d6d3d1', // oklch(0.862 0.003 285.816)
    
    // Chart colors
    chart1: '#f43f5e', // oklch(0.619 0.261 17.415)
    chart2: '#10b981', // oklch(0.697 0.168 160.156)
    chart3: '#06b6d4', // oklch(0.693 0.167 222.394)
    chart4: '#f59e0b', // oklch(0.719 0.19 80.257)
    chart5: '#6366f1', // oklch(0.553 0.192 276.935)
    
    // Sidebar
    sidebar: '#292524', // oklch(0.21 0.006 285.885)
    sidebarForeground: '#fafaf9', // oklch(0.985 0 0)
    sidebarPrimary: '#fafaf9', // oklch(0.985 0 0)
    sidebarPrimaryForeground: '#1c1917', // oklch(0.141 0.005 285.823)
    sidebarAccent: '#44403c', // oklch(0.274 0.006 286.033)
    sidebarAccentForeground: '#fafaf9', // oklch(0.985 0 0)
    sidebarBorder: '#44403c', // oklch(0.274 0.006 286.033)
    sidebarRing: '#d6d3d1', // oklch(0.862 0.003 285.816)
    
    // Status colors
    warning: '#f59e0b',
    success: '#10b981',
  },
} as const;

// Helper to get color based on theme
export const getColor = (colorName: keyof typeof colors.light, isDark: boolean) => {
  return isDark ? colors.dark[colorName] : colors.light[colorName];
};

// Common color aliases
export const commonColors = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Gray scale
  gray: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#06b6d4',
} as const;