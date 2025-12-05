/**
 * Error handling utilities and custom error classes
 */

/**
 * Custom error for storage operations
 */
export class StorageError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Gets a user-friendly error message from a storage error
 * @param error - The error object
 * @returns A user-friendly error message
 */
export const getStorageErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException) {
    if (error.code === 22 || error.name === 'QuotaExceededError') {
      return 'Storage limit reached. Please clear some data or use a different browser.';
    }
    if (error.code === 18 || error.name === 'SecurityError') {
      return 'Storage access denied. Please check your browser settings.';
    }
  }
  return 'Unable to save data. Please try again.';
};

/**
 * Gets a user-friendly error message for API errors
 * @param error - The error object
 * @returns A user-friendly error message
 */
export const getAPIErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return 'Authentication error. Please check your API configuration.';
    }
  }
  return 'An error occurred. Please try again later.';
};


