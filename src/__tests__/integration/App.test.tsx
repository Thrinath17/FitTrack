/**
 * Integration Tests for Main App Flow
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { WorkoutExecutionProvider } from '../../../contexts/WorkoutExecutionContext';

// Mock the app with providers
const AppWithProviders = () => (
  <WorkoutExecutionProvider>
    <App />
  </WorkoutExecutionProvider>
);

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('TC-AUTH-001: should show auth screen when not logged in', () => {
    render(<AppWithProviders />);
    
    expect(screen.getByText(/FitTrack Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
  });

  it('TC-NAV-003: should redirect to Workouts view after login', async () => {
    const user = userEvent.setup();
    render(<AppWithProviders />);

    // Login with Google (mock)
    const googleButton = screen.getByText(/Sign in with Google/i).closest('button');
    if (googleButton) {
      await user.click(googleButton);
    }

    // Wait for login to complete
    await waitFor(() => {
      // Should be on Workouts view (default)
      expect(screen.queryByText(/Sign in with Google/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

