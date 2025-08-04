import {Linking, Alert, Share} from 'react-native';
import {Email, TempEmailAddress} from '../types';

export class AppUtils {
  // Format timestamp to human readable format
  static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Format email body for display
  static formatEmailBody(body: string, maxLength = 200): string {
    // Remove HTML tags
    const plainText = body.replace(/<[^>]*>/g, '');
    
    // Remove extra whitespace
    const cleanText = plainText.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long
    if (cleanText.length > maxLength) {
      return cleanText.substring(0, maxLength) + '...';
    }
    
    return cleanText;
  }

  // Validate email address format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate random string for email prefix
  static generateRandomString(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Calculate time remaining until expiry
  static getTimeRemaining(expiryTime: string): {
    minutes: number;
    seconds: number;
    isExpired: boolean;
    formatted: string;
  } {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffInMs = expiry.getTime() - now.getTime();

    if (diffInMs <= 0) {
      return {
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formatted: 'Expired',
      };
    }

    const totalSeconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (minutes > 0) {
      formatted = `${minutes}m ${seconds}s`;
    } else {
      formatted = `${seconds}s`;
    }

    return {
      minutes,
      seconds,
      isExpired: false,
      formatted,
    };
  }

  // Share email address
  static async shareEmail(email: string): Promise<boolean> {
    try {
      const result = await Share.share({
        message: `Here's my temporary email address: ${email}`,
        title: 'Temporary Email Address',
      });

      return result.action === Share.sharedAction;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  }

  // Open URL in browser
  static async openURL(url: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert('Error', 'Cannot open this URL');
        return false;
      }
    } catch (error) {
      console.error('Open URL error:', error);
      Alert.alert('Error', 'Failed to open URL');
      return false;
    }
  }

  // Send email (open email client)
  static async sendEmail(to: string, subject?: string, body?: string): Promise<boolean> {
    try {
      let url = `mailto:${to}`;
      const params = [];
      
      if (subject) {
        params.push(`subject=${encodeURIComponent(subject)}`);
      }
      
      if (body) {
        params.push(`body=${encodeURIComponent(body)}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      return await this.openURL(url);
    } catch (error) {
      console.error('Send email error:', error);
      return false;
    }
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Debounce function for search
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for API calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Get email statistics
  static getEmailStats(emails: Email[]): {
    total: number;
    unread: number;
    today: number;
    thisWeek: number;
  } {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: emails.length,
      unread: emails.filter(e => !e.isRead).length,
      today: emails.filter(e => new Date(e.timestamp) >= todayStart).length,
      thisWeek: emails.filter(e => new Date(e.timestamp) >= weekStart).length,
    };
  }

  // Sort emails by different criteria
  static sortEmails(emails: Email[], sortBy: 'date' | 'sender' | 'subject'): Email[] {
    return [...emails].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'sender':
          return a.from.localeCompare(b.from);
        case 'subject':
          return (a.subject || '').localeCompare(b.subject || '');
        default:
          return 0;
      }
    });
  }

  // Filter emails by search query
  static filterEmails(emails: Email[], query: string): Email[] {
    if (!query.trim()) return emails;
    
    const searchTerm = query.toLowerCase();
    return emails.filter(email =>
      email.from.toLowerCase().includes(searchTerm) ||
      (email.subject || '').toLowerCase().includes(searchTerm) ||
      email.body.toLowerCase().includes(searchTerm)
    );
  }

  // Generate app review prompt
  static showReviewPrompt(): void {
    Alert.alert(
      'Enjoying Temp Mail?',
      'If you find our app helpful, please consider rating us on the Play Store. Your feedback helps us improve!',
      [
        {text: 'Not Now', style: 'cancel'},
        {text: 'Rate App', onPress: () => this.openPlayStore()},
      ]
    );
  }

  // Open Play Store for rating
  static async openPlayStore(): Promise<void> {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.tronics.tempmail';
    await this.openURL(playStoreUrl);
  }

  // Check if app needs update (placeholder)
  static checkForUpdates(): Promise<{hasUpdate: boolean; version?: string}> {
    // This would typically check with a remote service
    return Promise.resolve({hasUpdate: false});
  }

  // Log app events for analytics (placeholder)
  static logEvent(eventName: string, parameters?: Record<string, any>): void {
    // This would typically send to analytics service
    // Silent logging - no console output needed
  }

  // Performance monitoring
  static measurePerformance<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    return fn().finally(() => {
      const duration = Date.now() - start;
      this.logEvent('performance_measure', {name, duration});
    });
  }

  // Memory usage monitoring
  static logMemoryUsage(): void {
    // This would use a memory monitoring library in production
    // Silent monitoring - no console output needed
  }
}

export default AppUtils;

