/**
 * Input validation utilities
 */

/**
 * Validates a workout name
 * @param name - The workout name to validate
 * @returns true if valid, false otherwise
 */
export const validateWorkoutName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
};

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a reps value
 * @param reps - The number of reps
 * @returns true if valid, false otherwise
 */
export const validateReps = (reps: number): boolean => {
  return Number.isInteger(reps) && reps >= 0 && reps <= 1000;
};

/**
 * Validates a weight value
 * @param weight - The weight in lbs
 * @returns true if valid, false otherwise
 */
export const validateWeight = (weight: number): boolean => {
  return !isNaN(weight) && weight >= 0 && weight <= 2000;
};

/**
 * Validates an exercise name
 * @param name - The exercise name
 * @returns true if valid, false otherwise
 */
export const validateExerciseName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
};


