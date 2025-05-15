import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Load saved lookup emails on mount
  useEffect(() => {
    const loadLookupEmails = async () => {
      try {
        const storedEmails = await AsyncStorage.getItem(STORAGE_KEY_LOOKUP_EMAILS);
        
        if (storedEmails) {
          const parsedEmails: LookupEmail[] = JSON.parse(storedEmails);
          
          // Load messages for each email
          const emailsWithMessages: LookupEmailWithMessages[] = await Promise.all(
            parsedEmails.map(async (email) => {
              const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${email.address}`;
              const storedMessages = await AsyncStorage.getItem(messagesKey);
              const messages = storedMessages ? JSON.parse(storedMessages) : [];
              
              return {
                ...email,
                messages,
              };
            })
          );
          
          setLookupEmails(emailsWithMessages);
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
      
      try {
        // Fetch messages for each lookup email
        await Promise.all(
          lookupEmails.map(async (lookupEmail) => {
            try {
              console.log(`Fetching messages for lookup email: ${lookupEmail.address}`);
              
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
                return;
              }
              
              // Process and normalize email data
              const newMessages = data.map((email, idx) => ({
                ...email,
                id: email.id || email._id || `${email.subject || 'no-subject'}-${email.date || idx}`,
                date: typeof email.date === 'string' ? { $date: email.date } : email.date,
                created_at: typeof email.created_at === 'string' ? { $date: email.created_at } : email.created_at,
                updated_at: typeof email.updated_at === 'string' ? { $date: email.updated_at } : email.updated_at,
              }));
              
              // Get existing messages
              const messagesKey = `${STORAGE_KEY_EMAIL_MESSAGES_PREFIX}${lookupEmail.address}`;
              const storedMessages = await AsyncStorage.getItem(messagesKey);
              const existingMessages: Email[] = storedMessages ? JSON.parse(storedMessages) : [];
              
              // Generate unique IDs for existing messages
              const existingMessageIds = new Set(
                existingMessages.map(generateMessageUniqueId)
              );
              
              // Filter out duplicates
              const uniqueNewMessages = newMessages.filter(
                (message) => !existingMessageIds.has(generateMessageUniqueId(message))
              );
              
              // Combine with existing messages
              const combinedMessages = [...existingMessages, ...uniqueNewMessages];
              
              // Update AsyncStorage
              await AsyncStorage.setItem(messagesKey, JSON.stringify(combinedMessages));
              
              // Update lookup email's lastFetchedAt
              const updatedLookupEmails = lookupEmails.map(email => 
                email.address === lookupEmail.address 
                  ? { ...email, lastFetchedAt: Date.now(), messages: combinedMessages }
                  : email
              );
              
              setLookupEmails(updatedLookupEmails);
              await AsyncStorage.setItem(STORAGE_KEY_LOOKUP_EMAILS, JSON.stringify(
                updatedLookupEmails.map(({ messages, ...rest }) => rest)
              ));
              
              console.log(`Added ${uniqueNewMessages.length} new messages for ${lookupEmail.address}`);
            } catch (err) {
              console.error(`Error fetching messages for ${lookupEmail.address}:`, err);
            }
          })
        );
        
        return lookupEmails;
      } catch (err) {
        console.error('Error in fetchLookupEmails:', err);
        return lookupEmails;
      }
    },
    enabled: isInitialized && lookupEmails.length > 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
      
      const newLookupEmail: LookupEmailWithMessages = {
        address: email,
        addedAt: Date.now(),
        lastFetchedAt: 0,
        messages: [],
      };
      
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
      
      // Fetch messages immediately
      await refetch();
      
      Alert.alert(
        'Email Added',
        'Email has been added to your lookup list. Messages will be periodically checked and saved.'
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