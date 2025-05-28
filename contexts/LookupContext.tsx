import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Email } from './EmailContext';
import { useNotificationSettings } from './NotificationContext';

// Optional notifications import - will work in development builds but not Expo Go
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('expo-notifications not available in Expo Go - notifications disabled');
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
const STORAGE_KEY_LOOKUP_EMAILS = 'lookup_emails';
const STORAGE_KEY_EMAIL_MESSAGES_PREFIX = 'lookup_messages_';
const STORAGE_KEY_READ_STATUS_PREFIX = 'read_status_';

// Configure notifications only if available
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.log('Failed to configure notifications:', error);
  }
}

// Generate a unique ID for messages to avoid duplicates
const generateMessageUniqueId = (email: Email) => {
  return `${email.sender}_${email.receiver}_${email.date.$date}`;
};

export function LookupProvider({ children }: { children: React.ReactNode }) {
  const [lookupEmails, setLookupEmails] = useState<LookupEmailWithMessages[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { notificationsEnabled } = useNotificationSettings();
  
  // In-memory cache reference for faster access
  const memoryCache = useRef<Record<string, Email[]>>({});
  // Read status cache
  const readStatusCache = useRef<Record<string, Set<string>>>({});

  // Request notification permissions on mount (only if notifications available)
  useEffect(() => {
    const requestPermissions = async () => {
      if (Notifications) {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.log('Notification permissions not granted');
          }
        } catch (error) {
          console.log('Failed to request notification permissions:', error);
        }
      }
    };
    requestPermissions();
  }, []);

  // Load saved lookup emails on mount
  useEffect(() => {
    const loadLookupEmails = async () => {
      try {
        console.log('Loading lookup emails from storage...');
        const storedEmails = await AsyncStorage.getItem(STORAGE_KEY_LOOKUP_EMAILS);
        
        if (storedEmails) {
          const parsedEmails: LookupEmail[] = JSON.parse(storedEmails);
          
          // Load messages and read status for each email
          const emailsWithMessages: LookupEmailWithMessages[] = await Promise.all(
            parsedEmails.map(async (email) => {
              const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${email.address}`;
              const readStatusKey = `${STORAGE_KEY_READ_STATUS_PREFIX}${email.address}`;
              
              const storedMessages = await AsyncStorage.getItem(messagesKey);
              const storedReadStatus = await AsyncStorage.getItem(readStatusKey);
              
              const messages = storedMessages ? JSON.parse(storedMessages) : [];
              const readMessageIds = storedReadStatus ? new Set<string>(JSON.parse(storedReadStatus)) : new Set<string>();
              
              // Cache the messages and read status in memory for faster access
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
        setIsInitialized(true);
      }
    };
    
    loadLookupEmails();
  }, []);

  // Send notification for new emails (only if notifications available and enabled)
  const sendNewEmailNotification = useCallback(async (emailAddress: string, newMessages: Email[]) => {
    if (!Notifications) {
      console.log('Notifications not available - skipping notification');
      return;
    }
    
    if (!notificationsEnabled) {
      console.log('Notifications disabled by user - skipping notification');
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
    if (!isInitialized || lookupEmails.length === 0) return [];
    
    console.log('Syncing lookup emails with server...');
    
    try {
      // First serve from memory cache then fetch updates from server
      const updatedEmails = await Promise.all(
        lookupEmails.map(async (lookupEmail) => {
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
              
              // Then update AsyncStorage in the background
              const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${lookupEmail.address}`;
              await AsyncStorage.setItem(messagesKey, JSON.stringify(combinedMessages));
              
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
      
      // Update the lookup emails in state
      setLookupEmails(updatedEmails);
      
      // Save the updated timestamps to AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEY_LOOKUP_EMAILS, 
        JSON.stringify(updatedEmails.map(({ messages, ...rest }) => rest))
      );
      
      return updatedEmails;
    } catch (err) {
      console.error('Error in fetchLookupEmails:', err);
      return lookupEmails;
    }
  }, [isInitialized, lookupEmails.length, lookupEmails.map(e => e.address).join(','), sendNewEmailNotification]);

  // Fetch messages for all lookup emails
  const { isLoading, error, refetch } = useQuery({
    queryKey: ['lookupEmails', lookupEmails.map(e => e.address).join(',')],
    queryFn,
    enabled: isInitialized && lookupEmails.length > 0,
    refetchInterval: 30000, // Check every 30 seconds for new messages
    refetchOnWindowFocus: true, // Refetch when app comes back to focus
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchIntervalInBackground: true, // Continue fetching even when app is in background
  });

  // Auto-fetch when emails are loaded or when new emails are added
  useEffect(() => {
    if (isInitialized && lookupEmails.length > 0) {
      // Start fetching immediately when emails are available
      const timer = setTimeout(() => {
        refetch();
      }, 1000); // Small delay to ensure everything is set up
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized, lookupEmails.length, refetch]);

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
          'You can only save up to 5 emails in your lookup list. Please remove an existing email to add a new one.'
        );
        return;
      }
      
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
      await AsyncStorage.setItem(
        STORAGE_KEY_LOOKUP_EMAILS, 
        JSON.stringify(updatedLookupEmails.map(({ messages, ...rest }) => rest))
      );
      
      // Initialize empty messages array for this email
      await AsyncStorage.setItem(
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
    } catch (error) {
      console.error('Error adding email to lookup:', error);
      Alert.alert(
        'Error',
        'Failed to add email to lookup list. Please try again.'
      );
    }
  };

  const removeEmailFromLookup = async (email: string) => {
    try {
      const updatedLookupEmails = lookupEmails.filter(e => e.address !== email);
      
      // Update state
      setLookupEmails(updatedLookupEmails);
      
      // Remove from memory cache
      delete memoryCache.current[email];
      
      // Update AsyncStorage
      await AsyncStorage.setItem(
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
      await AsyncStorage.setItem(readStatusKey, JSON.stringify(readMessageIds));
      
      // Update messages in AsyncStorage with read status
      const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${emailAddress}`;
      const updatedEmail = updatedEmails.find(e => e.address === emailAddress);
      if (updatedEmail) {
        await AsyncStorage.setItem(messagesKey, JSON.stringify(updatedEmail.messages));
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