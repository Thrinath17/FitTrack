import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsView } from './SettingsView';
import { NotificationConfig } from '@/types';

const defaultConfig: NotificationConfig = {
  enabled: false,
  usualGymTime: '18:00',
  reminders: [],
};

const enabledConfig: NotificationConfig = {
  enabled: true,
  usualGymTime: '09:00',
  reminders: [],
};

describe('SettingsView', () => {
  it('renders the Settings heading', () => {
    render(<SettingsView config={defaultConfig} onSave={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders the Push Notifications toggle', () => {
    render(<SettingsView config={defaultConfig} onSave={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
  });

  it('renders the Usual Gym Time time input', () => {
    render(<SettingsView config={defaultConfig} onSave={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByDisplayValue('18:00')).toBeInTheDocument();
  });

  it('renders the Sign Out button', () => {
    render(<SettingsView config={defaultConfig} onSave={vi.fn()} onLogout={vi.fn()} />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls onLogout when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(<SettingsView config={defaultConfig} onSave={vi.fn()} onLogout={onLogout} />);
    await user.click(screen.getByText('Sign Out'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('save button is hidden by default when no changes made', () => {
    render(<SettingsView config={defaultConfig} onSave={vi.fn()} onLogout={vi.fn()} />);
    // Save button exists in DOM but is invisible (opacity-0 + translate-y-10)
    const saveButton = screen.getByText('Save Changes').closest('div');
    expect(saveButton?.className).toContain('opacity-0');
  });

  it('save button becomes visible after toggling notifications', async () => {
    const user = userEvent.setup();
    render(<SettingsView config={defaultConfig} onSave={vi.fn()} onLogout={vi.fn()} />);

    // Click the toggle button (the rounded toggle element)
    const toggleButton = screen.getByRole('button', { name: '' });
    await user.click(toggleButton);

    const saveContainer = screen.getByText('Save Changes').closest('div');
    expect(saveContainer?.className).toContain('opacity-100');
  });

  it('calls onSave with updated config when Save Changes is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SettingsView config={defaultConfig} onSave={onSave} onLogout={vi.fn()} />);

    // Toggle notifications to enable hasChanges
    const toggleButton = screen.getByRole('button', { name: '' });
    await user.click(toggleButton);

    await user.click(screen.getByText('Save Changes'));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ enabled: true }));
  });

  it('hides save button again after saving', async () => {
    const user = userEvent.setup();
    render(<SettingsView config={defaultConfig} onSave={vi.fn()} onLogout={vi.fn()} />);

    const toggleButton = screen.getByRole('button', { name: '' });
    await user.click(toggleButton);
    await user.click(screen.getByText('Save Changes'));

    const saveContainer = screen.getByText('Save Changes').closest('div');
    expect(saveContainer?.className).toContain('opacity-0');
  });

  it('time input change marks settings as changed', async () => {
    const user = userEvent.setup();
    render(<SettingsView config={enabledConfig} onSave={vi.fn()} onLogout={vi.fn()} />);

    const timeInput = screen.getByDisplayValue('09:00');
    await user.clear(timeInput);
    await user.type(timeInput, '07:30');

    const saveContainer = screen.getByText('Save Changes').closest('div');
    expect(saveContainer?.className).toContain('opacity-100');
  });

  it('calls onSave with updated gym time when saved', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SettingsView config={enabledConfig} onSave={onSave} onLogout={vi.fn()} />);

    const timeInput = screen.getByDisplayValue('09:00');
    await user.clear(timeInput);
    await user.type(timeInput, '07:30');
    await user.click(screen.getByText('Save Changes'));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ usualGymTime: '07:30' }));
  });
});
