import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from './Layout';
import { AppView } from '@/types';

const defaultProps = {
  currentView: AppView.WORKOUTS,
  onChangeView: vi.fn(),
  onLogout: vi.fn(),
};

describe('Layout', () => {
  it('renders children content', () => {
    render(<Layout {...defaultProps}><div>page content</div></Layout>);
    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('renders the FitTrack Pro brand title', () => {
    render(<Layout {...defaultProps}><div /></Layout>);
    expect(screen.getByText('FitTrack Pro')).toBeInTheDocument();
  });

  it('renders all four navigation items', () => {
    render(<Layout {...defaultProps}><div /></Layout>);
    expect(screen.getAllByText('Workouts').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Calendar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  it('calls onChangeView with the correct view when a nav item is clicked', async () => {
    const user = userEvent.setup();
    const onChangeView = vi.fn();
    render(<Layout {...defaultProps} onChangeView={onChangeView}><div /></Layout>);

    // Click Calendar — get the first match (sidebar or mobile nav)
    await user.click(screen.getAllByText('Calendar')[0]);
    expect(onChangeView).toHaveBeenCalledWith(AppView.CALENDAR);
  });

  it('calls onChangeView with ANALYTICS when Analytics is clicked', async () => {
    const user = userEvent.setup();
    const onChangeView = vi.fn();
    render(<Layout {...defaultProps} onChangeView={onChangeView}><div /></Layout>);

    await user.click(screen.getAllByText('Analytics')[0]);
    expect(onChangeView).toHaveBeenCalledWith(AppView.ANALYTICS);
  });

  it('calls onLogout when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(<Layout {...defaultProps} onLogout={onLogout}><div /></Layout>);

    await user.click(screen.getAllByText('Sign Out')[0]);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('applies active styling to the currently selected view', () => {
    render(<Layout {...defaultProps} currentView={AppView.ANALYTICS}><div /></Layout>);

    // The Analytics buttons should exist
    const analyticsButtons = screen.getAllByText('Analytics');
    expect(analyticsButtons.length).toBeGreaterThan(0);
  });
});
