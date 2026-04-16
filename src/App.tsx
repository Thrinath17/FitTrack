import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthScreen } from './features/auth/AuthScreen';
import { CalendarView } from './features/calendar/CalendarView';
import { Dashboard } from './features/analytics/Dashboard';
import { SettingsView } from './features/settings/SettingsView';
import { WorkoutsView } from './features/workouts/WorkoutsView';
import { AppView, User, AuthProvider, AttendanceRecord, NotificationConfig, Workout } from './types';
import { StorageService } from './services/storageService';
import { WorkoutExecutionProvider } from './contexts/WorkoutExecutionContext';
import { StorageError } from './utils/errors';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>({ enabled: false, usualGymTime: '18:00', reminders: [] });
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Execution state is now managed by WorkoutExecutionProvider context

  // Initialize App Data
  useEffect(() => {
    try {
      const storedUser = StorageService.getUser();
      if (storedUser) {
        setUser(storedUser);
        setCurrentView(AppView.WORKOUTS); // Default to Workouts (Home)
        setAttendance(StorageService.getAttendance());
        setNotifConfig(StorageService.getNotificationConfig());
        setWorkouts(StorageService.getWorkouts());
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      if (error instanceof StorageError) {
        // Could show a toast notification here
        console.warn('Storage error:', error.message);
      }
    }
  }, []);

  const handleLogin = (provider: AuthProvider, email?: string) => {
    try {
      // Mock User Creation
      const newUser: User = {
        id: 'u123',
        name: email ? email.split('@')[0] : 'Gym Enthusiast',
        email: email || 'user@example.com',
        provider,
      };
      StorageService.saveUser(newUser);
      setUser(newUser);
      setCurrentView(AppView.WORKOUTS); // Default to Workouts (Home)
      // Refresh data
      setAttendance(StorageService.getAttendance());
      setNotifConfig(StorageService.getNotificationConfig());
      setWorkouts(StorageService.getWorkouts());
    } catch (error) {
      console.error('Failed to save user:', error);
      if (error instanceof StorageError) {
        alert(`Failed to save user data: ${error.message}`);
      }
    }
  };

  const handleLogout = () => {
    try {
      StorageService.clearUser();
      setUser(null);
      setCurrentView(AppView.AUTH);
    } catch (error) {
      console.error('Failed to clear user:', error);
      // Still log out even if storage fails
      setUser(null);
      setCurrentView(AppView.AUTH);
    }
  };

  // Replaces the old simple toggle with full record update capability
  const handleUpdateRecord = (record: AttendanceRecord) => {
    try {
      StorageService.saveAttendance(record);
      setAttendance(StorageService.getAttendance());
    } catch (error) {
      console.error('Failed to save attendance:', error);
      if (error instanceof StorageError) {
        alert(`Failed to save attendance: ${error.message}`);
      }
    }
  };

  const handleSaveSettings = (config: NotificationConfig) => {
    try {
      StorageService.saveNotificationConfig(config);
      setNotifConfig(config);
    } catch (error) {
      console.error('Failed to save settings:', error);
      if (error instanceof StorageError) {
        alert(`Failed to save settings: ${error.message}`);
      }
    }
  };

  const handleSaveWorkout = (workout: Workout) => {
    try {
      const updatedWorkouts = [...workouts];
      const index = updatedWorkouts.findIndex(w => w.id === workout.id);
      if (index >= 0) {
        updatedWorkouts[index] = workout;
      } else {
        updatedWorkouts.push(workout);
      }
      StorageService.saveWorkouts(updatedWorkouts);
      setWorkouts(updatedWorkouts);
    } catch (error) {
      console.error('Failed to save workout:', error);
      if (error instanceof StorageError) {
        alert(`Failed to save workout: ${error.message}`);
      }
    }
  };

  const handleDeleteWorkout = (id: string) => {
    try {
      const updatedWorkouts = workouts.filter(w => w.id !== id);
      StorageService.saveWorkouts(updatedWorkouts);
      setWorkouts(updatedWorkouts);
    } catch (error) {
      console.error('Failed to delete workout:', error);
      if (error instanceof StorageError) {
        alert(`Failed to delete workout: ${error.message}`);
      }
    }
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <WorkoutExecutionProvider>
        <Layout 
          currentView={currentView} 
          onChangeView={setCurrentView}
          onLogout={handleLogout}
        >
      {currentView === AppView.CALENDAR && (
        <CalendarView 
          records={attendance} 
          workouts={workouts}
          onUpdateRecord={handleUpdateRecord}
        />
      )}
      {currentView === AppView.WORKOUTS && (
        <WorkoutsView 
          workouts={workouts} 
          attendance={attendance}
          onSaveWorkout={handleSaveWorkout} 
          onDeleteWorkout={handleDeleteWorkout}
          onUpdateRecord={handleUpdateRecord}
        />
      )}
      {currentView === AppView.ANALYTICS && (
        <Dashboard records={attendance} />
      )}
      {currentView === AppView.SETTINGS && (
        <SettingsView 
          config={notifConfig} 
          onSave={handleSaveSettings} 
          onLogout={handleLogout}
        />
      )}
        </Layout>
      </WorkoutExecutionProvider>
    </ErrorBoundary>
  );
};

export default App;