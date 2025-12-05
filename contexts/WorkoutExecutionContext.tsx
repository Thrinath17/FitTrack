import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Workout } from '../types';

interface WorkoutExecutionContextType {
  executingWorkout: Workout | null;
  setExecutingWorkout: (workout: Workout | null) => void;
  completedSetIds: Set<string>;
  setCompletedSetIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  lastCompletedTime: number | null;
  setLastCompletedTime: (time: number | null) => void;
  toggleSetCompletion: (setId: string) => void;
  resetExecution: () => void;
}

const WorkoutExecutionContext = createContext<WorkoutExecutionContextType | undefined>(undefined);

interface WorkoutExecutionProviderProps {
  children: ReactNode;
}

/**
 * Provider component for workout execution state
 * This reduces prop drilling by making execution state available throughout the app
 */
export const WorkoutExecutionProvider: React.FC<WorkoutExecutionProviderProps> = ({ children }) => {
  const [executingWorkout, setExecutingWorkout] = useState<Workout | null>(null);
  const [completedSetIds, setCompletedSetIds] = useState<Set<string>>(new Set());
  const [lastCompletedTime, setLastCompletedTime] = useState<number | null>(null);

  const toggleSetCompletion = useCallback((setId: string) => {
    setCompletedSetIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(setId)) {
        newSet.delete(setId);
      } else {
        newSet.add(setId);
      }
      return newSet;
    });
  }, []);

  const resetExecution = useCallback(() => {
    setExecutingWorkout(null);
    setCompletedSetIds(new Set());
    setLastCompletedTime(null);
  }, []);

  const value: WorkoutExecutionContextType = {
    executingWorkout,
    setExecutingWorkout,
    completedSetIds,
    setCompletedSetIds,
    lastCompletedTime,
    setLastCompletedTime,
    toggleSetCompletion,
    resetExecution,
  };

  return (
    <WorkoutExecutionContext.Provider value={value}>
      {children}
    </WorkoutExecutionContext.Provider>
  );
};

/**
 * Hook to access workout execution context
 * @returns WorkoutExecutionContextType
 * @throws Error if used outside of WorkoutExecutionProvider
 */
export const useWorkoutExecution = (): WorkoutExecutionContextType => {
  const context = useContext(WorkoutExecutionContext);
  if (context === undefined) {
    throw new Error('useWorkoutExecution must be used within a WorkoutExecutionProvider');
  }
  return context;
};


