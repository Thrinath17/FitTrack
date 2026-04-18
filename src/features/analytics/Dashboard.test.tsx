import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard, getLocalInsight } from './Dashboard';
import { AttendanceRecord } from '@/types';
import { subDays, format } from 'date-fns';

// N consecutive attended days counting back from today
function buildStreak(days: number): AttendanceRecord[] {
  return Array.from({ length: days }).map((_, i) => ({
    id: `r${i}`,
    date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
    attended: true,
    timestamp: Date.now(),
  }));
}

// Build attended records at specific day offsets from today (non-consecutive by default)
function buildAtDays(offsets: number[]): AttendanceRecord[] {
  return offsets.map((offset, i) => ({
    id: `r${i}`,
    date: format(subDays(new Date(), offset), 'yyyy-MM-dd'),
    attended: true,
    timestamp: Date.now(),
  }));
}

describe('getLocalInsight', () => {
  it('returns neutral message and trend for empty records', () => {
    const result = getLocalInsight([]);
    expect(result.message).toContain('Start logging');
    expect(result.trend).toBe('neutral');
  });

  it('returns streak message and up trend for 7+ consecutive days', () => {
    const result = getLocalInsight(buildStreak(10));
    expect(result.message).toContain('10-day streak');
    expect(result.trend).toBe('up');
  });

  it('returns streak message and up trend for 3–6 consecutive days', () => {
    const result = getLocalInsight(buildStreak(4));
    expect(result.message).toContain('4 days in a row');
    expect(result.trend).toBe('up');
  });

  it('returns consistency message when 70%+ attendance with no current streak', () => {
    // 21 attended days starting from day 2 (so current streak = 0, no attendance today/yesterday)
    // Consistency = 21/30 = 70%
    const result = getLocalInsight(
      Array.from({ length: 21 }).map((_, i) => ({
        id: `r${i}`,
        date: format(subDays(new Date(), i + 2), 'yyyy-MM-dd'),
        attended: true,
        timestamp: Date.now(),
      }))
    );
    expect(result.trend).toBe('up');
    expect(result.message).toContain('%');
  });

  it('returns improving trend message when last 7 days beat previous 7 (no streak)', () => {
    // Days 1,3,5 attended in last 7 (non-consecutive → current streak = 0)
    // Day 8 attended in prev 7 → last7=3, prev7=1 → improving
    const result = getLocalInsight(buildAtDays([1, 3, 5, 8]));
    expect(result.trend).toBe('up');
    expect(result.message).toContain('3 sessions this week');
  });

  it('returns down trend message when last 7 days are fewer than previous 7 and low', () => {
    // Day 2 attended in last 7 (non-consecutive, streak=0)
    // Days 8,9,10,11 attended in prev 7 → last7=1, prev7=4 → declining, last7<3
    const result = getLocalInsight(buildAtDays([2, 8, 9, 10, 11]));
    expect(result.trend).toBe('down');
    expect(result.message).toContain('1 sessions this week');
  });

  it('returns neutral fallback for moderate equal attendance', () => {
    // Days 1,3 in last7 (2 sessions), days 8,10 in prev7 (2 sessions) → equal → neutral
    // streak=0, consistency=4/30≈13% (< 70%), last7===prev7 → neutral
    const result = getLocalInsight(buildAtDays([1, 3, 8, 10]));
    expect(result.trend).toBe('neutral');
  });
});

describe('Dashboard component', () => {
  const emptyRecords: AttendanceRecord[] = [];

  const sampleRecords: AttendanceRecord[] = [
    { id: '1', date: format(subDays(new Date(), 0), 'yyyy-MM-dd'), attended: true, timestamp: Date.now() },
    { id: '2', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), attended: true, timestamp: Date.now() },
    { id: '3', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), attended: false, timestamp: Date.now() },
  ];

  it('renders the Overview heading', () => {
    render(<Dashboard records={emptyRecords} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('renders stat cards for Last 7 Days and Total Sessions', () => {
    render(<Dashboard records={emptyRecords} />);
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
  });

  it('shows correct total sessions count', () => {
    render(<Dashboard records={sampleRecords} />);
    // Target the <p> sibling immediately after the "Total Sessions" label
    const label = screen.getByText('Total Sessions');
    const count = label.nextElementSibling;
    expect(count?.textContent).toBe('2');
  });

  it('renders the Weekly Frequency chart section', () => {
    render(<Dashboard records={emptyRecords} />);
    expect(screen.getByText('Weekly Frequency')).toBeInTheDocument();
  });

  it('renders the Coach Insight card', () => {
    render(<Dashboard records={emptyRecords} />);
    expect(screen.getByText('Coach Insight')).toBeInTheDocument();
  });

  it('shows start logging message when no records', () => {
    render(<Dashboard records={emptyRecords} />);
    expect(screen.getByText(/Start logging/i)).toBeInTheDocument();
  });
});
