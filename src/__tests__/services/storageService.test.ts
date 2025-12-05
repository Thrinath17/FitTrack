/**
 * TC-DATA-001, TC-DATA-002, TC-ERROR-001, TC-ERROR-002, TC-ERROR-003
 * Storage Service Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../../../services/storageService';
import { StorageError } from '../../../utils/errors';
import { User, Workout, AttendanceRecord, NotificationConfig } from '../../../types';

describe('StorageService', () => {
  beforeEach(() => {
    // Clear localStorage manually (jsdom doesn't have clear())
    Object.keys(localStorage).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors
      }
    });
  });

  describe('TC-DATA-001: Data Persists After Page Reload', () => {
    it('should save and retrieve user data', () => {
      const user: User = {
        id: 'u123',
        name: 'Test User',
        email: 'test@example.com',
        provider: 'email' as any,
      };

      StorageService.saveUser(user);
      const retrieved = StorageService.getUser();

      expect(retrieved).toEqual(user);
    });

    it('should save and retrieve workouts', () => {
      const workout: Workout = {
        id: 'w1',
        name: 'Chest Day',
        exercises: [],
        createdAt: Date.now(),
        color: '#F97316',
        abbreviation: 'CD',
      };

      StorageService.saveWorkouts([workout]);
      const retrieved = StorageService.getWorkouts();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toEqual(workout);
    });

    it('should save and retrieve attendance records', () => {
      const record: AttendanceRecord = {
        id: 'a1',
        date: '2024-01-15',
        attended: true,
        timestamp: Date.now(),
      };

      StorageService.saveAttendance(record);
      const retrieved = StorageService.getAttendance();

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].date).toBe('2024-01-15');
      expect(retrieved[0].attended).toBe(true);
    });
  });

  describe('TC-ERROR-001: localStorage Quota Exceeded', () => {
    it('should handle quota exceeded error gracefully', () => {
      // Use spyOn to intercept setItem calls
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
      
      // Allow first call (availability check) to succeed, then throw on subsequent calls
      let callCount = 0;
      setItemSpy.mockImplementation((key: string, value: string) => {
        callCount++;
        // First call is for availability check - allow it
        if (key === '__localStorage_test__' || callCount === 1) {
          return Storage.prototype.setItem.call(localStorage, key, value);
        }
        // Subsequent calls throw quota error
        throw quotaError;
      });

      const user: User = {
        id: 'u123',
        name: 'Test',
        email: 'test@example.com',
        provider: 'email' as any,
      };

      expect(() => StorageService.saveUser(user)).toThrow(StorageError);
      
      setItemSpy.mockRestore();
    });
  });

  describe('TC-ERROR-002: localStorage Unavailable', () => {
    it('should handle localStorage unavailable error', () => {
      // Use spyOn to make setItem throw, simulating unavailable localStorage
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      // The isLocalStorageAvailable check should fail, causing getUser to throw StorageError
      expect(() => StorageService.getUser()).toThrow(StorageError);
      expect(() => StorageService.getUser()).toThrow('LocalStorage is not available');
      
      setItemSpy.mockRestore();
    });
  });

  describe('TC-ERROR-003: Invalid JSON in localStorage', () => {
    it('should handle corrupted JSON data', () => {
      // Set invalid JSON
      localStorage.setItem('fittrack_user', 'invalid json{');

      // Should return null or default value, not crash
      const user = StorageService.getUser();
      expect(user).toBeNull();
    });
  });

  describe('User Management', () => {
    it('TC-AUTH-005: should persist user session', () => {
      const user: User = {
        id: 'u123',
        name: 'Test User',
        email: 'test@example.com',
        provider: 'email' as any,
      };

      StorageService.saveUser(user);
      const retrieved = StorageService.getUser();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('u123');
    });

    it('TC-AUTH-006: should clear user on logout', () => {
      const user: User = {
        id: 'u123',
        name: 'Test',
        email: 'test@example.com',
        provider: 'email' as any,
      };

      StorageService.saveUser(user);
      StorageService.clearUser();
      const retrieved = StorageService.getUser();

      expect(retrieved).toBeNull();
    });
  });

  describe('Workout Management', () => {
    it('TC-WORKOUT-001: should save workout routine', () => {
      const workout: Workout = {
        id: 'w1',
        name: 'Chest Day',
        exercises: [
          {
            id: 'e1',
            name: 'Bench Press',
            sets: [
              { id: 's1', reps: 5, weight: 225 },
            ],
          },
        ],
        createdAt: Date.now(),
        color: '#F97316',
        abbreviation: 'CD',
      };

      StorageService.saveWorkouts([workout]);
      const workouts = StorageService.getWorkouts();

      expect(workouts).toHaveLength(1);
      expect(workouts[0].name).toBe('Chest Day');
    });

    it('should update existing workout', () => {
      const workout: Workout = {
        id: 'w1',
        name: 'Chest Day',
        exercises: [],
        createdAt: Date.now(),
        color: '#F97316',
        abbreviation: 'CD',
      };

      StorageService.saveWorkouts([workout]);
      
      const updated: Workout = { ...workout, name: 'Updated Chest Day' };
      StorageService.saveWorkouts([updated]);
      
      const workouts = StorageService.getWorkouts();
      expect(workouts[0].name).toBe('Updated Chest Day');
    });
  });

  describe('Attendance Management', () => {
    it('TC-ATTEND-001: should save attendance record', () => {
      const record: AttendanceRecord = {
        id: 'a1',
        date: '2024-01-15',
        attended: true,
        timestamp: Date.now(),
      };

      StorageService.saveAttendance(record);
      const records = StorageService.getAttendance();

      expect(records).toHaveLength(1);
      expect(records[0].attended).toBe(true);
    });

    it('should update existing attendance record', () => {
      const record: AttendanceRecord = {
        id: 'a1',
        date: '2024-01-15',
        attended: true,
        timestamp: Date.now(),
      };

      StorageService.saveAttendance(record);
      
      const updated: AttendanceRecord = { ...record, attended: false };
      StorageService.saveAttendance(updated);
      
      const records = StorageService.getAttendance();
      expect(records[0].attended).toBe(false);
    });
  });

  describe('Notification Config', () => {
    it('TC-SETTINGS-001: should save notification config', () => {
      const config: NotificationConfig = {
        enabled: true,
        usualGymTime: '18:00',
        reminders: [],
      };

      StorageService.saveNotificationConfig(config);
      const retrieved = StorageService.getNotificationConfig();

      expect(retrieved.enabled).toBe(true);
      expect(retrieved.usualGymTime).toBe('18:00');
    });

    it('should return default config if none exists', () => {
      const config = StorageService.getNotificationConfig();

      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('usualGymTime');
      expect(config).toHaveProperty('reminders');
    });
  });
});

