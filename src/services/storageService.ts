
import { AttendanceRecord, NotificationConfig, User, Workout } from '../types';
import { StorageError, getStorageErrorMessage } from '../utils/errors';

// In a real app, this would be an interface implemented by FirestoreRepository or SQLiteRepository
const STORAGE_KEYS = {
  USER: 'fittrack_user',
  ATTENDANCE: 'fittrack_attendance',
  NOTIFICATIONS: 'fittrack_notifications',
  WORKOUTS: 'fittrack_workouts',
} as const;

/**
 * Checks if localStorage is available
 * @returns true if available, false otherwise
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely parses JSON from localStorage
 * @param data - The JSON string to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed data or default value
 */
const safeParseJSON = <T>(data: string | null, defaultValue: T): T => {
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Failed to parse JSON from localStorage:', error);
    return defaultValue;
  }
};

export const StorageService = {
  /**
   * Gets the current user from localStorage
   * @returns User object or null if not found
   * @throws StorageError if localStorage is unavailable
   */
  getUser: (): User | null => {
    if (!isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage is not available. Please check your browser settings.');
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return safeParseJSON<User | null>(data, null);
    } catch (error) {
      console.error('Error getting user:', error);
      throw new StorageError(getStorageErrorMessage(error), 'GET_USER_ERROR');
    }
  },

  /**
   * Saves a user to localStorage
   * @param user - The user object to save
   * @throws StorageError if save operation fails
   */
  saveUser: (user: User): void => {
    if (!isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage is not available. Please check your browser settings.');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw new StorageError(getStorageErrorMessage(error), 'SAVE_USER_ERROR');
    }
  },

  /**
   * Clears the user from localStorage
   * @throws StorageError if clear operation fails
   */
  clearUser: (): void => {
    if (!isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage is not available. Please check your browser settings.');
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing user:', error);
      throw new StorageError(getStorageErrorMessage(error), 'CLEAR_USER_ERROR');
    }
  },

  /**
   * Gets all attendance records from localStorage
   * @returns Array of attendance records
   * @throws StorageError if get operation fails
   */
  getAttendance: (): AttendanceRecord[] => {
    if (!isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage is not available. Please check your browser settings.');
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return safeParseJSON<AttendanceRecord[]>(data, []);
    } catch (error) {
      console.error('Error getting attendance:', error);
      throw new StorageError(getStorageErrorMessage(error), 'GET_ATTENDANCE_ERROR');
    }
  },

  /**
   * Saves an attendance record to localStorage
   * @param record - The attendance record to save
   * @throws StorageError if save operation fails
   */
  saveAttendance: (record: AttendanceRecord): void => {
    if (!isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage is not available. Please check your browser settings.');
    }
    try {
      const current = StorageService.getAttendance();
      const existingIndex = current.findIndex(r => r.date === record.date);
      
      if (existingIndex >= 0) {
        current[existingIndex] = record;
      } else {
        current.push(record);
      }
      
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(current));
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw new StorageError(getStorageErrorMessage(error), 'SAVE_ATTENDANCE_ERROR');
    }
  },

  /**
   * Gets notification configuration from localStorage
   * @returns NotificationConfig object with defaults if not found
   * @throws StorageError if get operation fails
   */
  getNotificationConfig: (): NotificationConfig => {
    if (!isLocalStorageAvailable()) {
      // Return default config if localStorage is unavailable
      return {
        enabled: false,
        usualGymTime: '18:00',
        reminders: [
          { id: '1', minutesBefore: 60, message: 'Time to get ready for the gym!' }
        ]
      };
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return safeParseJSON<NotificationConfig>(data, {
        enabled: false,
        usualGymTime: '18:00',
        reminders: [
          { id: '1', minutesBefore: 60, message: 'Time to get ready for the gym!' }
        ]
      });
    } catch (error) {
      console.error('Error getting notification config:', error);
      // Return default config on error
      return {
        enabled: false,
        usualGymTime: '18:00',
        reminders: [
          { id: '1', minutesBefore: 60, message: 'Time to get ready for the gym!' }
        ]
      };
    }
  },

  /**
   * Saves notification configuration to localStorage
   * @param config - The notification config to save
   * @throws StorageError if save operation fails
   */
  saveNotificationConfig: (config: NotificationConfig): void => {
    if (!isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage is not available. Please check your browser settings.');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving notification config:', error);
      throw new StorageError(getStorageErrorMessage(error), 'SAVE_NOTIFICATION_CONFIG_ERROR');
    }
  },

  /**
   * Gets all workouts from localStorage
   * @returns Array of workouts
   * @throws StorageError if get operation fails
   */
  getWorkouts: (): Workout[] => {
    if (!isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage is not available. Please check your browser settings.');
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return safeParseJSON<Workout[]>(data, []);
    } catch (error) {
      console.error('Error getting workouts:', error);
      throw new StorageError(getStorageErrorMessage(error), 'GET_WORKOUTS_ERROR');
    }
  },

  /**
   * Saves workouts array to localStorage
   * @param workouts - Array of workouts to save
   * @throws StorageError if save operation fails
   */
  saveWorkouts: (workouts: Workout[]): void => {
    if (!isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage is not available. Please check your browser settings.');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error saving workouts:', error);
      throw new StorageError(getStorageErrorMessage(error), 'SAVE_WORKOUTS_ERROR');
    }
  }
};
