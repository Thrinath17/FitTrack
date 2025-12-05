/**
 * Application-wide constants
 */

// Animation and timing constants
export const ANIMATION_DELAY = 1500; // milliseconds
export const INTRO_ANIMATION_DURATION = 2000; // milliseconds
export const RECENT_COMPLETION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// Validation constants
export const MIN_WORKOUT_NAME_LENGTH = 1;
export const MAX_WORKOUT_NAME_LENGTH = 50;
export const MAX_EXERCISE_NAME_LENGTH = 100;
export const MAX_NOTE_LENGTH = 500;
export const MIN_REPS = 0;
export const MAX_REPS = 1000;
export const MIN_WEIGHT = 0;
export const MAX_WEIGHT = 2000; // lbs

// Storage keys (already defined in storageService, but keeping for reference)
export const STORAGE_KEYS = {
  USER: 'fittrack_user',
  ATTENDANCE: 'fittrack_attendance',
  NOTIFICATIONS: 'fittrack_notifications',
  WORKOUTS: 'fittrack_workouts',
} as const;


