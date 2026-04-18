import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

const BrokenComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) throw new Error('Test render error');
  return <div>Healthy content</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Healthy content')).toBeInTheDocument();
  });

  it('renders default error UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows error details in a details element', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Error details')).toBeInTheDocument();
    expect(screen.getByText(/Test render error/)).toBeInTheDocument();
  });

  it('renders a Try Again button', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('renders a Refresh Page button', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: 'Refresh Page' })).toBeInTheDocument();
  });

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback UI</div>}>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback UI')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('resets error state when Try Again is clicked', async () => {
    const user = userEvent.setup();

    // React 19 calls reportError() for ErrorBoundary-caught errors in dev mode,
    // which dispatches an ErrorEvent on window. Intercept it in the capture phase
    // (before Vitest's handler) so the test isn't marked as having an unhandled error.
    const suppressGlobalError = (e: ErrorEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener('error', suppressGlobalError, true);

    // Use a plain object ref so we can explicitly stop throwing before reset,
    // regardless of how many times React 19 renders the component during recovery.
    const throwingRef = { current: true };
    const ControlledBroken = () => {
      if (throwingRef.current) throw new Error('controlled error');
      return <div>Recovered</div>;
    };

    render(
      <ErrorBoundary>
        <ControlledBroken />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Stop throwing before reset so the next render succeeds.
    throwingRef.current = false;
    await user.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.getByText('Recovered')).toBeInTheDocument();

    window.removeEventListener('error', suppressGlobalError, true);
  });
});
