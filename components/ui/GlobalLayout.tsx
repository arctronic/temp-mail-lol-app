import * as NavigationBar from 'expo-navigation-bar';
import { usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { ReactNode, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemePreference } from '../../contexts/ThemeContext';
import { useThemeColor } from '../../hooks/useThemeColor';
import { FloatingInboxButton } from './FloatingInboxButton';

interface GlobalLayoutProps {
  children: ReactNode;
}

export const GlobalLayout = ({ children }: GlobalLayoutProps) => {
  const pathname = usePathname();
  const { activeTheme } = useThemePreference();
  const backgroundColor = useThemeColor({}, 'background');
  
  // Configure Android navigation bar
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(backgroundColor);
      NavigationBar.setButtonStyleAsync(activeTheme === 'dark' ? 'light' : 'dark');
    }
  }, [activeTheme, backgroundColor]);
  
  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar 
          style={activeTheme === 'dark' ? 'light' : 'dark'} 
          backgroundColor={backgroundColor}
        />
        {children}
        <FloatingInboxButton currentRoute={pathname} />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 