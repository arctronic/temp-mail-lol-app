import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useGlobalToast } from '../hooks/useGlobalToast';
import { useAds } from './AdContext';
import { Email } from './EmailContext';
import { useNotification } from './NotificationContext';

interface LookupEmail {
  address: string;
  addedAt: number; // timestamp
  lastFetchedAt: number; // timestamp
}

export interface LookupEmailWithMessages extends LookupEmail {
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
  // New methods for EPIC 4
  canAddInbox: () => boolean;
  canAddExtraInbox: () => boolean;
  addEmailToLookupWithLimit: (email: string) => Promise<{ success: boolean; reason?: string }>;
  addEmailToLookupWithAd: (email: string) => Promise<{ success: boolean; reason?: string }>;
  undoRemoveInbox: (email: LookupEmailWithMessages) => Promise<void>;
  maxInboxes: number;
}

const LookupContext = createContext<LookupContextType | undefined>(undefined);

// Get API base URL from environment variables
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://api.example.com';

// Storage keys
const STORAGE_KEY_LOOKUP_EMAILS = 'temp_mail_lookup_emails';
const STORAGE_KEY_EMAIL_MESSAGES_PREFIX = 'temp_mail_messages_';
const STORAGE_KEY_READ_STATUS_PREFIX = 'temp_mail_read_status_';

