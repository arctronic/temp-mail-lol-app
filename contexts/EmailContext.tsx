import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

type MongoDate = {
  $date: string;
};

export interface Email {
  id: string;
  date: MongoDate;
  sender: string;
  subject: string;
  receiver: string;
  message: string;
  attachments: {
    filename: string;
    data: {
      $binary: {
        base64: string;
      }
    }
  }[];
  created_at: MongoDate;
  updated_at: MongoDate;
  read?: boolean; // Track read/unread status locally
}

interface EmailContextType {
  emails: Email[];
  currentEmail: string;
  setCurrentEmail: (email: string) => void;
  generatedEmail: string;
  domain: string;
  setCustomUsername: (username: string) => void;
  generateNewEmail: () => Promise<void>;
  copyEmailToClipboard: () => Promise<void>;
  loadEmailsFromStorage: (emailAddress: string, localEmails: Email[]) => void;
  resetToApiMode: () => void;
  isUsingLocalStorage: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

// Get API base URL from environment variables
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://api.example.com';

// Constants
const MIN_USERNAME_LENGTH = 3;
const DEBOUNCE_DELAY = 1000; // ms to wait before updating email
const DEFAULT_RELOAD_INTERVAL = 60; // Default 60 seconds

// Analytics tracking function (placeholder)
const trackEvent = async (eventName: string, properties?: Record<string, any>) => {
  try {
    // Placeholder for analytics tracking
    console.log(`Analytics: ${eventName}`, properties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

export function EmailProvider({ children }: { children: React.ReactNode }) {
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [domain, setDomain] = useState<string>('tempmail.lol'); // Default domain to show immediately
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const [shouldFetchEmails, setShouldFetchEmails] = useState(false);
  const [reloadInterval, setReloadInterval] = useState(DEFAULT_RELOAD_INTERVAL);
  
  // Add preloaded state to avoid loading indicators on initial render
  const [preloaded, setPreloaded] = useState(true);

  // Separate initial loading state from query loading state
  const [initializing, setInitializing] = useState(true);
  
  // State to hold locally loaded emails (from lookup storage)
  const [localEmails, setLocalEmails] = useState<Email[]>([]);
  const [useLocalEmails, setUseLocalEmails] = useState(false);
  
  // Try to get reload interval from context after component mounts
  useEffect(() => {
    const getReloadInterval = async () => {
      try {
        // Dynamically import to avoid circular dependency issues
        const { useReloadInterval } = await import('./ReloadIntervalContext');
        // We can't use the hook here, so we'll use a different approach
        // For now, use the default interval
        console.log('Using default reload interval:', DEFAULT_RELOAD_INTERVAL);
      } catch (error) {
        console.log('ReloadInterval context not available, using default');
      }
    };
    
    getReloadInterval();
  }, []);
  
  // Set a default email immediately to improve UI rendering speed
  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    
    const initialize = async () => {
      if (!isMounted) return;
      
      // Set a temporary email immediately for faster UI rendering
      const tempUser = `user${Math.floor(Math.random() * 10000)}`;
      setGeneratedEmail(`${tempUser}@${domain}`);
      
      // Then schedule the actual email generation
      timer = setTimeout(async () => {
        if (!isMounted) return;
        
        await generateNewEmail();
        setInitializing(false);
        
        // Add slight delay before enabling email fetching
        delayTimer = setTimeout(() => {
          if (!isMounted) return;
          setShouldFetchEmails(true);
          setPreloaded(false);
        }, 1500);
      }, 300);
    };
    
    initialize();
    
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (delayTimer) clearTimeout(delayTimer);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []); // Empty dependency - only run once on mount

  const { data: apiEmails = [], isLoading, error, refetch } = useQuery({
    queryKey: ['emails', generatedEmail],
    queryFn: async () => {
      if (!generatedEmail) return [];
      
      // Don't make API request if username is too short
      const username = generatedEmail.split('@')[0];
      if (username.length < MIN_USERNAME_LENGTH) {
        return [];
      }
      
      console.log('Attempting to fetch emails for:', generatedEmail);
      console.log('API URL:', `${API_BASE_URL}/api/emails/${encodeURIComponent(generatedEmail)}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000) as unknown as NodeJS.Timeout;

      try {
        console.log('Sending API request...');
        const response = await fetch(`${API_BASE_URL}/api/emails/${encodeURIComponent(generatedEmail)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          credentials: 'omit',
        });

        clearTimeout(timeoutId);
        console.log('API Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Return an empty array immediately if response is empty
        if (!data || !Array.isArray(data) || data.length === 0) {
          return [];
        }
        
        return data.map((email, idx) => ({
          ...email,
          id: email.id || email._id || `${email.subject || 'no-subject'}-${email.date || idx}`,
          date: typeof email.date === 'string' ? { $date: email.date } : email.date,
          created_at: typeof email.created_at === 'string' ? { $date: email.created_at } : email.created_at,
          updated_at: typeof email.updated_at === 'string' ? { $date: email.updated_at } : email.updated_at,
        }));
      } catch (err) {
        console.error('Email fetch error:', err);
        clearTimeout(timeoutId);
        
        if (err instanceof Error) {
          console.log('Error name:', err.name);
          console.log('Error message:', err.message);
          
          if (err.name === 'AbortError') {
            Alert.alert(
              'Request Timeout',
              'The server took too long to respond. Please try again.'
            );
          } else {
            Alert.alert(
              'Connection Error',
              'Unable to fetch emails. Please try again later.'
            );
          }
        }
        return [];
      }
    },
    enabled: shouldFetchEmails && !useLocalEmails && !!generatedEmail && generatedEmail.split('@')[0].length >= MIN_USERNAME_LENGTH,
    refetchInterval: reloadInterval * 1000, // Convert seconds to milliseconds
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),
    // Force staleTime to prevent immediate refetch
    staleTime: 10000,
  });

  // Use local emails when available, otherwise use API emails
  const emails = useLocalEmails ? localEmails : apiEmails;

  const generateNewEmail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate_email`, {
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
      setGeneratedEmail(data.email);
      setDomain(data.email.split('@')[1]);
      
      // Track email generation
      await trackEvent('email_generated', {
        type: 'random',
        domain: data.email.split('@')[1],
      });

      return data.email;
    } catch (err) {
      console.error('Email generation error:', err);
      Alert.alert(
        'Connection Error',
        'Unable to generate email address. Please try again later.'
      );
      return null;
    }
  };

  const setCustomUsername = useCallback((username: string) => {
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '');
    
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set a new timer
    debounceTimer.current = setTimeout(async () => {
      const newEmail = `${sanitizedUsername}@${domain}`;
      setGeneratedEmail(newEmail);
      
      // Track custom email generation
      if (sanitizedUsername.length >= MIN_USERNAME_LENGTH) {
        await trackEvent('email_generated', {
          type: 'custom',
          domain,
          usernameLength: sanitizedUsername.length,
        });
      }
      
      debounceTimer.current = null;
    }, DEBOUNCE_DELAY) as unknown as NodeJS.Timeout;
  }, [domain]);

  const copyEmailToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(generatedEmail);
      Alert.alert(
        'Copied to clipboard',
        'The email address has been copied to your clipboard.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
      
      // Track email copy
      await trackEvent('email_copied', {
        email: generatedEmail,
        domain,
      });
    } catch (err) {
      console.error('Clipboard error:', err);
      Alert.alert(
        'Error',
        'Failed to copy email to clipboard. Please try again.'
      );
    }
  };

  const loadEmailsFromStorage = useCallback((emailAddress: string, storageEmails: Email[]) => {
    console.log('Loading emails from storage for:', emailAddress);
    console.log('Storage emails count:', storageEmails.length);
    
    // Set the email address
    setGeneratedEmail(emailAddress);
    setDomain(emailAddress.split('@')[1]);
    
    // Set local emails and enable local mode
    setLocalEmails(storageEmails);
    setUseLocalEmails(true);
    
    // Disable API fetching since we're using local data
    setShouldFetchEmails(false);
  }, []);

  const resetToApiMode = useCallback(() => {
    console.log('Resetting to API mode');
    
    // Clear local emails and disable local mode
    setLocalEmails([]);
    setUseLocalEmails(false);
    
    // Re-enable API fetching
    setShouldFetchEmails(true);
  }, []);

  const value: EmailContextType = {
    emails,
    currentEmail,
    setCurrentEmail,
    generatedEmail,
    domain,
    setCustomUsername,
    generateNewEmail: async () => {
      await generateNewEmail();
    },
    copyEmailToClipboard,
    loadEmailsFromStorage,
    resetToApiMode,
    isUsingLocalStorage: useLocalEmails,
    isLoading: isLoading || initializing,
    error: error as Error | null,
    refetch,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
} 