import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Notification management types
export interface LookupEmailInfo {
  email: string;
  lastChecked: Date;
  hasUnreadEmails: boolean;
  unreadCount: number;
  latestMessage?: {
    id: string;
    from: string;
    subject: string;
    date: string;
    to: string;
  };
}

// Task 3.3: Global Toast/Snackbar System
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface NotificationContextType {
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  // Email notifications
  updateLookupEmailStatus: (email: string, hasUnread: boolean, count: number, latestMessage?: any) => void;
  clearLookupEmailStatus: (email: string) => void;
  getLookupEmailStatus: (email: string) => LookupEmailInfo | undefined;
  getAllLookupStatuses: () => LookupEmailInfo[];
  
  // Task 3.3: Global Toast System
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type'], duration?: number, action?: ToastMessage['action']) => void;
  showSuccessToast: (message: string, duration?: number) => void;
  showErrorToast: (message: string, duration?: number) => void;
  showInfoToast: (message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY_NOTIFICATIONS = 'notifications_enabled';

// Latest Expo SDK 53 approach: Safer notification imports with better error handling
let Notifications: any = null;
let notificationsSupported = false;

try {
  Notifications = require('expo-notifications');
  
  // Check if we're in a supported environment
  // In Expo SDK 53+, push notifications don't work in Expo Go, but local notifications do
  notificationsSupported = Device.isDevice;
  
  if (notificationsSupported) {
    // Configure notification handler with latest best practices
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    
    console.log('📱 Notifications initialized successfully');
  } else {
    console.log('📱 Notifications require physical device');
  }
} catch (error) {
  console.log('📱 expo-notifications not available:', error);
  notificationsSupported = false;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [lookupStatuses, setLookupStatuses] = useState<Map<string, LookupEmailInfo>>(new Map());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // Request permissions on startup if supported
  useEffect(() => {
    const requestPermissions = async () => {
      if (notificationsSupported && Notifications && notificationsEnabled) {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status === 'granted') {
            console.log('📱 Notification permissions granted');
          } else {
            console.log('📱 Notification permissions denied');
          }
        } catch (error) {
          console.log('📱 Failed to request notification permissions:', error);
        }
      }
    };
    
    requestPermissions();
  }, [notificationsEnabled]);

  const setNotificationsEnabled = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(enabled));
      setNotificationsEnabledState(enabled);
      
      if (enabled) {
        // Request permissions when enabling
        if (notificationsSupported && Notifications) {
          await Notifications.requestPermissionsAsync();
        }
      }
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  const updateLookupEmailStatus = useCallback((email: string, hasUnread: boolean, count: number, latestMessage?: any) => {
    setLookupStatuses(prev => {
      const newMap = new Map(prev);
      const currentStatus = newMap.get(email);
      
      const updatedStatus: LookupEmailInfo = {
        email,
        lastChecked: new Date(),
        hasUnreadEmails: hasUnread,
        unreadCount: count,
        latestMessage,
      };

      newMap.set(email, updatedStatus);
      
      // Show local notification if this is a new unread email (compared to previous state)
      if (notificationsSupported && notificationsEnabled && hasUnread && count > 0 && 
          (!currentStatus || currentStatus.unreadCount < count)) {
        
        // Trigger haptic feedback for new emails
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        // Schedule local notification for new emails
        if (Notifications && latestMessage) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: `📧 New email in ${email}`,
              body: `From: ${latestMessage.from}\nSubject: ${latestMessage.subject || 'No subject'}`,
              data: {
                email,
                messageId: latestMessage.id,
                type: 'new_email'
              },
            },
            trigger: null, // Show immediately
          }).catch((error: any) => {
            console.log('Failed to schedule notification:', error);
          });
        }
      }
      
      return newMap;
    });
  }, [notificationsEnabled]);

  const clearLookupEmailStatus = useCallback((email: string) => {
    setLookupStatuses(prev => {
      const newMap = new Map(prev);
      newMap.delete(email);
      return newMap;
    });
  }, []);

  const getLookupEmailStatus = useCallback((email: string) => {
    return lookupStatuses.get(email);
  }, [lookupStatuses]);

  const getAllLookupStatuses = useCallback(() => {
    return Array.from(lookupStatuses.values());
  }, [lookupStatuses]);

  // Task 3.3: Toast System Implementation
  const generateToastId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const showToast = useCallback((
    message: string, 
    type: ToastMessage['type'] = 'info', 
    duration: number = 4000,
    action?: ToastMessage['action']
  ) => {
    const id = generateToastId();
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration,
      action,
    };

    // Add haptic feedback based on toast type
    switch (type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }

    setToasts(prev => [...prev, newToast]);

    // Auto-hide toast after duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  }, []);

  const showSuccessToast = useCallback((message: string, duration: number = 3000) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const showErrorToast = useCallback((message: string, duration: number = 5000) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const showInfoToast = useCallback((message: string, duration: number = 4000) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: NotificationContextType = {
    notificationsEnabled,
    notificationsSupported,
    setNotificationsEnabled,
    updateLookupEmailStatus,
    clearLookupEmailStatus,
    getLookupEmailStatus,
    getAllLookupStatuses,
    
    // Toast system
    toasts,
    showToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 