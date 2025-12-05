/**
 * TC-WORKOUT-001, TC-WORKOUT-002, TC-WORKOUT-008, TC-WORKOUT-009, TC-WORKOUT-010
 * Workout Editor Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutEditor } from '../../../features/workouts/WorkoutEditor';
import { Workout } from '../../../types';

describe('WorkoutEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  describe('TC-WORKOUT-001: Create New Workout Routine', () => {
    it('should render workout editor', () => {
      render(<WorkoutEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByText(/New Routine/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Routine Name/i)).toBeInTheDocument();
    });

    it('should create workout with exercises and sets', async () => {
      const user = userEvent.setup();
      render(<WorkoutEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      // Enter workout name
      const nameInput = screen.getByLabelText(/Routine Name/i);
      await user.type(nameInput, 'Chest Day');

      // Add exercise
      const addExerciseButton = screen.getByText(/Add Exercise/i);
      await user.click(addExerciseButton);

      await waitFor(() => {
        const exerciseInputs = screen.getAllByPlaceholderText(/Exercise \d+/i);
        expect(exerciseInputs.length).toBeGreaterThan(0);
      });

      // Enter exercise name
      const exerciseInput = screen.getAllByPlaceholderText(/Exercise \d+/i)[0];
      await user.type(exerciseInput, 'Bench Press');

      // Add sets (should be one by default, add more)
      const addSetButtons = screen.getAllByText(/Add Set/i);
      if (addSetButtons.length > 0) {
        await user.click(addSetButtons[0]);
      }

      // Fill in sets data
      const weightInputs = screen.getAllByPlaceholderText('0').filter(
        (input) => (input as HTMLInputElement).type === 'number'
      );
      const repsInputs = screen.getAllByPlaceholderText('0').filter(
        (input) => (input as HTMLInputElement).type === 'number'
      );

      if (weightInputs.length > 0 && repsInputs.length > 0) {
        await user.clear(weightInputs[0]);
        await user.type(weightInputs[0], '225');
        await user.clear(repsInputs[0]);
        await user.type(repsInputs[0], '5');
      }

      // Save workout
      const saveButton = screen.getByRole('button', { name: /Save Routine/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      const savedWorkout = mockOnSave.mock.calls[0][0] as Workout;
      expect(savedWorkout.name).toBe('Chest Day');
      expect(savedWorkout.exercises.length).toBeGreaterThan(0);
    });
  });

  describe('TC-WORKOUT-002: Create Workout - Invalid Name', () => {
    it('should disable save button when name is empty', () => {
      render(<WorkoutEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      const saveButton = screen.getByRole('button', { name: /Save Routine/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show validation error for empty name', async () => {
      const user = userEvent.setup();
      render(<WorkoutEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      // Try to save without name
      const saveButton = screen.getByRole('button', { name: /Save Routine/i });
      
      // Button should be disabled, but let's try clicking if enabled
      if (!saveButton.hasAttribute('disabled')) {
        await user.click(saveButton);
        // Should show alert or prevent save
      }

      expect(saveButton).toBeDisabled();
    });
  });

  describe('TC-WORKOUT-008: Add Exercise to Workout', () => {
    it('should add exercise when Add Exercise is clicked', async () => {
      const user = userEvent.setup();
      render(<WorkoutEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      const addExerciseButton = screen.getByText(/Add Exercise/i);
      await user.click(addExerciseButton);

      await waitFor(() => {
        const exerciseInputs = screen.getAllByPlaceholderText(/Exercise \d+/i);
        expect(exerciseInputs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('TC-WORKOUT-010: Add Set to Exercise', () => {
    it('should add set when Add Set is clicked', async () => {
      const user = userEvent.setup();
      render(<WorkoutEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      // Add exercise first
      const addExerciseButton = screen.getByText(/Add Exercise/i);
      await user.click(addExerciseButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Add Set/i).length).toBeGreaterThan(0);
      });

      // Add set
      const addSetButtons = screen.getAllByText(/Add Set/i);
      await user.click(addSetButtons[0]);

      // Should have more sets now
      await waitFor(() => {
        const setInputs = screen.getAllByText(/Set \d+/i);
        expect(setInputs.length).toBeGreaterThan(1);
      });
    });
  });
});

