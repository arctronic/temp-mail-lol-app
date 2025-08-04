import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Email,
  TempEmailAddress,
  AppSettings,
  StorageKeys,
  AppError,
  ErrorCodes,
} from '../types';

class StorageService {
  // Default app settings
  private defaultSettings: AppSettings = {
    theme: 'auto',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30, // seconds
    defaultDomain: 'temp-mail.lol',
  };

  // Generic storage methods
  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
      throw new AppError({
        code: ErrorCodes.STORAGE_ERROR,
        message: `Failed to save ${key}`,
        details: error,
      });
    }
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error);
      return null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage remove error for key ${key}:`, error);
      throw new AppError({
        code: ErrorCodes.STORAGE_ERROR,
        message: `Failed to remove ${key}`,
        details: error,
      });
    }
  }

  // Current email management
  async setCurrentEmail(email: TempEmailAddress): Promise<void> {
    await this.setItem(StorageKeys.CURRENT_EMAIL, email);
  }

  async getCurrentEmail(): Promise<TempEmailAddress | null> {
    return await this.getItem<TempEmailAddress>(StorageKeys.CURRENT_EMAIL);
  }

  async clearCurrentEmail(): Promise<void> {
    await this.removeItem(StorageKeys.CURRENT_EMAIL);
  }

  // Email history management
  async addToEmailHistory(email: TempEmailAddress): Promise<void> {
    try {
      const history = await this.getEmailHistory();
      const updatedHistory = [email, ...history.filter(e => e.email !== email.email)];
      
      // Keep only last 10 email addresses
      const limitedHistory = updatedHistory.slice(0, 10);
      
      await this.setItem(StorageKeys.EMAIL_HISTORY, limitedHistory);
    } catch (error) {
      console.error('Add to email history error:', error);
    }
  }

  async getEmailHistory(): Promise<TempEmailAddress[]> {
    const history = await this.getItem<TempEmailAddress[]>(StorageKeys.EMAIL_HISTORY);
    return history || [];
  }

  async clearEmailHistory(): Promise<void> {
    await this.removeItem(StorageKeys.EMAIL_HISTORY);
  }

  // Merge emails with deduplication based on hash
  private mergeEmailsWithDeduplication(existingEmails: Email[], newEmails: Email[]): Email[] {
    const emailMap = new Map<string, Email>();
    
    // Add existing emails to map (prefer existing for read status)
    existingEmails.forEach(email => {
      if (email.hash) {
        emailMap.set(email.hash, email);
      } else {
        // Handle legacy emails without hash - use fallback key
        const fallbackKey = `${email.id}_${email.timestamp}`;
        emailMap.set(fallbackKey, email);
      }
    });
    
    // Add new emails, only if not already present
    newEmails.forEach(newEmail => {
      if (newEmail.hash && !emailMap.has(newEmail.hash)) {
        emailMap.set(newEmail.hash, newEmail);
      } else if (newEmail.hash && emailMap.has(newEmail.hash)) {
        // Update existing email but preserve read status
        const existing = emailMap.get(newEmail.hash)!;
        emailMap.set(newEmail.hash, {
          ...newEmail,
          isRead: existing.isRead, // Preserve read status
        });
      }
    });
    
    // Convert back to array and sort by timestamp (newest first)
    return Array.from(emailMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Cached emails management
  async setCachedEmails(emailAddress: string, emails: Email[]): Promise<void> {
    try {
      const cachedData = await this.getCachedEmailsData();
      const existingEmails = cachedData[emailAddress]?.emails || [];
      
      // Merge with deduplication
      const mergedEmails = this.mergeEmailsWithDeduplication(existingEmails, emails);
      
      cachedData[emailAddress] = {
        emails: mergedEmails,
        timestamp: Date.now(),
      };
      
      await this.setItem(StorageKeys.CACHED_EMAILS, cachedData);
    } catch (error) {
      console.error('Set cached emails error:', error);
    }
  }

  async getCachedEmails(emailAddress: string): Promise<Email[]> {
    try {
      const cachedData = await this.getCachedEmailsData();
      const emailData = cachedData[emailAddress];
      
      if (!emailData) {
        return [];
      }
      
      // Check if cache is still valid (5 minutes)
      const cacheAge = Date.now() - emailData.timestamp;
      const maxCacheAge = 5 * 60 * 1000; // 5 minutes
      
      if (cacheAge > maxCacheAge) {
        delete cachedData[emailAddress];
        await this.setItem(StorageKeys.CACHED_EMAILS, cachedData);
        return [];
      }
      
      return emailData.emails;
    } catch (error) {
      console.error('Get cached emails error:', error);
      return [];
    }
  }

  private async getCachedEmailsData(): Promise<Record<string, {emails: Email[]; timestamp: number}>> {
    const cachedData = await this.getItem<Record<string, {emails: Email[]; timestamp: number}>>(
      StorageKeys.CACHED_EMAILS
    );
    return cachedData || {};
  }

  async clearCachedEmails(): Promise<void> {
    await this.removeItem(StorageKeys.CACHED_EMAILS);
  }

  // App settings management
  async setSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = {...currentSettings, ...settings};
      await this.setItem(StorageKeys.SETTINGS, updatedSettings);
    } catch (error) {
      console.error('Set settings error:', error);
    }
  }

  async getSettings(): Promise<AppSettings> {
    const settings = await this.getItem<AppSettings>(StorageKeys.SETTINGS);
    return {...this.defaultSettings, ...settings};
  }

  async resetSettings(): Promise<void> {
    await this.setItem(StorageKeys.SETTINGS, this.defaultSettings);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Clear all data error:', error);
      throw new AppError({
        code: ErrorCodes.STORAGE_ERROR,
        message: 'Failed to clear all data',
        details: error,
      });
    }
  }

  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Get storage size error:', error);
      return 0;
    }
  }

  // Mark email as read
  async markEmailAsRead(emailAddress: string, emailId: string): Promise<void> {
    try {
      const cachedEmails = await this.getCachedEmails(emailAddress);
      const updatedEmails = cachedEmails.map(email =>
        email.id === emailId ? {...email, isRead: true} : email
      );
      
      await this.setCachedEmails(emailAddress, updatedEmails);
    } catch (error) {
      console.error('Mark email as read error:', error);
    }
  }

  // Add individual email with deduplication
  async addEmailToCache(emailAddress: string, newEmail: Email): Promise<void> {
    try {
      const existingEmails = await this.getCachedEmails(emailAddress);
      const mergedEmails = this.mergeEmailsWithDeduplication(existingEmails, [newEmail]);
      
      const cachedData = await this.getCachedEmailsData();
      cachedData[emailAddress] = {
        emails: mergedEmails,
        timestamp: Date.now(),
      };
      
      await this.setItem(StorageKeys.CACHED_EMAILS, cachedData);
    } catch (error) {
      console.error('Add email to cache error:', error);
    }
  }

  // Remove email from cache
  async removeEmailFromCache(emailAddress: string, emailId: string): Promise<void> {
    try {
      const cachedEmails = await this.getCachedEmails(emailAddress);
      const updatedEmails = cachedEmails.filter(email => email.id !== emailId);
      
      await this.setCachedEmails(emailAddress, updatedEmails);
    } catch (error) {
      console.error('Remove email from cache error:', error);
    }
  }
}

export default new StorageService();

