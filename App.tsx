import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AuthScreen } from './features/auth/AuthScreen';
import { CalendarView } from './features/calendar/CalendarView';
import { Dashboard } from './features/analytics/Dashboard';
import { SettingsView } from './features/settings/SettingsView';
import { WorkoutsView } from './features/workouts/WorkoutsView';
import { AppView, User, AuthProvider, AttendanceRecord, NotificationConfig, Workout } from './types';
import { StorageService } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>({ enabled: false, usualGymTime: '18:00', reminders: [] });
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Lifted Execution State
  const [executingWorkout, setExecutingWorkout] = useState<Workout | null>(null);
  const [completedSetIds, setCompletedSetIds] = useState<Set<string>>(new Set());
  const [lastCompletedTime, setLastCompletedTime] = useState<number | null>(null);

  // Initialize App Data
  useEffect(() => {
    const storedUser = StorageService.getUser();
    if (storedUser) {
      setUser(storedUser);
      setCurrentView(AppView.WORKOUTS); // Default to Workouts (Home)
      setAttendance(StorageService.getAttendance());
      setNotifConfig(StorageService.getNotificationConfig());
      setWorkouts(StorageService.getWorkouts());
    }
  }, []);

  const handleLogin = (provider: AuthProvider, email?: string) => {
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
  };

  const handleLogout = () => {
    StorageService.clearUser();
    setUser(null);
    setCurrentView(AppView.AUTH);
    setExecutingWorkout(null);
  };

  // Replaces the old simple toggle with full record update capability
  const handleUpdateRecord = (record: AttendanceRecord) => {
    StorageService.saveAttendance(record);
    setAttendance(StorageService.getAttendance());
  };

  const handleSaveSettings = (config: NotificationConfig) => {
    StorageService.saveNotificationConfig(config);
    setNotifConfig(config);
  };

  const handleSaveWorkout = (workout: Workout) => {
    const updatedWorkouts = [...workouts];
    const index = updatedWorkouts.findIndex(w => w.id === workout.id);
    if (index >= 0) {
      updatedWorkouts[index] = workout;
    } else {
      updatedWorkouts.push(workout);
    }
    StorageService.saveWorkouts(updatedWorkouts);
    setWorkouts(updatedWorkouts);
  };

  const handleDeleteWorkout = (id: string) => {
    const updatedWorkouts = workouts.filter(w => w.id !== id);
    StorageService.saveWorkouts(updatedWorkouts);
    setWorkouts(updatedWorkouts);
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
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
          executingWorkout={executingWorkout}
        />
      )}
      {currentView === AppView.WORKOUTS && (
        <WorkoutsView 
          workouts={workouts} 
          attendance={attendance}
          onSaveWorkout={handleSaveWorkout} 
          onDeleteWorkout={handleDeleteWorkout}
          onUpdateRecord={handleUpdateRecord}
          // Execution Props
          executingWorkout={executingWorkout}
          setExecutingWorkout={setExecutingWorkout}
          completedSetIds={completedSetIds}
          setCompletedSetIds={setCompletedSetIds}
          lastCompletedTime={lastCompletedTime}
          setLastCompletedTime={setLastCompletedTime}
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
  );
};

export default App;