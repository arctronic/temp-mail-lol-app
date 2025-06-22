import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAds } from './AdContext';
import { Email } from './EmailContext';
import { useNotificationSettings } from './NotificationContext';

// Configure notifications only if available
let Notifications: any = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  notificationsAvailable = true;
  
  // Only configure notifications if not in Expo Go
  if (!__DEV__ || Platform.OS !== 'android') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (error) {
  console.log('expo-notifications not available - notifications disabled');
  notificationsAvailable = false;
}

interface LookupEmail {
  address: string;
  addedAt: number; // timestamp
  lastFetchedAt: number; // timestamp
}

interface LookupEmailWithMessages extends LookupEmail {
  messages: Email[];
  unreadCount?: number;
}

interface LookupContextType {
  lookupEmails: LookupEmailWithMessages[];
  addEmailToLookup: (email: string) => Promise<void>;
  removeEmailFromLookup: (email: string) => Promise<void>;
  refreshLookupEmails: () => Promise<void>;
  markEmailAsRead: (emailAddress: string, messageId: string) => Promise<void>;
  isEmailRead: (emailAddress: string, messageId: string) => boolean;
  getUnreadCount: (emailAddress: string) => number;
  getTotalUnreadCount: () => number;
  isLoading: boolean;
  error: Error | null;
}

const LookupContext = createContext<LookupContextType | undefined>(undefined);

// Get API base URL from environment variables
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://api.example.com';

// Storage keys
const STORAGE_KEY_LOOKUP_EMAILS = 'temp_mail_lookup_emails';
const STORAGE_KEY_EMAIL_MESSAGES_PREFIX = 'temp_mail_messages_';
const STORAGE_KEY_READ_STATUS_PREFIX = 'temp_mail_read_status_';

// Constants for data management
const MAX_MESSAGES_PER_EMAIL = 50; // Limit to prevent storage overflow
const MAX_MESSAGE_CONTENT_LENGTH = 10000; // Limit individual message size
const MESSAGE_CLEANUP_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Generate a unique ID for messages to avoid duplicates
const generateMessageUniqueId = (email: Email) => {
  return `${email.sender}_${email.receiver}_${email.date.$date}`;
};

// Helper function to truncate message content
const truncateMessageContent = (message: string): string => {
  if (message.length > MAX_MESSAGE_CONTENT_LENGTH) {
    return message.substring(0, MAX_MESSAGE_CONTENT_LENGTH) + '... [Message truncated for storage efficiency]';
  }
  return message;
};

// Helper function to clean old messages
const cleanupOldMessages = (messages: Email[]): Email[] => {
  // Sort by date (newest first) and limit to MAX_MESSAGES_PER_EMAIL
  const sortedMessages = messages
    .sort((a, b) => {
      const dateA = new Date(typeof a.date === 'string' ? a.date : a.date.$date);
      const dateB = new Date(typeof b.date === 'string' ? b.date : b.date.$date);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, MAX_MESSAGES_PER_EMAIL);

  // Truncate message content to prevent storage overflow
  return sortedMessages.map(message => ({
    ...message,
    message: truncateMessageContent(message.message)
  }));
};

// Safe AsyncStorage operations with error handling
const safeAsyncStorageSetItem = async (key: string, value: string): Promise<boolean> => {
  try {
    // Check if the data size is reasonable (< 1MB per item)
    const dataSize = new Blob([value]).size;
    if (dataSize > 1024 * 1024) { // 1MB limit
      console.warn(`Data size for key ${key} is too large: ${dataSize} bytes. Skipping storage.`);
      return false;
    }
    
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to store data for key ${key}:`, error);
    
    // If storage failed due to size, try to clear some old data
    if (error instanceof Error && error.message.includes('Row too big')) {
      try {
        // Try to clear old message data
        const keys = await AsyncStorage.getAllKeys();
        const messageKeys = keys.filter(k => k.startsWith(STORAGE_KEY_EMAIL_MESSAGES_PREFIX));
        
        // Remove oldest message stores
        if (messageKeys.length > 5) {
          const keysToRemove = messageKeys.slice(5);
          await AsyncStorage.multiRemove(keysToRemove);
          console.log(`Cleaned up ${keysToRemove.length} old message stores`);
        }
        
        // Try storing again with cleaned data
        await AsyncStorage.setItem(key, value);
        return true;
      } catch (cleanupError) {
        console.error('Failed to clean up and retry storage:', cleanupError);
        return false;
      }
    }
    
    return false;
  }
};

const safeAsyncStorageGetItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to retrieve data for key ${key}:`, error);
    return null;
  }
};

