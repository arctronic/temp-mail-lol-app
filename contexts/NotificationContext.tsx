import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface NotificationContextType {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY_NOTIFICATIONS = 'notifications_enabled';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true); // Default to enabled

  // Load notification preference on mount
  useEffect(() => {
    const loadNotificationPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
        if (stored !== null) {
          setNotificationsEnabledState(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading notification preference:', error);
      }
    };
    
    loadNotificationPreference();
  }, []);

  const setNotificationsEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(enabled));
      setNotificationsEnabledState(enabled);
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  const value = {
    notificationsEnabled,
    setNotificationsEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationSettings() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationSettings must be used within a NotificationProvider');
  }
  return context;
} 