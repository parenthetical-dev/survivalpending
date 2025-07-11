import * as Font from 'expo-font';

// Font family names matching the web app
export const FONTS = {
  body: 'System', // Will use Switzer when available
  mono: {
    regular: 'JetBrainsMono-Regular',
    medium: 'JetBrainsMono-Medium',
  },
  heading: 'System', // Will use Satoshi when available
} as const;

// Font loading configuration
export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      // JetBrains Mono fonts
      'JetBrainsMono-Regular': require('../../assets/fonts/JetBrainsMono-Regular.ttf'),
      'JetBrainsMono-Medium': require('../../assets/fonts/JetBrainsMono-Medium.ttf'),
      'Switzer-Regular': require('../../assets/fonts/Switzer-Regular.ttf'),
      'Switzer-Medium': require('../../assets/fonts/Switzer-Medium.ttf'),
      'Switzer-Semibold': require('../../assets/fonts/Switzer-Semibold.ttf'),
      'Switzer-Bold': require('../../assets/fonts/Switzer-Bold.ttf'),
      'Satoshi-Black': require('../../assets/fonts/Satoshi-Black.ttf'),
    });
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
};

// Helper to get font family
export const getFontFamily = (type: 'body' | 'mono' | 'heading' = 'body') => {
  switch (type) {
    case 'mono':
      return FONTS.mono.regular;
    case 'heading':
      return FONTS.heading;
    default:
      return FONTS.body;
  }
};