export function LookupProvider({ children }: { children: React.ReactNode }) {
  const [lookupEmails, setLookupEmails] = useState<LookupEmailWithMessages[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { notificationsEnabled } = useNotificationSettings();
  const { showInterstitialAd, canShowAd, incrementAction } = useAds();
  
  // In-memory cache reference for faster access
  const memoryCache = useRef<Record<string, Email[]>>({});
  // Read status cache
  const readStatusCache = useRef<Record<string, Set<string>>>({});
  // Current lookup emails ref to avoid dependency issues
  const lookupEmailsRef = useRef<LookupEmailWithMessages[]>([]);

  // Update ref whenever lookupEmails changes
  useEffect(() => {
    lookupEmailsRef.current = lookupEmails;
  }, [lookupEmails]);

  // Request notification permissions on mount (only if notifications available)
  useEffect(() => {
    const requestPermissions = async () => {
      if (notificationsAvailable && Notifications && !(__DEV__ && Platform.OS === 'android')) {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.log('Notification permissions not granted');
          }
        } catch (error) {
          console.log('Failed to request notification permissions:', error);
        }
      } else {
        console.log('Skipping notification permissions in Expo Go development');
      }
    };
    requestPermissions();
  }, []);

  // Load saved lookup emails on mount
  useEffect(() => {
    const loadLookupEmails = async () => {
      try {
        console.log('Loading lookup emails from storage...');
        const storedEmails = await safeAsyncStorageGetItem(STORAGE_KEY_LOOKUP_EMAILS);
        
        if (storedEmails) {
          const parsedEmails: LookupEmail[] = JSON.parse(storedEmails);
          
          // Load messages and read status for each email
          const emailsWithMessages: LookupEmailWithMessages[] = await Promise.all(
            parsedEmails.map(async (email) => {
              const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${email.address}`;
              const readStatusKey = `${STORAGE_KEY_READ_STATUS_PREFIX}${email.address}`;
              
              const storedMessages = await safeAsyncStorageGetItem(messagesKey);
              const storedReadStatus = await safeAsyncStorageGetItem(readStatusKey);
              
              let messages = storedMessages ? JSON.parse(storedMessages) : [];
              const readMessageIds = storedReadStatus ? new Set<string>(JSON.parse(storedReadStatus)) : new Set<string>();
              
              // Clean up messages to prevent storage overflow
              messages = cleanupOldMessages(messages);
              
              // Cache the cleaned messages and read status in memory for faster access
              memoryCache.current[email.address] = messages;
              readStatusCache.current[email.address] = readMessageIds;
              
              // Mark messages as read/unread based on stored status
              const messagesWithReadStatus = messages.map((message: Email) => ({
                ...message,
                read: readMessageIds.has(message.id)
              }));
              
              const unreadCount = messagesWithReadStatus.filter((m: Email) => !m.read).length;
              
              return {
                ...email,
                messages: messagesWithReadStatus,
                unreadCount,
              };
            })
          );
          
          console.log(`Loaded ${emailsWithMessages.length} lookup emails with their messages.`);
          setLookupEmails(emailsWithMessages);
        } else {
          console.log('No stored lookup emails found.');
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading lookup emails:', error);
        // Clear corrupted data and start fresh
        try {
          await AsyncStorage.multiRemove([STORAGE_KEY_LOOKUP_EMAILS]);
          console.log('Cleared corrupted lookup data');
        } catch (clearError) {
          console.error('Failed to clear corrupted data:', clearError);
        }
        setIsInitialized(true);
      }
    };
    
    loadLookupEmails();
  }, []);

  // Send notification for new emails (only if notifications available and enabled)
  const sendNewEmailNotification = useCallback(async (emailAddress: string, newMessages: Email[]) => {
    if (!notificationsAvailable || !Notifications) {
      console.log('Notifications not available - skipping notification');
      return;
    }
    
    if (!notificationsEnabled) {
      console.log('Notifications disabled by user - skipping notification');
      return;
    }
    
    // Skip notifications in development with Expo Go
    if (__DEV__ && Platform.OS === 'android') {
      console.log('Skipping notifications in Expo Go development');
      return;
    }
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Temp Mail - New Email',
          body: `${newMessages.length} new message${newMessages.length > 1 ? 's' : ''} for ${emailAddress}`,
          data: {
            emailAddress,
            count: newMessages.length,
            hasOTP: false,
            // Add the latest message data for deep linking
            latestMessage: newMessages.length > 0 ? {
              id: newMessages[0].id,
              from: newMessages[0].sender,
              to: newMessages[0].receiver,
              subject: newMessages[0].subject,
              date: typeof newMessages[0].date === 'string' ? newMessages[0].date : newMessages[0].date.$date,
            } : null,
            action: 'openEmail'
          },
          sound: true,
          priority: 'default',
        },
        trigger: null, // Send immediately
      });
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [notificationsEnabled]);

  // Create a stable query function using useCallback
  const queryFn = useCallback(async () => {
    const currentEmails = lookupEmailsRef.current;
    if (!isInitialized || currentEmails.length === 0) return currentEmails;
    
    console.log('Syncing lookup emails with server...');
    
    try {
      // First serve from memory cache then fetch updates from server
      const updatedEmails = await Promise.all(
        currentEmails.map(async (lookupEmail) => {
          try {
            // Return immediately from memory cache for UI responsiveness
            const cachedMessages = memoryCache.current[lookupEmail.address] || [];
            
            // Fetch more frequently - only skip if fetched in the last 30 seconds (to avoid excessive calls)
            const shouldFetch = Date.now() - lookupEmail.lastFetchedAt > 30 * 1000;
            
            if (!shouldFetch) {
              console.log(`Skipping fetch for ${lookupEmail.address} - recently updated`);
              return {
                ...lookupEmail,
                messages: cachedMessages
              };
            }
            
            console.log(`Fetching new messages for lookup email: ${lookupEmail.address}`);
            
            // Fetch from server in the background
            const response = await fetch(`${API_BASE_URL}/api/emails/${encodeURIComponent(lookupEmail.address)}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              credentials: 'omit',
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !Array.isArray(data)) {
              return {
                ...lookupEmail,
                lastFetchedAt: Date.now(),
                messages: cachedMessages
              };
            }
            
            // Process and normalize email data
            const newMessages = data.map((email, idx) => ({
              ...email,
              id: email.id || email._id || `${email.subject || 'no-subject'}-${email.date || idx}`,
              date: typeof email.date === 'string' ? { $date: email.date } : email.date,
              created_at: typeof email.created_at === 'string' ? { $date: email.created_at } : email.created_at,
              updated_at: typeof email.updated_at === 'string' ? { $date: email.updated_at } : email.updated_at,
            }));
            
            // Generate unique IDs for existing messages
            const existingMessageIds = new Set(
              cachedMessages.map(generateMessageUniqueId)
            );
            
            // Filter out duplicates and identify truly new messages
            const uniqueNewMessages = newMessages.filter(
              (message) => !existingMessageIds.has(generateMessageUniqueId(message))
            );
            
            if (uniqueNewMessages.length > 0) {
              console.log(`Found ${uniqueNewMessages.length} new messages for ${lookupEmail.address}`);
              
              // Mark new messages as unread
              const newMessagesWithReadStatus = uniqueNewMessages.map(message => ({
                ...message,
                read: false
              }));
              
              // Combine with existing messages
              const combinedMessages = [...cachedMessages, ...newMessagesWithReadStatus];
              
              // Update memory cache first for immediate access
              memoryCache.current[lookupEmail.address] = combinedMessages;
              
              // Calculate unread count
              const currentReadStatus = readStatusCache.current[lookupEmail.address] || new Set<string>();
              const unreadCount = combinedMessages.filter((m: Email) => !currentReadStatus.has(m.id)).length;
              
              // Clean and limit messages before storage
              const cleanedMessages = cleanupOldMessages(combinedMessages);
              
              // Then update AsyncStorage in the background
              const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${lookupEmail.address}`;
              await safeAsyncStorageSetItem(messagesKey, JSON.stringify(cleanedMessages));
              
              // Send notification for new emails
              await sendNewEmailNotification(lookupEmail.address, uniqueNewMessages);
              
              return {
                ...lookupEmail,
                lastFetchedAt: Date.now(),
                messages: combinedMessages,
                unreadCount,
              };
            } else {
              console.log(`No new messages for ${lookupEmail.address}`);
              
              // Still update unread count for existing messages
              const currentReadStatus = readStatusCache.current[lookupEmail.address] || new Set<string>();
              const unreadCount = cachedMessages.filter((m: Email) => !currentReadStatus.has(m.id)).length;
              
              return {
                ...lookupEmail,
                lastFetchedAt: Date.now(),
                messages: cachedMessages,
                unreadCount,
              };
            }
          } catch (err) {
            console.error(`Error fetching messages for ${lookupEmail.address}:`, err);
            // Return existing data on error
            return lookupEmail;
          }
        })
      );
      
      // Save the updated timestamps to AsyncStorage
      await safeAsyncStorageSetItem(
        STORAGE_KEY_LOOKUP_EMAILS, 
        JSON.stringify(updatedEmails.map(({ messages, ...rest }) => rest))
      );
      
      return updatedEmails;
    } catch (err) {
      console.error('Error in fetchLookupEmails:', err);
      return currentEmails;
    }
  }, [isInitialized, sendNewEmailNotification]);

  // Fetch messages for all lookup emails
  const { data: queryData, isLoading, error, refetch } = useQuery({
    queryKey: ['lookupEmails', lookupEmails.map(e => e.address).join(',')],
    queryFn,
    enabled: isInitialized && lookupEmails.length > 0,
    refetchInterval: 30000, // Check every 30 seconds for new messages
    refetchOnWindowFocus: true, // Refetch when app comes back to focus
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchIntervalInBackground: true, // Continue fetching even when app is in background
  });

  // Update lookupEmails when query data changes
  useEffect(() => {
    if (queryData && Array.isArray(queryData)) {
      setLookupEmails(queryData);
    }
  }, [queryData]);

  const addEmailToLookup = async (email: string) => {
    try {
      // Check if already exists
      if (lookupEmails.some(e => e.address === email)) {
        Alert.alert(
          'Already Saved',
          'This email is already in your lookup list.'
        );
        return;
      }
      
      // Check maximum limit of 5 emails
      if (lookupEmails.length >= 5) {
        Alert.alert(
          'Limit Reached',
          'You can only save up to 5 emails in your lookup list. Please remove an existing email to add a new one.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Watch Ad for +5 More', 
              onPress: async () => {
                try {
                  await showInterstitialAd();
                  // Temporarily allow one more email
                  await addEmailToLookupWithoutLimit(email);
                } catch (error) {
                  console.error('Failed to show ad:', error);
                }
              }
            }
          ]
        );
        return;
      }
      
      // Increment lookup counter for ads
      incrementAction('lookup');
      
      // Show ad if conditions are met
      if (canShowAd('lookup')) {
        await showInterstitialAd();
      }
      
      await addEmailToLookupWithoutLimit(email);
      
    } catch (error) {
      console.error('Error adding email to lookup:', error);
      Alert.alert(
        'Error',
        'Failed to add email to lookup list. Please try again.'
      );
    }
  };

  const addEmailToLookupWithoutLimit = async (email: string) => {
    const newLookupEmail: LookupEmailWithMessages = {
      address: email,
      addedAt: Date.now(),
      lastFetchedAt: 0, // Set to 0 to ensure immediate fetch
      messages: [],
    };
    
    // Initialize empty messages array in memory cache
    memoryCache.current[email] = [];
    
    const updatedLookupEmails = [...lookupEmails, newLookupEmail];
    
    // Save to state
    setLookupEmails(updatedLookupEmails);
    
    // Save to AsyncStorage (without messages to avoid duplication)
    await safeAsyncStorageSetItem(
      STORAGE_KEY_LOOKUP_EMAILS, 
      JSON.stringify(updatedLookupEmails.map(({ messages, ...rest }) => rest))
    );
    
    // Initialize empty messages array for this email
    await safeAsyncStorageSetItem(
      `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${email}`,
      JSON.stringify([])
    );
    
    // Trigger immediate fetch for the new email
    setTimeout(() => {
      refetch();
    }, 500);
    
    Alert.alert(
      'Email Added',
      'Email has been added to your lookup list. Checking for messages now...'
    );
  };

  const removeEmailFromLookup = async (email: string) => {
    try {
      const updatedLookupEmails = lookupEmails.filter(e => e.address !== email);
      
      // Update state
      setLookupEmails(updatedLookupEmails);
      
      // Remove from memory cache
      delete memoryCache.current[email];
      
      // Update AsyncStorage
      await safeAsyncStorageSetItem(
        STORAGE_KEY_LOOKUP_EMAILS, 
        JSON.stringify(updatedLookupEmails.map(({ messages, ...rest }) => rest))
      );
      
      // Remove messages
      await AsyncStorage.removeItem(`${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${email}`);
      
      Alert.alert(
        'Email Removed',
        'Email and its messages have been removed from your lookup list.'
      );
    } catch (error) {
      console.error('Error removing email from lookup:', error);
      Alert.alert(
        'Error',
        'Failed to remove email from lookup list. Please try again.'
      );
    }
  };

  const refreshLookupEmails = async () => {
    try {
      // Increment refresh counter for ads
      incrementAction('refresh');
      
      // Show ad if conditions are met
      if (canShowAd('refresh')) {
        await showInterstitialAd();
      }
      
      // Force immediate refetch
      await refetch();
      
      Alert.alert(
        'Refreshed',
        'Your lookup emails have been refreshed with the latest messages.'
      );
    } catch (error) {
      console.error('Error refreshing lookup emails:', error);
      Alert.alert(
        'Error',
        'Failed to refresh lookup emails. Please try again.'
      );
    }
  };

  const markEmailAsRead = async (emailAddress: string, messageId: string) => {
    try {
      // Update read status cache
      if (!readStatusCache.current[emailAddress]) {
        readStatusCache.current[emailAddress] = new Set<string>();
      }
      readStatusCache.current[emailAddress].add(messageId);
      
      // Update lookup emails state
      const updatedEmails = lookupEmails.map(email =>
        email.address === emailAddress ? {
          ...email,
          messages: email.messages.map(message =>
            message.id === messageId ? { ...message, read: true } : message
          ),
          unreadCount: Math.max(0, (email.unreadCount || 0) - 1)
        } : email
      );
      
      setLookupEmails(updatedEmails);
      
      // Save read status to AsyncStorage
      const readStatusKey = `${STORAGE_KEY_READ_STATUS_PREFIX}${emailAddress}`;
      const readMessageIds = Array.from(readStatusCache.current[emailAddress]);
      await safeAsyncStorageSetItem(readStatusKey, JSON.stringify(readMessageIds));
      
      // Update messages in AsyncStorage with read status
      const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${emailAddress}`;
      const updatedEmail = updatedEmails.find(e => e.address === emailAddress);
      if (updatedEmail) {
        const cleanedMessages = cleanupOldMessages(updatedEmail.messages);
        await safeAsyncStorageSetItem(messagesKey, JSON.stringify(cleanedMessages));
      }
      
    } catch (error) {
      console.error('Error marking email as read:', error);
      Alert.alert(
        'Error',
        'Failed to mark email as read. Please try again.'
      );
    }
  };

  const isEmailRead = (emailAddress: string, messageId: string) => {
    const readStatus = readStatusCache.current[emailAddress];
    return readStatus ? readStatus.has(messageId) : false;
  };

  const getUnreadCount = (emailAddress: string) => {
    const email = lookupEmails.find(e => e.address === emailAddress);
    return email?.unreadCount || 0;
  };

  const getTotalUnreadCount = () => {
    return lookupEmails.reduce((total, email) => total + (email.unreadCount || 0), 0);
  };

  const value = {
    lookupEmails,
    addEmailToLookup,
    removeEmailFromLookup,
    refreshLookupEmails,
    markEmailAsRead,
    isEmailRead,
    getUnreadCount,
    getTotalUnreadCount,
    isLoading,
    error,
  };

  return (
    <LookupContext.Provider value={value}>
      {children}
    </LookupContext.Provider>
  );
}

export function useLookup() {
  const context = useContext(LookupContext);
  if (context === undefined) {
    throw new Error('useLookup must be used within a LookupProvider');
  }
  return context;
} 