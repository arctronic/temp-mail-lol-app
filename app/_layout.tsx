import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { GlobalLayout } from '@/components/ui/GlobalLayout';
import { AdProvider } from '@/contexts/AdContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { LookupProvider } from '@/contexts/LookupContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ReloadIntervalProvider } from '@/contexts/ReloadIntervalContext';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <CustomThemeProvider>
          <ReloadIntervalProvider>
            <NotificationProvider>
              <AdProvider>
                <EmailProvider>
                  <LookupProvider>
                    <GlobalLayout>
                      <Stack>
                        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                        <Stack.Screen 
                          name="email" 
                          options={{ 
                            headerShown: false,
                            animation: 'slide_from_right',
                            animationDuration: 250,
                          }} 
                        />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                    </GlobalLayout>
                  </LookupProvider>
                </EmailProvider>
              </AdProvider>
            </NotificationProvider>
          </ReloadIntervalProvider>
        </CustomThemeProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
