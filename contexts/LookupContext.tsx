import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Email } from './EmailContext';

interface LookupEmail {
  address: string;
  addedAt: number; // timestamp
  lastFetchedAt: number; // timestamp
}

interface LookupEmailWithMessages extends LookupEmail {
  messages: Email[];
}

interface LookupContextType {
  lookupEmails: LookupEmailWithMessages[];
  addEmailToLookup: (email: string) => Promise<void>;
  removeEmailFromLookup: (email: string) => Promise<void>;
  refreshLookupEmails: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const LookupContext = createContext<LookupContextType | undefined>(undefined);

// Get API base URL from environment variables
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://api.example.com';

// Storage keys
const STORAGE_KEY_LOOKUP_EMAILS = 'lookup_emails';
const STORAGE_KEY_EMAIL_MESSAGES_PREFIX = 'lookup_messages_';

// Generate a unique ID for messages to avoid duplicates
const generateMessageUniqueId = (email: Email) => {
  return `${email.sender}_${email.receiver}_${email.date.$date}`;
};

export function LookupProvider({ children }: { children: React.ReactNode }) {
  const [lookupEmails, setLookupEmails] = useState<LookupEmailWithMessages[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // In-memory cache reference for faster access
  const memoryCache = useRef<Record<string, Email[]>>({});

  // Load saved lookup emails on mount
  useEffect(() => {
    const loadLookupEmails = async () => {
      try {
        console.log('Loading lookup emails from storage...');
        const storedEmails = await AsyncStorage.getItem(STORAGE_KEY_LOOKUP_EMAILS);
        
        if (storedEmails) {
          const parsedEmails: LookupEmail[] = JSON.parse(storedEmails);
          
          // Load messages for each email
          const emailsWithMessages: LookupEmailWithMessages[] = await Promise.all(
            parsedEmails.map(async (email) => {
              const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${email.address}`;
              const storedMessages = await AsyncStorage.getItem(messagesKey);
              const messages = storedMessages ? JSON.parse(storedMessages) : [];
              
              // Cache the messages in memory for faster access
              memoryCache.current[email.address] = messages;
              
              return {
                ...email,
                messages,
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

  // Fetch messages for all lookup emails
  const { isLoading, error, refetch } = useQuery({
    queryKey: ['lookupEmails', lookupEmails.map(e => e.address)],
    queryFn: async () => {
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
              
              // Filter out duplicates
              const uniqueNewMessages = newMessages.filter(
                (message) => !existingMessageIds.has(generateMessageUniqueId(message))
              );
              
              if (uniqueNewMessages.length > 0) {
                console.log(`Found ${uniqueNewMessages.length} new messages for ${lookupEmail.address}`);
                
                // Combine with existing messages
                const combinedMessages = [...cachedMessages, ...uniqueNewMessages];
                
                // Update memory cache first for immediate access
                memoryCache.current[lookupEmail.address] = combinedMessages;
                
                // Then update AsyncStorage in the background
                const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${lookupEmail.address}`;
                await AsyncStorage.setItem(messagesKey, JSON.stringify(combinedMessages));
                
                return {
                  ...lookupEmail,
                  lastFetchedAt: Date.now(),
                  messages: combinedMessages
                };
              } else {
                console.log(`No new messages for ${lookupEmail.address}`);
                return {
                  ...lookupEmail,
                  lastFetchedAt: Date.now(),
                  messages: cachedMessages
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
    },
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

  const value = {
    lookupEmails,
    addEmailToLookup,
    removeEmailFromLookup,
    refreshLookupEmails,
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