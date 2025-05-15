import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { AppState, StyleSheet } from 'react-native';
import { GlobalLayout } from '../components/ui/GlobalLayout';
import { EmailProvider } from '../contexts/EmailContext';
import { LookupProvider } from '../contexts/LookupContext';
import { ReloadIntervalProvider } from '../contexts/ReloadIntervalContext';
import { ThemeProvider, useThemePreference } from '../contexts/ThemeContext';

// Create a client with optimized settings for better UX
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      // Don't show loading state for first 500ms to prevent UI flicker
      staleTime: 10 * 1000, // 10 seconds
      // For better UX, wait a bit before showing loading indicator on refetch
      refetchInterval: 30 * 1000, // 30 seconds
    },
  },
});

// Create a wrapper component that can access the theme context
function AppWithTheme() {
  const { activeTheme } = useThemePreference();
  
  // Force theme update when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // This will trigger a re-render with the current theme
        console.log('App is active, current theme:', activeTheme);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [activeTheme]);

  return (
    <Stack 
      initialRouteName="(drawer)"
      screenOptions={{
        contentStyle: {
          backgroundColor: activeTheme === 'dark' ? '#121212' : '#ffffff',
        },
      }}>
      <Stack.Screen
        name="(drawer)"
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name="email"
        options={{
          headerShown: false, // Hide header for email detail screen
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ReloadIntervalProvider>
          <EmailProvider>
            <LookupProvider>
              <GlobalLayout>
                <AppWithTheme />
              </GlobalLayout>
            </LookupProvider>
          </EmailProvider>
        </ReloadIntervalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
});
