/**
 * Google Analytics utilities for tracking user actions
 */

// Define interface for event properties
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

/**
 * Track a page view in Google Analytics
 * @param path The page path to track
 * @param title The page title
 */
export const trackPageView = (path: string, title?: string) => {
  if (!window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href
  });
};

/**
 * Track a custom event in Google Analytics
 * @param event Event details to track
 */
export const trackEvent = (event: AnalyticsEvent) => {
  if (!window.gtag) return;

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value
  });
};

/**
 * Track when a user generates a new email address
 * @param emailType The type of email generated
 */
export const trackEmailGeneration = (emailType: string) => {
  trackEvent({
    category: 'Email',
    action: 'Generate',
    label: emailType
  });
};

/**
 * Track when a user views an email
 */
export const trackEmailView = () => {
  trackEvent({
    category: 'Email',
    action: 'View'
  });
};

/**
 * Track when a user copies something to clipboard
 * @param contentType What type of content was copied
 */
export const trackCopy = (contentType: string) => {
  trackEvent({
    category: 'Interaction',
    action: 'Copy',
    label: contentType
  });
};

// Add TypeScript declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: Record<string, unknown>[];
  }
} 