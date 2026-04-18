import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutExecutionProvider, useWorkoutExecution } from './WorkoutExecutionContext';
import { Workout } from '@/types';

const mockWorkout: Workout = {
  id: 'w1',
  name: 'Chest Day',
  exercises: [{ id: 'e1', name: 'Bench Press', sets: [{ id: 's1', reps: 5, weight: 135 }] }],
  createdAt: Date.now(),
};

// Test consumer component wired to buttons for interaction
const TestConsumer = () => {
  const {
    executingWorkout,
    completedSetIds,
    lastCompletedTime,
    setExecutingWorkout,
    setLastCompletedTime,
    toggleSetCompletion,
    resetExecution,
  } = useWorkoutExecution();

  return (
    <div>
      <div data-testid="workout-name">{executingWorkout?.name ?? 'none'}</div>
      <div data-testid="completed-count">{completedSetIds.size}</div>
      <div data-testid="has-set-s1">{completedSetIds.has('s1') ? 'yes' : 'no'}</div>
      <div data-testid="last-time">{lastCompletedTime ?? 'null'}</div>
      <button onClick={() => setExecutingWorkout(mockWorkout)}>Start</button>
      <button onClick={() => toggleSetCompletion('s1')}>Toggle s1</button>
      <button onClick={() => toggleSetCompletion('s2')}>Toggle s2</button>
      <button onClick={() => setLastCompletedTime(12345)}>Set Time</button>
      <button onClick={resetExecution}>Reset</button>
    </div>
  );
};

describe('WorkoutExecutionContext', () => {
  it('renders children inside the provider', () => {
    render(
      <WorkoutExecutionProvider>
        <div>child content</div>
      </WorkoutExecutionProvider>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('throws an error when useWorkoutExecution is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useWorkoutExecution must be used within a WorkoutExecutionProvider'
    );
    consoleSpy.mockRestore();
  });

  it('provides default state: no executing workout, empty sets, null time', () => {
    render(
      <WorkoutExecutionProvider>
        <TestConsumer />
      </WorkoutExecutionProvider>
    );
    expect(screen.getByTestId('workout-name').textContent).toBe('none');
    expect(screen.getByTestId('completed-count').textContent).toBe('0');
    expect(screen.getByTestId('last-time').textContent).toBe('null');
  });

  it('sets the executing workout via setExecutingWorkout', async () => {
    const user = userEvent.setup();
    render(
      <WorkoutExecutionProvider>
        <TestConsumer />
      </WorkoutExecutionProvider>
    );
    await user.click(screen.getByText('Start'));
    expect(screen.getByTestId('workout-name').textContent).toBe('Chest Day');
  });

  it('toggleSetCompletion adds a set ID', async () => {
    const user = userEvent.setup();
    render(
      <WorkoutExecutionProvider>
        <TestConsumer />
      </WorkoutExecutionProvider>
    );
    await user.click(screen.getByText('Toggle s1'));
    expect(screen.getByTestId('has-set-s1').textContent).toBe('yes');
    expect(screen.getByTestId('completed-count').textContent).toBe('1');
  });

  it('toggleSetCompletion removes a set ID that was already added', async () => {
    const user = userEvent.setup();
    render(
      <WorkoutExecutionProvider>
        <TestConsumer />
      </WorkoutExecutionProvider>
    );
    await user.click(screen.getByText('Toggle s1'));
    await user.click(screen.getByText('Toggle s1'));
    expect(screen.getByTestId('has-set-s1').textContent).toBe('no');
    expect(screen.getByTestId('completed-count').textContent).toBe('0');
  });

  it('tracks multiple independent set IDs', async () => {
    const user = userEvent.setup();
    render(
      <WorkoutExecutionProvider>
        <TestConsumer />
      </WorkoutExecutionProvider>
    );
    await user.click(screen.getByText('Toggle s1'));
    await user.click(screen.getByText('Toggle s2'));
    expect(screen.getByTestId('completed-count').textContent).toBe('2');
  });

  it('resetExecution clears workout, sets, and time', async () => {
    const user = userEvent.setup();
    render(
      <WorkoutExecutionProvider>
        <TestConsumer />
      </WorkoutExecutionProvider>
    );
    await user.click(screen.getByText('Start'));
    await user.click(screen.getByText('Toggle s1'));
    await user.click(screen.getByText('Set Time'));
    await user.click(screen.getByText('Reset'));

    expect(screen.getByTestId('workout-name').textContent).toBe('none');
    expect(screen.getByTestId('completed-count').textContent).toBe('0');
    expect(screen.getByTestId('last-time').textContent).toBe('null');
  });
});
