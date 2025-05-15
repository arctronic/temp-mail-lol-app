import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  activeTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme() || 'light';
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Initial load of saved theme
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const savedPreference = await AsyncStorage.getItem('themePreference');
        if (savedPreference) {
          setThemePreference(savedPreference as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadThemePreference();
  }, []);

  // Change theme preference
  const changeThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem('themePreference', preference);
      setThemePreference(preference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Determine active theme based on preference
  const activeTheme = themePreference === 'system' 
    ? systemColorScheme 
    : themePreference;
  
  // Don't render until initial theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        themePreference, 
        setThemePreference: changeThemePreference,
        activeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemePreference must be used within a ThemeProvider');
  }
  return context;
} 