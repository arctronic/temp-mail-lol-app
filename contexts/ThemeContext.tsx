import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, useColorScheme } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  activeTheme: 'light' | 'dark';
  themeVersion: number; // Add version number to trigger rerenders
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme() || 'light';
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [themeVersion, setThemeVersion] = useState(0); // Version to force rerenders
  const [isLoading, setIsLoading] = useState(true);

  // Compute active theme based on preference and system
  const activeTheme = themePreference === 'system' 
    ? systemColorScheme 
    : themePreference;

  // Detect app state changes to update theme
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Force theme refresh when app becomes active
        setThemeVersion(prev => prev + 1);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Watch for system color scheme changes
  useEffect(() => {
    // Force theme refresh when system theme changes
    setThemeVersion(prev => prev + 1);
  }, [systemColorScheme]);

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
      // Increment version to force rerenders
      setThemeVersion(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
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
        themeVersion,
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