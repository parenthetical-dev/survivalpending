import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../constants/colors';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  colors: typeof colors.light | typeof colors.dark;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'survivalpending_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    // Load saved theme preference
    loadThemePreference();
  }, []);

  useEffect(() => {
    // Update isDark when theme or system color scheme changes
    if (theme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const currentColors = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors: currentColors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}