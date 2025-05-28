import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useThemePreference } from '../../contexts/ThemeContext';

export default function BlurTabBarBackground() {
  const { activeTheme } = useThemePreference();
  
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint={activeTheme === 'dark' ? 'dark' : 'light'}
      intensity={activeTheme === 'dark' ? 50 : 100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
