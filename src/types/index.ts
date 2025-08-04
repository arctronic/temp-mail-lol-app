// Email types
export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  hash?: string; // MD5 hash for deduplication (from+to+subject+timestamp)
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  url: string;
}

// Temporary email address
export interface TempEmailAddress {
  id: string;
  email: string;
  domain: string;
  prefix: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  hasMore: boolean;
}

// App state types
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultDomain: string;
}

// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Inbox: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  EmailDetail: {emailId: string};
  QRCode: {email: string};
};

// AdMob types
export interface AdConfig {
  bannerId: string;
  interstitialId: string;
  rewardedId?: string;
  appOpenId?: string;
  testMode: boolean;
}

// Storage keys
export enum StorageKeys {
  CURRENT_EMAIL = 'current_email',
  EMAIL_HISTORY = 'email_history',
  SETTINGS = 'app_settings',
  CACHED_EMAILS = 'cached_emails',
}

// API endpoints
export enum ApiEndpoints {
  GENERATE_EMAIL = '/generate',
  GET_EMAILS = '/emails',
  GET_EMAIL_DETAIL = '/email',
  DELETE_EMAIL = '/delete',
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export enum ErrorCodes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AD_LOAD_ERROR = 'AD_LOAD_ERROR',
}

