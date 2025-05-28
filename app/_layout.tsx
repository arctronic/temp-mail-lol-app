import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { AppState, Platform, StyleSheet } from 'react-native';
import { GlobalLayout } from '../components/ui/GlobalLayout';
import { EmailProvider } from '../contexts/EmailContext';
import { LookupProvider } from '../contexts/LookupContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ReloadIntervalProvider } from '../contexts/ReloadIntervalContext';
import { ThemeProvider, useThemePreference } from '../contexts/ThemeContext';

// Optional notifications import
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('expo-notifications not available');
}

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
  const router = useRouter();
  
  // Handle notification responses (when user taps notification)
  useEffect(() => {
    if (!Notifications) return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      
      if (data?.action === 'openEmail' && data?.latestMessage) {
        const message = data.latestMessage;
        
        // Navigate to the email detail screen
        router.push({
          pathname: '/email',
          params: {
            id: message.id,
            from: message.from,
            to: message.to,
            subject: message.subject,
            date: message.date,
            fromLookup: 'true',
            autoMarkRead: 'true' // Flag to automatically mark as read
          }
        });
      }
    });

    return () => subscription.remove();
  }, [router]);
  
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

  // Configure system UI for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      // This will be handled by the StatusBar component in GlobalLayout
      console.log('Configuring Android system UI for theme:', activeTheme);
    }
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
            <NotificationProvider>
              <LookupProvider>
                <GlobalLayout>
                  <AppWithTheme />
                </GlobalLayout>
              </LookupProvider>
            </NotificationProvider>
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
