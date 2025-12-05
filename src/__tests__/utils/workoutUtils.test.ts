/**
 * Workout Utilities Tests
 * TC-WORKOUT-012: Abbreviation Generation
 */
import { describe, it, expect } from 'vitest';
import { generateLabel, DEFAULT_WORKOUT_COLOR } from '../../../utils/workoutUtils';

describe('Workout Utilities', () => {
  describe('TC-WORKOUT-012: Workout Abbreviation Auto-Generation', () => {
    it('should generate abbreviation from two words', () => {
      expect(generateLabel('Chest Day')).toBe('CD');
      expect(generateLabel('Upper Body')).toBe('UB');
      expect(generateLabel('Leg Day')).toBe('LD');
    });

    it('should generate abbreviation from single word', () => {
      expect(generateLabel('Legs')).toBe('LE');
      expect(generateLabel('Cardio')).toBe('CA');
      expect(generateLabel('Push')).toBe('PU');
    });

    it('should handle empty or whitespace names', () => {
      expect(generateLabel('')).toBe('W');
      expect(generateLabel('   ')).toBe('W');
    });

    it('should handle names with multiple words', () => {
      expect(generateLabel('Upper Body Push')).toBe('UB');
      expect(generateLabel('Lower Body Pull')).toBe('LB');
    });

    it('should return uppercase abbreviations', () => {
      const result = generateLabel('chest day');
      expect(result).toBe(result.toUpperCase());
    });
  });

  describe('DEFAULT_WORKOUT_COLOR', () => {
    it('should have correct default color', () => {
      expect(DEFAULT_WORKOUT_COLOR).toBe('#F97316');
    });
  });
});

