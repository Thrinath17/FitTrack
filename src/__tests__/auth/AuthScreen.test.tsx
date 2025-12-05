/**
 * TC-AUTH-001, TC-AUTH-002, TC-AUTH-003, TC-AUTH-004
 * Authentication Screen Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthScreen } from '../../../features/auth/AuthScreen';
import { AuthProvider } from '../../../types';

describe('AuthScreen', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  describe('TC-AUTH-001: First-Time User Login with Google', () => {
    it('should display auth screen with Google option', () => {
      render(<AuthScreen onLogin={mockOnLogin} />);

      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in with Apple/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in with Email/i)).toBeInTheDocument();
    });

    it('should call onLogin when Google button is clicked', async () => {
      const user = userEvent.setup();
      render(<AuthScreen onLogin={mockOnLogin} />);

      const googleButton = screen.getByText(/Sign in with Google/i).closest('button');
      if (googleButton) {
        await user.click(googleButton);
      }

      // Wait for async operation
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(AuthProvider.GOOGLE);
      }, { timeout: 2000 });
    });
  });

  describe('TC-AUTH-002: Login with Email/Password - Valid Email', () => {
    it('should show email form when email button is clicked', async () => {
      const user = userEvent.setup();
      render(<AuthScreen onLogin={mockOnLogin} />);

      const emailButton = screen.getByText(/Sign in with Email/i).closest('button');
      if (emailButton) {
        await user.click(emailButton);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      });
    });

    it('should authenticate with valid email', async () => {
      const user = userEvent.setup();
      render(<AuthScreen onLogin={mockOnLogin} />);

      // Click email button
      const emailButton = screen.getByText(/Sign in with Email/i).closest('button');
      if (emailButton) {
        await user.click(emailButton);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      });

      // Fill form
      const emailInput = screen.getByLabelText(/Email address/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Wait for async login
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith(AuthProvider.EMAIL, 'test@example.com');
      }, { timeout: 2000 });
    });
  });

  describe('TC-AUTH-003: Login with Email - Invalid Email Format', () => {
    it('should show error for invalid email', async () => {
      const user = userEvent.setup();
      render(<AuthScreen onLogin={mockOnLogin} />);

      // Click email button
      const emailButton = screen.getByText(/Sign in with Email/i).closest('button');
      if (emailButton) {
        await user.click(emailButton);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      });

      // Fill with invalid email
      const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      // Clear and type invalid email
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');
      
      // Submit form
      await user.click(submitButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });

  describe('TC-AUTH-004: Login with Email - Empty Fields', () => {
    it('should show error when fields are empty', async () => {
      const user = userEvent.setup();
      render(<AuthScreen onLogin={mockOnLogin} />);

      // Click email button
      const emailButton = screen.getByText(/Sign in with Email/i).closest('button');
      if (emailButton) {
        await user.click(emailButton);
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      });

      // Clear any default values and try to submit without filling
      const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Sign In/i });
      
      // Clear inputs to ensure they're empty
      await user.clear(emailInput);
      await user.clear(passwordInput);
      
      // Submit form
      await user.click(submitButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/Please enter both email and password/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });
});

