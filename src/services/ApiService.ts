import {
  Email,
  TempEmailAddress,
  ApiResponse,
  EmailListResponse,
  AppError,
  ErrorCodes,
} from '../types';
import CryptoJS from 'crypto-js';

class ApiService {
  private baseUrl = 'https://temp-mail-api.4zjyot.easypanel.host/api';
  private currentEmail: string | null = null;

  // Generate MD5 hash for email deduplication
  private generateEmailHash(email: Email): string {
    const hashString = `${email.from}|${email.to}|${email.subject}|${email.timestamp}`;
    return CryptoJS.MD5(hashString).toString();
  }

  // Generate a new temporary email address
  async generateEmail(prefix?: string): Promise<ApiResponse<TempEmailAddress>> {
    try {
      // Generate a random prefix if none provided
      const emailPrefix = prefix || this.generateRandomPrefix();
      const email = `${emailPrefix}@temp-mail.lol`;
      
      // Store the current email for future requests
      this.currentEmail = email;

      return {
        success: true,
        data: {
          id: Date.now().toString(),
          email: email,
          domain: 'temp-mail.lol',
          prefix: emailPrefix,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
          isActive: true,
        },
      };
    } catch (error) {
      console.error('Generate email error:', error);
      return {
        success: false,
        error: ErrorCodes.API_ERROR,
        message: 'Failed to generate email address',
      };
    }
  }

  // Get emails for the current temporary address
  async getEmails(email?: string): Promise<ApiResponse<EmailListResponse>> {
    try {
      const targetEmail = email || this.currentEmail;
      if (!targetEmail) {
        throw new Error('No email address available');
      }

      const response = await fetch(`${this.baseUrl}/emails/${encodeURIComponent(targetEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the response to match our Email interface
      const emails: Email[] = (data.emails || data || []).map((emailData: any, index: number) => {
        const email: Email = {
          id: emailData.id || emailData._id || `email_${Date.now()}_${index}`,
          from: emailData.from || emailData.sender || emailData.fromAddress || 'Unknown Sender',
          to: targetEmail,
          subject: emailData.subject || emailData.title || 'No Subject',
          body: emailData.body || emailData.content || emailData.text || emailData.html || '',
          timestamp: emailData.timestamp || emailData.date || emailData.receivedAt || new Date().toISOString(),
          isRead: emailData.isRead || false,
          attachments: emailData.attachments || [],
        };
        
        // Generate hash for deduplication
        email.hash = this.generateEmailHash(email);
        return email;
      });

      return {
        success: true,
        data: {
          emails,
          total: emails.length,
          hasMore: false,
        },
      };
    } catch (error) {
      console.error('Get emails error:', error);
      return {
        success: false,
        error: ErrorCodes.API_ERROR,
        message: 'Failed to fetch emails',
      };
    }
  }

  // Get detailed email content
  async getEmailDetail(emailId: string): Promise<ApiResponse<Email>> {
    try {
      const response = await fetch(`${this.baseUrl}/email/${emailId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const email: Email = {
        id: data.id || data._id || emailId,
        from: data.from || data.sender || data.fromAddress || 'Unknown Sender',
        to: data.to || this.currentEmail || '',
        subject: data.subject || data.title || 'No Subject',
        body: data.body || data.content || data.text || data.html || '',
        timestamp: data.timestamp || data.date || data.receivedAt || new Date().toISOString(),
        isRead: true, // Mark as read when viewing details
        attachments: data.attachments || [],
      };

      // Generate hash for deduplication
      email.hash = this.generateEmailHash(email);

      return {
        success: true,
        data: email,
      };
    } catch (error) {
      console.error('Get email detail error:', error);
      return {
        success: false,
        error: ErrorCodes.API_ERROR,
        message: 'Failed to fetch email details',
      };
    }
  }

  // Delete an email (may not be supported by the API)
  async deleteEmail(emailId: string): Promise<ApiResponse<boolean>> {
    try {
      // This endpoint might not exist, but we'll try
      const response = await fetch(`${this.baseUrl}/email/${emailId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
      });

      if (!response.ok) {
        // If delete is not supported, just return success
        // The UI will handle removing it from the local cache
        return {
          success: true,
          data: true,
        };
      }

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Delete email error:', error);
      // Even if delete fails, return success for local removal
      return {
        success: true,
        data: true,
      };
    }
  }

  // Check if an email address exists and has emails
  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getEmails(email);
      return {
        success: true,
        data: response.success,
      };
    } catch (error) {
      return {
        success: false,
        error: ErrorCodes.API_ERROR,
        message: 'Failed to check email existence',
      };
    }
  }

  // Set current email address
  setCurrentEmail(email: string) {
    this.currentEmail = email;
  }

  // Get current email address
  getCurrentEmail(): string | null {
    return this.currentEmail;
  }

  // Check if email is valid
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate random email prefix
  generateRandomPrefix(): string {
    const adjectives = ['cool', 'smart', 'quick', 'bright', 'swift', 'clever', 'happy', 'lucky', 'magic', 'super'];
    const nouns = ['user', 'mail', 'temp', 'box', 'inbox', 'email', 'cat', 'dog', 'bird', 'fish'];
    const numbers = Math.floor(Math.random() * 10000);
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}${noun}${numbers}`;
  }

  // Get available domains (temp-mail.lol only has one domain)
  getAvailableDomains(): string[] {
    return ['temp-mail.lol'];
  }

  // Validate email prefix
  isValidPrefix(prefix: string): boolean {
    // Check if prefix is valid (alphanumeric, no special characters except underscore and dash)
    const prefixRegex = /^[a-zA-Z0-9_-]+$/;
    return prefixRegex.test(prefix) && prefix.length >= 3 && prefix.length <= 20;
  }

  // Get email statistics
  async getEmailStats(email: string): Promise<{total: number; unread: number}> {
    try {
      const response = await this.getEmails(email);
      if (response.success && response.data) {
        const emails = response.data.emails;
        return {
          total: emails.length,
          unread: emails.filter(e => !e.isRead).length,
        };
      }
      return {total: 0, unread: 0};
    } catch (error) {
      console.error('Get email stats error:', error);
      return {total: 0, unread: 0};
    }
  }
}

export default new ApiService();

