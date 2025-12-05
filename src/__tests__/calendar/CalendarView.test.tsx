/**
 * Calendar View Tests
 * TC-CAL-001, TC-CAL-002, TC-CAL-003, TC-CAL-004, TC-CAL-005
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarView } from '../../../features/calendar/CalendarView';
import { AttendanceRecord, Workout } from '../../../types';
import { WorkoutExecutionProvider } from '../../../contexts/WorkoutExecutionContext';

const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Chest Day',
    exercises: [],
    createdAt: Date.now(),
    color: '#F97316',
    abbreviation: 'CD',
  },
];

const mockRecords: AttendanceRecord[] = [
  {
    id: 'a1',
    date: '2024-01-15',
    attended: true,
    timestamp: Date.now(),
  },
];

const CalendarWithProvider = () => (
  <WorkoutExecutionProvider>
    <CalendarView
      records={mockRecords}
      workouts={mockWorkouts}
      onUpdateRecord={vi.fn()}
    />
  </WorkoutExecutionProvider>
);

describe('CalendarView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-CAL-001: should render calendar view', () => {
    render(<CalendarWithProvider />);
    
    expect(screen.getByText(/Schedule/i)).toBeInTheDocument();
  });

  it('TC-CAL-004: should display month statistics', () => {
    render(<CalendarWithProvider />);
    
    // Should show month stats
    expect(screen.getByText(/This Month/i)).toBeInTheDocument();
  });
});

