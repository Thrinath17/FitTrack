/**
 * Validation Utility Tests
 */
import { describe, it, expect } from 'vitest';
import {
  validateWorkoutName,
  validateEmail,
  validateReps,
  validateWeight,
  validateExerciseName,
} from '../../../utils/validation';

describe('Validation Utilities', () => {
  describe('TC-AUTH-003: Email Validation', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('TC-WORKOUT-002: Workout Name Validation', () => {
    it('should validate workout name length', () => {
      expect(validateWorkoutName('Chest Day')).toBe(true);
      expect(validateWorkoutName('A')).toBe(true); // Min length
      expect(validateWorkoutName('A'.repeat(50))).toBe(true); // Max length
    });

    it('should reject empty or too long names', () => {
      expect(validateWorkoutName('')).toBe(false);
      expect(validateWorkoutName('   ')).toBe(false); // Only whitespace
      expect(validateWorkoutName('A'.repeat(51))).toBe(false); // Too long
    });
  });

  describe('TC-WORKOUT-004: Reps Validation', () => {
    it('should validate reps range', () => {
      expect(validateReps(0)).toBe(true);
      expect(validateReps(10)).toBe(true);
      expect(validateReps(1000)).toBe(true); // Max
    });

    it('should reject invalid reps', () => {
      expect(validateReps(-1)).toBe(false);
      expect(validateReps(1001)).toBe(false);
      expect(validateReps(NaN)).toBe(false);
    });
  });

  describe('TC-WORKOUT-005: Weight Validation', () => {
    it('should validate weight range', () => {
      expect(validateWeight(0)).toBe(true);
      expect(validateWeight(225)).toBe(true);
      expect(validateWeight(2000)).toBe(true); // Max
    });

    it('should reject invalid weight', () => {
      expect(validateWeight(-1)).toBe(false);
      expect(validateWeight(2001)).toBe(false);
      expect(validateWeight(NaN)).toBe(false);
    });
  });

  describe('Exercise Name Validation', () => {
    it('should validate exercise name', () => {
      expect(validateExerciseName('Bench Press')).toBe(true);
      expect(validateExerciseName('A')).toBe(true);
      expect(validateExerciseName('A'.repeat(100))).toBe(true);
    });

    it('should reject invalid exercise names', () => {
      expect(validateExerciseName('')).toBe(false);
      expect(validateExerciseName('   ')).toBe(false);
      expect(validateExerciseName('A'.repeat(101))).toBe(false);
    });
  });
});

