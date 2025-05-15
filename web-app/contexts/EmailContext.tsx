import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { trackEmailGeneration, trackCopy } from "@/utils/analytics";

type MongoDate = {
  $date: string;
};

interface Email {
  id: string;
  date: MongoDate;
  sender: string;
  subject: string;
  receiver: string;
  message: string;
  attachments: Array<{
    filename: string;
    data: {
      $binary: {
        base64: string;
      }
    }
  }>;
  created_at: MongoDate;
  updated_at: MongoDate;
}

export type { Email };

interface EmailContextType {
  emails: Email[];
  currentEmail: string;
  setCurrentEmail: (email: string) => void;
  generatedEmail: string;
  domain: string;
  setCustomUsername: (username: string) => void;
  generateNewEmail: () => Promise<void>;
  copyEmailToClipboard: () => void;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Minimum character length for usernames
const MIN_USERNAME_LENGTH = 4;
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

export function EmailProvider({ children }: { children: React.ReactNode }) {
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const { data: emails = [], isLoading, error, refetch } = useQuery({
    queryKey: ["emails", generatedEmail],
    queryFn: async () => {
      if (!generatedEmail) return [];
      
      // Don't make API request if username is too short
      const username = generatedEmail.split('@')[0];
      if (username.length < MIN_USERNAME_LENGTH) {
        return [];
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Email fetch error:', err);
        clearTimeout(timeoutId);
        
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            toast({
              title: "Request Timeout",
              description: "The server took too long to respond. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Connection Error",
              description: "Unable to fetch emails. Please try again later.",
              variant: "destructive",
            });
          }
        }
        return [];
      }
    },
    enabled: !!generatedEmail && generatedEmail.split('@')[0].length >= MIN_USERNAME_LENGTH,
    refetchInterval: 30000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

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
      trackEmailGeneration('random');
    } catch (err) {
      console.error('Email generation error:', err);
      toast({
        title: "Connection Error",
        description: "Unable to generate email address. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const setCustomUsername = useCallback((username: string) => {
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '');
    
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set a new timer
    debounceTimer.current = setTimeout(() => {
      setGeneratedEmail(`${sanitizedUsername}@${domain}`);
      debounceTimer.current = null;
    }, DEBOUNCE_DELAY);
  }, [domain]);

  useEffect(() => {
    generateNewEmail();
    
    // Cleanup function to clear timer if component unmounts
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      toast({
        title: "Copied to clipboard",
        description: "The email address has been copied to your clipboard.",
        duration: 2000,
      });
      
      // Track copy event
      trackCopy('email_address');
    } catch (err) {
      console.error('Clipboard error:', err);
      toast({
        title: "Failed to copy",
        description: "Please try copying manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <EmailContext.Provider
      value={{
        emails,
        currentEmail,
        setCurrentEmail,
        generatedEmail,
        domain,
        setCustomUsername,
        generateNewEmail,
        copyEmailToClipboard,
        isLoading,
        error: error as Error | null,
        refetch: async () => {
          await refetch();
        },
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
}