// Constants for data management
const MAX_MESSAGES_PER_EMAIL = 2500; // Increased limit to handle more emails
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
    // Check if the data size is reasonable (< 5MB per item)
    const dataSize = new Blob([value]).size;
    if (dataSize > 5 * 1024 * 1024) { // 5MB limit
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
        
        // Remove oldest message stores (keep more now)
        if (messageKeys.length > 10) {
          const keysToRemove = messageKeys.slice(10);
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
  const router = useRouter();
  const [lookupEmails, setLookupEmails] = useState<LookupEmailWithMessages[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { notificationsEnabled, notificationsSupported, updateLookupEmailStatus } = useNotification();
  const { showSuccess, showError } = useGlobalToast();
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

  // Load saved lookup emails on mount
  useEffect(() => {
    const loadLookupEmails = async () => {
      try {
        console.log('Loading lookup emails from storage...');
        const storedEmails = await safeAsyncStorageGetItem(STORAGE_KEY_LOOKUP_EMAILS);
        
        if (storedEmails) {
          const parsedEmails: LookupEmail[] = JSON.parse(storedEmails);
          
          // Load messages for each lookup email
          const emailsWithMessages = await Promise.all(
            parsedEmails.map(async (lookupEmail) => {
              const cachedMessages = await loadEmailMessages(lookupEmail.address);
              return {
                ...lookupEmail,
                messages: cachedMessages || [],
                unreadCount: getUnreadCount(lookupEmail.address),
              };
            })
          );
          
          setLookupEmails(emailsWithMessages);
          console.log(`Loaded ${emailsWithMessages.length} lookup emails from storage`);
        } else {
          console.log('No lookup emails found in storage');
        }
      } catch (error) {
        console.error('Failed to load lookup emails:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    const loadReadStatuses = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const readStatusKeys = keys.filter(key => key.startsWith(STORAGE_KEY_READ_STATUS_PREFIX));
        
        for (const key of readStatusKeys) {
          const emailAddress = key.replace(STORAGE_KEY_READ_STATUS_PREFIX, '');
          const readStatusData = await safeAsyncStorageGetItem(key);
          
          if (readStatusData) {
            const readMessageIds: string[] = JSON.parse(readStatusData);
            readStatusCache.current[emailAddress] = new Set(readMessageIds);
          }
        }
      } catch (error) {
        console.error('Failed to load read statuses:', error);
      }
    };

    loadReadStatuses();
    loadLookupEmails();
  }, []);

  // Load cached messages for a specific email
  const loadEmailMessages = async (emailAddress: string): Promise<Email[]> => {
    try {
      const storageKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${emailAddress}`;
      const cachedData = await safeAsyncStorageGetItem(storageKey);
      
      if (cachedData) {
        const cachedMessages: Email[] = JSON.parse(cachedData);
        memoryCache.current[emailAddress] = cachedMessages;
        return cachedMessages;
      }
    } catch (error) {
      console.error(`Failed to load cached messages for ${emailAddress}:`, error);
    }
    
    return [];
  };

  // Save email messages to storage
  const saveEmailMessages = async (emailAddress: string, messages: Email[]): Promise<void> => {
    try {
      const storageKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${emailAddress}`;
      const cleanedMessages = cleanupOldMessages(messages);
      
      const success = await safeAsyncStorageSetItem(storageKey, JSON.stringify(cleanedMessages));
      if (success) {
        memoryCache.current[emailAddress] = cleanedMessages;
      } else {
        console.warn(`Failed to save messages for ${emailAddress} - storage may be full`);
      }
    } catch (error) {
      console.error(`Failed to save messages for ${emailAddress}:`, error);
    }
  };

  // Fetch messages from API
  const fetchEmailMessages = async (emailAddress: string): Promise<Email[]> => {
    try {
      console.log(`Fetching messages for ${emailAddress}...`);
      
      // Use the same API endpoint as EmailContext
      const response = await fetch(`${API_BASE_URL}/api/emails/${encodeURIComponent(emailAddress)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No messages found for ${emailAddress}`);
          return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle empty response
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log(`No messages found for ${emailAddress}`);
        return [];
      }
      
      // Process and normalize the email data
      const messages: Email[] = data.map((email, idx) => ({
        ...email,
        id: email.id || email._id || `${email.subject || 'no-subject'}-${email.date || idx}`,
        date: typeof email.date === 'string' ? { $date: email.date } : email.date,
        created_at: typeof email.created_at === 'string' ? { $date: email.created_at } : email.created_at,
        updated_at: typeof email.updated_at === 'string' ? { $date: email.updated_at } : email.updated_at,
      }));
      
      console.log(`✅ Fetched ${messages.length} messages for ${emailAddress}`);
      
      // Get existing messages to merge and avoid duplicates
      const existingMessages = memoryCache.current[emailAddress] || [];
      
      // Merge new messages with existing ones, avoiding duplicates based on unique ID
      const existingIds = new Set(existingMessages.map(msg => generateMessageUniqueId(msg)));
      const newMessages = messages.filter(msg => !existingIds.has(generateMessageUniqueId(msg)));
      
      // Combine and sort by date (newest first)
      const allMessages = [...existingMessages, ...newMessages].sort((a, b) => {
        const dateA = new Date(typeof a.date === 'string' ? a.date : a.date.$date);
        const dateB = new Date(typeof b.date === 'string' ? b.date : b.date.$date);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Clean up old messages and save
      const cleanedMessages = cleanupOldMessages(allMessages);
      await saveEmailMessages(emailAddress, cleanedMessages);
      
      if (newMessages.length > 0) {
        console.log(`📧 Found ${newMessages.length} new messages for ${emailAddress}`);
      }
      
      return cleanedMessages;
    } catch (error) {
      console.error(`❌ Failed to fetch messages for ${emailAddress}:`, error);
      
      // Return cached messages if fetch fails
      const cachedMessages = memoryCache.current[emailAddress] || [];
      if (cachedMessages.length > 0) {
        console.log(`📱 Returning ${cachedMessages.length} cached messages for ${emailAddress}`);
        return cachedMessages;
      }
      
      // If no cached messages, return empty array instead of throwing
      return [];
    }
  };

  // Get unread count for an email (using cached read status)
  const getUnreadCount = (emailAddress: string): number => {
    const readMessages = readStatusCache.current[emailAddress] || new Set();
    const messages = memoryCache.current[emailAddress] || [];
    return messages.filter(message => !readMessages.has(generateMessageUniqueId(message))).length;
  };

  // Check if a specific message is read
  const isEmailRead = (emailAddress: string, messageId: string): boolean => {
    const readMessages = readStatusCache.current[emailAddress] || new Set();
    return readMessages.has(messageId);
  };

  // Mark a message as read
  const markEmailAsRead = async (emailAddress: string, messageId: string): Promise<void> => {
    try {
      if (!readStatusCache.current[emailAddress]) {
        readStatusCache.current[emailAddress] = new Set();
      }
      
      readStatusCache.current[emailAddress].add(messageId);
      
      // Save to AsyncStorage
      const storageKey = `${STORAGE_KEY_READ_STATUS_PREFIX}${emailAddress}`;
      const readMessageIds = Array.from(readStatusCache.current[emailAddress]);
      await safeAsyncStorageSetItem(storageKey, JSON.stringify(readMessageIds));
      
      // Update the lookup emails state to reflect new unread count
      setLookupEmails(prev => 
        prev.map(lookupEmail => 
          lookupEmail.address === emailAddress 
            ? { ...lookupEmail, unreadCount: getUnreadCount(emailAddress) }
            : lookupEmail
        )
      );
      
    } catch (error) {
      console.error(`Failed to mark message as read:`, error);
    }
  };

  // Get total unread count across all lookup emails
  const getTotalUnreadCount = (): number => {
    return lookupEmails.reduce((total, email) => total + (email.unreadCount || 0), 0);
  };

  // Fetcher function for react-query
  const fetchEmailData = async (): Promise<LookupEmailWithMessages[]> => {
    if (!isInitialized || lookupEmails.length === 0) {
      return lookupEmails;
    }

    console.log('🔄 Refreshing lookup emails...');
    
    const updatedEmails = await Promise.all(
      lookupEmails.map(async (lookupEmail) => {
        try {
          const messages = await fetchEmailMessages(lookupEmail.address);
          const unreadCount = getUnreadCount(lookupEmail.address);
          
          // Update notification status for this email
          if (notificationsEnabled && notificationsSupported) {
            const latestMessage = messages.length > 0 ? messages[0] : undefined;
            updateLookupEmailStatus(
              lookupEmail.address,
              unreadCount > 0,
              unreadCount,
              latestMessage ? {
                id: generateMessageUniqueId(latestMessage),
                from: latestMessage.sender,
                subject: latestMessage.subject || 'No Subject',
                date: typeof latestMessage.date === 'string' ? latestMessage.date : latestMessage.date.$date,
                to: latestMessage.receiver
              } : undefined
            );
          }
          
          return {
            ...lookupEmail,
            messages,
            unreadCount,
            lastFetchedAt: Date.now(),
          };
        } catch (error) {
          console.error(`Failed to fetch messages for ${lookupEmail.address}:`, error);
          return {
            ...lookupEmail,
            unreadCount: getUnreadCount(lookupEmail.address),
          };
        }
      })
    );

    return updatedEmails;
  };

  // Use react-query for automatic data fetching and caching
  const {
    data: fetchedLookupEmails,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lookupEmails', lookupEmails.map(e => e.address).sort()],
    queryFn: fetchEmailData,
    enabled: isInitialized && lookupEmails.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Update state when fetch completes
  useEffect(() => {
    if (fetchedLookupEmails) {
      setLookupEmails(fetchedLookupEmails);
    }
  }, [fetchedLookupEmails]);

  const addEmailToLookup = async (email: string) => {
    // Show ad before adding (every 3rd addition)
    if (canShowAd('lookup')) {
      await showInterstitialAd();
    }
    
    await addEmailToLookupWithoutLimit(email);
    incrementAction('lookup');
  };

  const addEmailToLookupWithoutLimit = async (email: string) => {
    try {
      console.log(`Adding ${email} to lookup list...`);
      
      // Check if email already exists
      const existingEmail = lookupEmails.find(e => e.address === email);
      if (existingEmail) {
        showError('Email already in lookup list');
        return;
      }

      const newLookupEmail: LookupEmail = {
        address: email,
        addedAt: Date.now(),
        lastFetchedAt: 0,
      };

      // Add to state first for immediate UI update
      const newLookupEmailWithMessages: LookupEmailWithMessages = {
        ...newLookupEmail,
        messages: [],
        unreadCount: 0,
      };

      setLookupEmails(prev => [...prev, newLookupEmailWithMessages]);

      // Save to storage
      const updatedLookupEmails = [...lookupEmails, newLookupEmail];
      await safeAsyncStorageSetItem(STORAGE_KEY_LOOKUP_EMAILS, JSON.stringify(updatedLookupEmails));

      console.log(`✅ Added ${email} to lookup list`);
      showSuccess(`Added ${email} to monitoring`);
      
    } catch (error) {
      console.error('Failed to add email to lookup:', error);
      showError('Failed to add email');
      throw error;
    }
  };

  const removeEmailFromLookup = async (email: string) => {
    try {
      console.log(`Removing ${email} from lookup list...`);
      
      // Remove from state
      const updatedLookupEmails = lookupEmails.filter(e => e.address !== email);
      setLookupEmails(updatedLookupEmails);

      // Save to storage
      const storageEmails = updatedLookupEmails.map(e => ({
        address: e.address,
        addedAt: e.addedAt,
        lastFetchedAt: e.lastFetchedAt,
      }));
      await safeAsyncStorageSetItem(STORAGE_KEY_LOOKUP_EMAILS, JSON.stringify(storageEmails));

      // Clean up related data
      const messageStorageKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${email}`;
      const readStatusKey = `${STORAGE_KEY_READ_STATUS_PREFIX}${email}`;
      
      await AsyncStorage.multiRemove([messageStorageKey, readStatusKey]);
      
      // Clean up memory cache
      delete memoryCache.current[email];
      delete readStatusCache.current[email];

      console.log(`✅ Removed ${email} from lookup list`);
      showSuccess(`Removed ${email} from monitoring`);
      
    } catch (error) {
      console.error('Failed to remove email from lookup:', error);
      showError('Failed to remove email');
      throw error;
    }
  };

  const refreshLookupEmails = async () => {
    try {
      console.log('🔄 Manually refreshing lookup emails...');
      await refetch();
      showSuccess('Refreshed email monitoring');
    } catch (error) {
      console.error('Failed to refresh lookup emails:', error);
      showError('Failed to refresh emails');
      throw error;
    }
  };

  // New functions for EPIC 4
  const canAddInbox = () => lookupEmails.length < 5;
  
  const canAddExtraInbox = () => lookupEmails.length < 20; // Allow up to 20 with ads

  const addEmailToLookupWithLimit = async (email: string) => {
    if (canAddInbox()) {
      await addEmailToLookupWithoutLimit(email);
      return { success: true };
    } else {
      return { success: false, reason: 'Maximum inbox limit reached' };
    }
  };

  const addEmailToLookupWithAd = async (email: string) => {
    if (canAddExtraInbox()) {
      await addEmailToLookupWithoutLimit(email);
      return { success: true };
    } else {
      return { success: false, reason: 'Maximum limit of 20 email addresses reached' };
    }
  };

  const undoRemoveInbox = async (email: LookupEmailWithMessages): Promise<void> => {
    try {
      console.log(`Restoring ${email.address} to lookup list...`);
      
      // Restore to state
      const updatedLookupEmails = [...lookupEmails, email];
      setLookupEmails(updatedLookupEmails);

      // Save to storage
      const storageEmails = updatedLookupEmails.map(e => ({
        address: e.address,
        addedAt: e.addedAt,
        lastFetchedAt: e.lastFetchedAt,
      }));
      await safeAsyncStorageSetItem(STORAGE_KEY_LOOKUP_EMAILS, JSON.stringify(storageEmails));

      // Restore saved messages if they exist
      const messageStorageKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${email.address}`;
      if (email.messages && email.messages.length > 0) {
        await saveEmailMessages(email.address, email.messages);
      }

      console.log(`✅ Restored ${email.address} to lookup list`);
      showSuccess(`Restored ${email.address} to monitoring`);
      
    } catch (error) {
      console.error('Failed to restore email to lookup:', error);
      showError('Failed to restore email');
      throw error;
    }
  };

  const value: LookupContextType = {
    lookupEmails,
    addEmailToLookup,
    removeEmailFromLookup,
    refreshLookupEmails,
    markEmailAsRead,
    isEmailRead,
    getUnreadCount,
    getTotalUnreadCount,
    isLoading: isLoading || !isInitialized,
    error: error as Error | null,
    canAddInbox,
    canAddExtraInbox,
    addEmailToLookupWithLimit,
    addEmailToLookupWithAd,
    undoRemoveInbox,
    maxInboxes: 5,
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