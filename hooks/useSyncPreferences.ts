import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type SyncFrequency = 1 | 2 | 5 | 10; // minutes
export type ThemeOverride = 'system' | 'light' | 'dark';

interface SyncPreferences {
  syncFrequency: SyncFrequency;
  themeOverride: ThemeOverride;
}

// Storage keys
const SYNC_FREQUENCY_KEY = '@sync_frequency_minutes';
const THEME_OVERRIDE_KEY = '@theme_override';

export function useSyncPreferences() {
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>(5);
  const [themeOverride, setThemeOverride] = useState<ThemeOverride>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedSyncFreq, savedThemeOverride] = await Promise.all([
        AsyncStorage.getItem(SYNC_FREQUENCY_KEY),
        AsyncStorage.getItem(THEME_OVERRIDE_KEY),
      ]);

      if (savedSyncFreq) {
        const freq = parseInt(savedSyncFreq, 10) as SyncFrequency;
        setSyncFrequency(freq);
      }

      if (savedThemeOverride) {
        setThemeOverride(savedThemeOverride as ThemeOverride);
      }
    } catch (error) {
      console.error('Failed to load sync preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateSyncFrequency = async (frequency: SyncFrequency) => {
    try {
      setSyncFrequency(frequency);
      await AsyncStorage.setItem(SYNC_FREQUENCY_KEY, frequency.toString());
    } catch (error) {
      console.error('Failed to save sync frequency:', error);
      throw error;
    }
  };

  const updateThemeOverride = async (theme: ThemeOverride) => {
    try {
      setThemeOverride(theme);
      await AsyncStorage.setItem(THEME_OVERRIDE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme override:', error);
      throw error;
    }
  };

  return {
    syncFrequency,
    themeOverride,
    isLoaded,
    updateSyncFrequency,
    updateThemeOverride,
  };
} 