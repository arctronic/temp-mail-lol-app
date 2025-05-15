import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, useColorScheme } from 'react-native';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      intensity={colorScheme === 'dark' ? 50 : 100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
