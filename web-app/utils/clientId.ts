import { v4 as uuidv4 } from 'uuid';

// Key for storing the client ID in localStorage
const CLIENT_ID_KEY = 'ephemeral_postbox_client_id';

/**
 * Gets the client ID from localStorage or creates a new one if it doesn't exist
 * @returns A unique client identifier
 */
export function getClientId(): string {
  // Check if clientId exists in localStorage
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  
  // If no clientId found, create a new one
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  
  return clientId;
}

/**
 * Clears the client ID from localStorage
 */
export function clearClientId(): void {
  localStorage.removeItem(CLIENT_ID_KEY);
}

/**
 * Gets client information to send with requests
 * @returns An object containing the client ID and other identifying information
 */
export function getClientInfo(): Record<string, string> {
  return {
    clientId: getClientId(),
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width.toString(),
    screenHeight: window.screen.height.toString(),
    language: navigator.language
  };
} 