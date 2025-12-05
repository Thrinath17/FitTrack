/**
 * Shared utilities and constants for workout-related functionality
 */

/**
 * Default color for workouts (orangish-red theme)
 */
export const DEFAULT_WORKOUT_COLOR = '#F97316';

/**
 * Generates a workout label abbreviation from the workout name.
 * 
 * @param name - The workout name (e.g., "Chest Day")
 * @returns A 1-2 letter abbreviation (e.g., "CD")
 * 
 * @example
 * generateLabel("Chest Day") // "CD"
 * generateLabel("Legs") // "LE"
 * generateLabel("") // "W"
 */
export const generateLabel = (name: string): string => {
  if (!name || !name.trim()) return 'W';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    // First letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  // First two letters of first word
  return words[0].substring(0, 2).toUpperCase();
};


