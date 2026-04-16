
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple'
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  provider: AuthProvider;
}

export interface ExerciseSet {
  id: string;
  reps: number;
  weight?: number;
}

export interface Exercise {
  id: string;
  name: string;
  note?: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  name: string;
  note?: string;
  exercises: Exercise[];
  createdAt: number;
  color?: string; // Hex code or predefined color key
  abbreviation?: string; // 1-2 letters
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  attended: boolean;
  notes?: string;
  timestamp: number;
  performedWorkouts?: Workout[]; // Snapshots of workouts done on this day
  plannedWorkouts?: Workout[]; // Workouts scheduled for this day
}

export interface NotificationConfig {
  enabled: boolean;
  usualGymTime: string; // HH:mm format (24h)
  reminders: Reminder[];
}

export interface Reminder {
  id: string;
  minutesBefore: number;
  message: string;
}

export enum AppView {
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  CALENDAR = 'CALENDAR',
  WORKOUTS = 'WORKOUTS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}

export interface DailyStat {
  date: string;
  attended: boolean;
}
