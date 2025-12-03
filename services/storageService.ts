
import { AttendanceRecord, NotificationConfig, User, Workout } from '../types';

// In a real app, this would be an interface implemented by FirestoreRepository or SQLiteRepository
const STORAGE_KEYS = {
  USER: 'fittrack_user',
  ATTENDANCE: 'fittrack_attendance',
  NOTIFICATIONS: 'fittrack_notifications',
  WORKOUTS: 'fittrack_workouts',
};

export const StorageService = {
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getAttendance: (): AttendanceRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },

  saveAttendance: (record: AttendanceRecord): void => {
    const current = StorageService.getAttendance();
    const existingIndex = current.findIndex(r => r.date === record.date);
    
    if (existingIndex >= 0) {
      current[existingIndex] = record;
    } else {
      current.push(record);
    }
    
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(current));
  },

  getNotificationConfig: (): NotificationConfig => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : {
      enabled: false,
      usualGymTime: '18:00',
      reminders: [
        { id: '1', minutesBefore: 60, message: 'Time to get ready for the gym!' }
      ]
    };
  },

  saveNotificationConfig: (config: NotificationConfig): void => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(config));
  },

  getWorkouts: (): Workout[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  },

  saveWorkouts: (workouts: Workout[]): void => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  }
};
