import { describe, it, expect } from 'vitest';
import { StorageError, getStorageErrorMessage, getAPIErrorMessage } from './errors';

describe('StorageError', () => {
  it('is an instance of Error', () => {
    const error = new StorageError('test message');
    expect(error).toBeInstanceOf(Error);
  });

  it('sets the correct name', () => {
    const error = new StorageError('test message');
    expect(error.name).toBe('StorageError');
  });

  it('sets the message correctly', () => {
    const error = new StorageError('storage failed');
    expect(error.message).toBe('storage failed');
  });

  it('stores an optional code', () => {
    const error = new StorageError('quota exceeded', 'QUOTA');
    expect(error.code).toBe('QUOTA');
  });

  it('code is undefined when not provided', () => {
    const error = new StorageError('no code');
    expect(error.code).toBeUndefined();
  });
});

describe('getStorageErrorMessage', () => {
  it('returns quota message for DOMException with code 22', () => {
    const domError = new DOMException('QuotaExceededError', 'QuotaExceededError');
    Object.defineProperty(domError, 'code', { value: 22 });
    const message = getStorageErrorMessage(domError);
    expect(message).toContain('Storage limit reached');
  });

  it('returns quota message for DOMException with name QuotaExceededError', () => {
    const domError = new DOMException('msg', 'QuotaExceededError');
    const message = getStorageErrorMessage(domError);
    expect(message).toContain('Storage limit reached');
  });

  it('returns security message for DOMException with code 18', () => {
    const domError = new DOMException('SecurityError', 'SecurityError');
    Object.defineProperty(domError, 'code', { value: 18 });
    const message = getStorageErrorMessage(domError);
    expect(message).toContain('Storage access denied');
  });

  it('returns security message for DOMException with name SecurityError', () => {
    const domError = new DOMException('msg', 'SecurityError');
    const message = getStorageErrorMessage(domError);
    expect(message).toContain('Storage access denied');
  });

  it('returns generic fallback for unknown errors', () => {
    const message = getStorageErrorMessage(new Error('unknown'));
    expect(message).toBe('Unable to save data. Please try again.');
  });

  it('returns generic fallback for non-Error values', () => {
    const message = getStorageErrorMessage('some string error');
    expect(message).toBe('Unable to save data. Please try again.');
  });
});

describe('getAPIErrorMessage', () => {
  it('returns network error message for errors containing "network"', () => {
    const message = getAPIErrorMessage(new Error('network timeout'));
    expect(message).toContain('Network error');
  });

  it('returns network error message for errors containing "fetch"', () => {
    const message = getAPIErrorMessage(new Error('fetch failed'));
    expect(message).toContain('Network error');
  });

  it('returns authentication error message for errors containing "API key"', () => {
    const message = getAPIErrorMessage(new Error('API key is invalid'));
    expect(message).toContain('Authentication error');
  });

  it('returns authentication error message for errors containing "authentication"', () => {
    const message = getAPIErrorMessage(new Error('authentication failed'));
    expect(message).toContain('Authentication error');
  });

  it('returns generic fallback for unknown Error', () => {
    const message = getAPIErrorMessage(new Error('something went wrong'));
    expect(message).toBe('An error occurred. Please try again later.');
  });

  it('returns generic fallback for non-Error values', () => {
    const message = getAPIErrorMessage('plain string');
    expect(message).toBe('An error occurred. Please try again later.');
  });

  it('returns generic fallback for null', () => {
    const message = getAPIErrorMessage(null);
    expect(message).toBe('An error occurred. Please try again later.');
  });
});
