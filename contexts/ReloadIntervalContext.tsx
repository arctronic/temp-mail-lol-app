import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'tempmail_reload_interval';
const DEFAULT_INTERVAL = 60; // Default to 60 seconds
const MIN_INTERVAL = 20; // Minimum of 20 seconds
const MAX_INTERVAL = 300; // Maximum of 5 minutes (300 seconds)

interface ReloadIntervalContextType {
  reloadInterval: number; // in seconds
  setReloadInterval: (interval: number) => void;
}

const ReloadIntervalContext = createContext<ReloadIntervalContextType | undefined>(undefined);

export function ReloadIntervalProvider({ children }: { children: React.ReactNode }) {
  const [reloadInterval, setReloadIntervalState] = useState<number>(DEFAULT_INTERVAL);

  // Load saved interval from storage on initial mount
  useEffect(() => {
    const loadSavedInterval = async () => {
      try {
        const savedInterval = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedInterval) {
          const interval = parseInt(savedInterval, 10);
          if (!isNaN(interval) && interval >= MIN_INTERVAL && interval <= MAX_INTERVAL) {
            setReloadIntervalState(interval);
          }
        }
      } catch (error) {
        console.error('Failed to load reload interval:', error);
      }
    };

    loadSavedInterval();
  }, []);

  // Save interval to storage whenever it changes
  const setReloadInterval = async (interval: number) => {
    // Ensure interval is within allowed range
    const validInterval = Math.min(Math.max(interval, MIN_INTERVAL), MAX_INTERVAL);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, validInterval.toString());
      setReloadIntervalState(validInterval);
    } catch (error) {
      console.error('Failed to save reload interval:', error);
    }
  };

  return (
    <ReloadIntervalContext.Provider value={{ reloadInterval, setReloadInterval }}>
      {children}
    </ReloadIntervalContext.Provider>
  );
}

export function useReloadInterval() {
  const context = useContext(ReloadIntervalContext);
  if (context === undefined) {
    throw new Error('useReloadInterval must be used within a ReloadIntervalProvider');
  }
  return context;
} 