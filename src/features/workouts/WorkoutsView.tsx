import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Workout, AttendanceRecord } from '../../types';
import { WorkoutEditor } from './WorkoutEditor';
import { Plus, ChevronRight, Trash2, Trophy, ChevronDown, Calendar as CalendarIcon, Check, ArrowLeft, Play, Edit2, Save, CheckCircle, RotateCcw, Clock, X } from 'lucide-react';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format, isSameDay, isAfter, startOfToday, subDays } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { DEFAULT_WORKOUT_COLOR, generateLabel } from '../../utils/workoutUtils';
import { RECENT_COMPLETION_WINDOW_MS, INTRO_ANIMATION_DURATION } from '../../utils/constants';
import { useWorkoutExecution } from '../../contexts/WorkoutExecutionContext';

interface WorkoutsViewProps {
  workouts: Workout[];
  attendance: AttendanceRecord[];
  onSaveWorkout: (workout: Workout) => void;
  onDeleteWorkout: (id: string) => void;
  onUpdateRecord: (record: AttendanceRecord) => void;
}

type Tab = 'workouts' | 'schedule';
type ScheduleStep = 'date' | 'template' | 'custom';

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({ 
    workouts, 
    attendance, 
    onSaveWorkout, 
    onDeleteWorkout, 
    onUpdateRecord
}) => {
  // Use context instead of props
  const {
    executingWorkout,
    setExecutingWorkout,
    completedSetIds,
    setCompletedSetIds,
    lastCompletedTime,
    setLastCompletedTime,
    toggleSetCompletion: contextToggleSetCompletion,
  } = useWorkoutExecution();
  const [activeTab, setActiveTab] = useState<Tab>('workouts');
  
  // Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  
  // Scheduling States
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleStep, setScheduleStep] = useState<ScheduleStep>('date');
  const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Execution UI State (Modal visibility)
  const [isExecutionOpen, setIsExecutionOpen] = useState(false);
  
  // Save as Routine Modal
  const [showSaveRoutinePrompt, setShowSaveRoutinePrompt] = useState(false);
  const [workoutToSaveAsRoutine, setWorkoutToSaveAsRoutine] = useState<Workout | null>(null);

  // Inline Editing States during Execution
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // Animation State
  const [isIntro, setIsIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntro(false);
    }, INTRO_ANIMATION_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // --- Stats & Welcome Logic ---
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todaysPlannedWorkout = useMemo(() => {
      // If we are already executing a workout, we don't need to "find" the planned one to start.
      if (executingWorkout) return undefined;

      const record = attendance.find(r => r.date === todayStr);
      if (!record?.plannedWorkouts) return undefined;
      
      const performedNames = new Set(record.performedWorkouts?.map(w => w.name) || []);
      return record.plannedWorkouts.find(w => !performedNames.has(w.name));
  }, [attendance, todayStr, executingWorkout]);

  const isRecentlyCompleted = useMemo(() => {
      return !!(lastCompletedTime && Date.now() - lastCompletedTime < RECENT_COMPLETION_WINDOW_MS && !todaysPlannedWorkout);
  }, [lastCompletedTime, todaysPlannedWorkout]);

  // --- Dynamic Motivational Messaging ---
  const welcomeMsg = useMemo(() => {
      if (executingWorkout) {
            const totalExercises = executingWorkout.exercises.length;
            // If no exercises yet
            if (totalExercises === 0) {
                return { title: "Let's get started!", subtitle: "Add an exercise to begin your session." };
            }

            const totalSets = executingWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
            const completedSetsCount = completedSetIds.size;
            
            // Identify incomplete exercises
            const incompleteExercises = executingWorkout.exercises.filter(ex => {
                if (ex.sets.length === 0) return true; 
                return !ex.sets.every(s => completedSetIds.has(s.id));
            });
            const remainingExercises = incompleteExercises.length;

            let title = "Keep Pushing!";
            let subtitle = `You're in the middle of ${executingWorkout.name || 'your workout'}.`;

            if (remainingExercises === 2) {
                subtitle = "Only 2 exercises to go — you’ve got this!";
            } else if (remainingExercises === 1) {
                // Last exercise logic
                const lastEx = incompleteExercises[0];
                const lastExSets = lastEx.sets;
                const completedInLast = lastExSets.filter(s => completedSetIds.has(s.id)).length;
                const remainingInLast = lastExSets.length - completedInLast;
                
                title = "Finish Strong!";
                if (remainingInLast === 1) {
                    subtitle = "Final set — crush it!";
                } else if (remainingInLast === 2) {
                    subtitle = "Just 2 more sets to go — keep pushing!";
                } else {
                    subtitle = "Last one! Finish strong!";
                }
            } else if (remainingExercises === 0 && totalSets > 0 && completedSetsCount === totalSets) {
                title = "All Done!";
                subtitle = "Great work! Hit finish to complete.";
            } else {
                // Generic progress
                const pct = Math.round((completedSetsCount / totalSets) * 100) || 0;
                if (pct > 50) subtitle = "Over halfway there! Keep going.";
            }

            return { title, subtitle };
      }
      
      if (todaysPlannedWorkout) {
          return {
              title: "It's Go Time!",
              subtitle: `You have a ${todaysPlannedWorkout.name} planned today. Let's crush it!`
          }
      }

      if (isRecentlyCompleted) {
          return {
              title: "You killed it!",
              subtitle: "Great job finishing your workout! Keep this momentum going."
          };
      }
      
      return {
        title: "Ready to sweat?",
        subtitle: "Start a workout now or check your routine."
      };
  }, [executingWorkout, todaysPlannedWorkout, isRecentlyCompleted, completedSetIds]);


  // --- Actions ---

  const handleCreateNewRoutine = () => {
    setSelectedWorkout(null);
    setIsEditing(true);
  };

  const handleEditRoutine = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsEditing(true);
  };

  const handleSaveRoutine = (workout: Workout) => {
    onSaveWorkout(workout);
    setIsEditing(false);
    setSelectedWorkout(null);
  };

  // --- Scheduling Logic ---
  
  const startScheduleFlow = () => {
      setScheduleStep('date');
      setScheduleDate(todayStr);
      setIsScheduling(true);
  };

  const handleScheduleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      setScheduleDate(e.target.value);
  };

  const confirmScheduleDate = () => {
      setScheduleStep('template');
  };

  // --- Planned Workouts Data ---
  const upcomingPlannedWorkouts = useMemo(() => {
      const today = startOfToday();
      const flattened = [];
      
      const sortedRecords = [...attendance].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      for (const rec of sortedRecords) {
          if (rec.plannedWorkouts && rec.plannedWorkouts.length > 0) {
             const recDate = parseISO(rec.date);
             // Show all future or today's
             if (isAfter(recDate, subDays(today, 1))) { 
                 for (const w of rec.plannedWorkouts) {
                     // Filter out if this exact planned instance is already executing or done
                     const isDone = rec.performedWorkouts?.some(p => p.name === w.name); // Simple check, could be ID based
                     const isExecuting = executingWorkout && executingWorkout.name === w.name && isSameDay(recDate, new Date());
                     
                     if (!isDone && !isExecuting) {
                        flattened.push({ date: rec.date, workout: w, record: rec });
                     }
                 }
             }
          }
      }
      return flattened;
  }, [attendance, executingWorkout]);

  const saveScheduledWorkout = (workout: Workout) => {
      const record = attendance.find(r => r.date === scheduleDate);
      const currentPlanned = record?.plannedWorkouts || [];
      
      const newInstance: Workout = {
          ...workout,
          id: Date.now().toString()
      };

      const newRecord: AttendanceRecord = {
          id: record?.id || Date.now().toString(),
          date: scheduleDate,
          attended: record?.attended || false,
          timestamp: record?.timestamp || Date.now(),
          performedWorkouts: record?.performedWorkouts || [],
          plannedWorkouts: [...currentPlanned, newInstance]
      };

      onUpdateRecord(newRecord);
      setIsScheduling(false);
      setActiveTab('schedule');
  };

  const handleSelectTemplateForSchedule = (template: Workout) => {
      saveScheduledWorkout(template);
  };

  const handleCreateCustomForSchedule = () => {
      setScheduleStep('custom');
  };

  const handleSaveCustomSchedule = (workout: Workout) => {
      saveScheduledWorkout(workout);
  };

  const deletePlannedWorkout = (date: string, workoutId: string) => {
      const record = attendance.find(r => r.date === date);
      if (!record) return;
      
      const updatedPlanned = (record.plannedWorkouts || []).filter(w => w.id !== workoutId);
      onUpdateRecord({
          ...record,
          plannedWorkouts: updatedPlanned
      });
  };

  // --- Execution Logic ---

  const startAdHocWorkout = () => {
      const newWorkout: Workout = {
          id: Date.now().toString(),
          name: '', // Empty so placeholder shows
          exercises: [],
          createdAt: Date.now(),
          color: DEFAULT_WORKOUT_COLOR,
          abbreviation: 'W' // Default
      };
      setExecutingWorkout(newWorkout);
      setCompletedSetIds(new Set());
      setIsExecutionOpen(true);
      setIsIntro(false);
  };

  const startExecution = (workout: Workout) => {
      if (executingWorkout && executingWorkout.id === workout.id) {
          setIsExecutionOpen(true);
          return;
      }
      const workoutInstance = JSON.parse(JSON.stringify(workout));
      workoutInstance.id = Date.now().toString(); 
      // Ensure default color if missing or override for consistency
      workoutInstance.color = DEFAULT_WORKOUT_COLOR;

      setExecutingWorkout(workoutInstance);
      setCompletedSetIds(new Set());
      setIsExecutionOpen(true);
      setIsIntro(false);
  };

  const minimizeExecution = () => {
      setIsExecutionOpen(false);
  };

  const toggleSetCompletion = useCallback((setId: string) => {
    contextToggleSetCompletion(setId);
  }, [contextToggleSetCompletion]);

  const addExerciseToExecution = () => {
      if (!executingWorkout) return;
      const newEx = { 
          id: Date.now().toString(), 
          name: '', 
          sets: [{ id: Date.now().toString() + 's', reps: 0, weight: 0 }] 
      };
      setExecutingWorkout({ 
          ...executingWorkout, 
          exercises: [...executingWorkout.exercises, newEx] 
      });
      setEditingExerciseId(newEx.id);
  };

  const addSetToExecution = (exerciseId: string) => {
      if (!executingWorkout) return;
      
      const exercise = executingWorkout.exercises.find(e => e.id === exerciseId);
      const lastSet = exercise?.sets[exercise.sets.length - 1];
      const newSet = { 
          id: Date.now().toString(), 
          reps: 0, 
          weight: lastSet ? lastSet.weight : 0 
      };

      const updatedExercises = executingWorkout.exercises.map(ex => {
          if (ex.id === exerciseId) {
              return { ...ex, sets: [...ex.sets, newSet] };
          }
          return ex;
      });
      setExecutingWorkout({ ...executingWorkout, exercises: updatedExercises });
  };

  const updateExecutionExercise = (exerciseId: string, field: string, value: any) => {
      if (!executingWorkout) return;
      const updatedExercises = executingWorkout.exercises.map(ex => {
          if (ex.id === exerciseId) {
              return { ...ex, [field]: value };
          }
          return ex;
      });
      setExecutingWorkout({ ...executingWorkout, exercises: updatedExercises });
  };

  const updateExecutionSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
      if (!executingWorkout) return;
      const updatedExercises = executingWorkout.exercises.map(ex => {
          if (ex.id === exerciseId) {
              return { 
                  ...ex, 
                  sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
              };
          }
          return ex;
      });
      setExecutingWorkout({ ...executingWorkout, exercises: updatedExercises });
  };

  const finishExecution = () => {
      if (!executingWorkout) return;

      const record = attendance.find(r => r.date === todayStr);
      const currentPerformed = record?.performedWorkouts || [];
      
      // Ensure name is set if empty
      const finalName = executingWorkout.name || 'My Workout';
      const finalWorkout = {
          ...executingWorkout,
          name: finalName,
          abbreviation: generateLabel(finalName),
          color: DEFAULT_WORKOUT_COLOR
      };
      
      const newRecord: AttendanceRecord = {
          id: record?.id || Date.now().toString(),
          date: todayStr,
          attended: true,
          timestamp: Date.now(),
          performedWorkouts: [...currentPerformed, finalWorkout],
          plannedWorkouts: record?.plannedWorkouts || [] 
      };

      onUpdateRecord(newRecord);
      
      // Store temp for saving as routine
      setWorkoutToSaveAsRoutine(finalWorkout);
      setShowSaveRoutinePrompt(true);

      // Clean up
      setExecutingWorkout(null);
      setCompletedSetIds(new Set());
      setIsExecutionOpen(false);
      setLastCompletedTime(Date.now());
  };

  const confirmSaveAsRoutine = () => {
      if (!workoutToSaveAsRoutine) return;
      onSaveWorkout({
          ...workoutToSaveAsRoutine,
          id: Date.now().toString(),
          abbreviation: generateLabel(workoutToSaveAsRoutine.name),
          color: DEFAULT_WORKOUT_COLOR
      });
      setShowSaveRoutinePrompt(false);
      setWorkoutToSaveAsRoutine(null);
  };

  const cancelExecution = () => {
      if (window.confirm("Are you sure you want to cancel this workout? Progress will be lost.")) {
          setExecutingWorkout(null);
          setCompletedSetIds(new Set());
          setIsExecutionOpen(false);
      }
  };

  const scrollToWorkouts = () => {
    setIsIntro(false);
    const element = document.getElementById('workout-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Recent History Data
  const recentHistory = useMemo(() => {
    return [...attendance]
      .filter(r => r.performedWorkouts && r.performedWorkouts.length > 0)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5) // Last 5 days with workouts
      .flatMap(r => (r.performedWorkouts || []).map(w => ({ ...w, date: r.date })));
  }, [attendance]);

  // --- Renders ---

  if (isEditing) {
    return (
      <WorkoutEditor 
        initialWorkout={selectedWorkout}
        onSave={handleSaveRoutine}
        onCancel={() => { setIsEditing(false); setSelectedWorkout(null); }}
      />
    );
  }

  if (isScheduling && scheduleStep === 'custom') {
      return (
          <WorkoutEditor
             initialWorkout={null}
             onSave={handleSaveCustomSchedule}
             onCancel={() => setIsScheduling(false)}
          />
      );
  }

  // --- Execution View ---
  if (isExecutionOpen && executingWorkout) {
      const totalSets = executingWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
      const completedCount = completedSetIds.size;
      const remainingSets = totalSets - completedCount;
      
      return (
          <div className="min-h-full bg-background pb-24 flex flex-col fixed inset-0 z-50 overflow-hidden animate-in slide-in-from-right duration-300">
              {/* Persistent Top Banner */}
              <div className="sticky top-0 z-40 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 text-white shadow-lg pb-4 pt-safe-top px-6 rounded-b-3xl flex-shrink-0 transition-all">
                  <div className="flex justify-between items-center mb-2 pt-2">
                      <button 
                        onClick={minimizeExecution} 
                        aria-label="Minimize workout"
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      >
                          <ArrowLeft className="w-6 h-6 text-white" />
                      </button>
                      <h3 className="font-bold text-sm uppercase tracking-widest opacity-90">Workout In Progress</h3>
                      <button 
                        onClick={cancelExecution} 
                        aria-label="Cancel workout"
                        className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="flex justify-between items-end">
                      <div className="flex-1 mr-4">
                          <input 
                            value={executingWorkout.name}
                            onChange={(e) => {
                                const newName = e.target.value;
                                setExecutingWorkout({
                                    ...executingWorkout, 
                                    name: newName,
                                    abbreviation: generateLabel(newName)
                                });
                            }}
                            placeholder="Chest Day"
                            className="text-2xl font-black leading-none bg-transparent border-b border-white/20 focus:border-white outline-none w-full placeholder-white/50"
                          />
                          <p className="text-orange-100 text-sm font-medium mt-1">{welcomeMsg.subtitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                          <p className="text-3xl font-bold leading-none">{remainingSets}</p>
                          <p className="text-xs font-medium uppercase opacity-80">Sets Left</p>
                      </div>
                  </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Removed Label Selector & Color Picker - Now handled automatically */}

                  {executingWorkout.exercises.map((exercise, exIdx) => (
                      <div key={exercise.id} className="bg-surface rounded-2xl shadow-sm border border-slate-100 overflow-hidden group relative">
                          
                          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-start">
                              <div className="flex-1 mr-2">
                                  {editingExerciseId === exercise.id ? (
                                      <div className="space-y-2">
                                          <input 
                                              autoFocus
                                              className="w-full font-bold text-slate-800 bg-white border border-primary rounded px-2 py-1 outline-none"
                                              value={exercise.name}
                                              placeholder="Exercise Name"
                                              onChange={(e) => updateExecutionExercise(exercise.id, 'name', e.target.value)}
                                          />
                                          <input 
                                              className="w-full text-xs text-slate-500 bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                                              value={exercise.note || ''}
                                              placeholder="Notes..."
                                              onChange={(e) => updateExecutionExercise(exercise.id, 'note', e.target.value)}
                                          />
                                          <button 
                                              onClick={() => setEditingExerciseId(null)}
                                              className="text-xs bg-primary text-white px-2 py-1 rounded flex items-center w-fit"
                                          >
                                              <Save className="w-3 h-3 mr-1" /> Done
                                          </button>
                                      </div>
                                  ) : (
                                      <div>
                                          <h4 className="font-bold text-slate-800" onClick={() => setEditingExerciseId(exercise.id)}>{exercise.name || 'New Exercise'}</h4>
                                          {exercise.note && <span className="text-xs text-slate-500 italic truncate max-w-[150px] block">{exercise.note}</span>}
                                      </div>
                                  )}
                              </div>
                              
                              {editingExerciseId !== exercise.id && (
                                  <button 
                                      onClick={() => setEditingExerciseId(exercise.id)}
                                      aria-label={`Edit ${exercise.name || 'exercise'}`}
                                      className="text-slate-300 hover:text-primary p-1"
                                  >
                                      <Edit2 className="w-4 h-4" />
                                  </button>
                              )}
                          </div>

                          <div className="divide-y divide-slate-100">
                              {/* Header for Columns */}
                              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  <div className="col-span-2">Set</div>
                                  <div className="col-span-4 text-center">Lbs</div>
                                  <div className="col-span-4 text-center">Reps</div>
                                  <div className="col-span-2 text-right">Done</div>
                              </div>

                              {exercise.sets.map((set, setIdx) => {
                                  const isCompleted = completedSetIds.has(set.id);
                                  return (
                                      <div 
                                          key={set.id} 
                                          className={`grid grid-cols-12 gap-2 items-center p-4 transition-all ${isCompleted ? 'bg-green-50/50' : 'hover:bg-slate-50'}`}
                                      >
                                          <div className="col-span-2">
                                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                  {setIdx + 1}
                                              </div>
                                          </div>
                                          
                                          <div className="col-span-4 flex justify-center">
                                               <input
                                                  type="number"
                                                  className={`text-lg font-bold w-16 text-center bg-transparent outline-none focus:border-b focus:border-primary ${isCompleted ? 'text-slate-400' : 'text-slate-800'}`}
                                                  value={set.weight || ''}
                                                  placeholder="0"
                                                  onClick={(e) => e.stopPropagation()}
                                                  onChange={(e) => updateExecutionSet(exercise.id, set.id, 'weight', parseInt(e.target.value) || 0)}
                                              />
                                          </div>

                                          <div className="col-span-4 flex justify-center">
                                              <input
                                                  type="number"
                                                  className={`text-lg font-bold w-16 text-center bg-transparent outline-none focus:border-b focus:border-primary ${isCompleted ? 'text-slate-400 decoration-slate-400 line-through' : 'text-slate-800'}`}
                                                  value={set.reps || ''}
                                                  placeholder="0"
                                                  onClick={(e) => e.stopPropagation()}
                                                  onChange={(e) => updateExecutionSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                                              />
                                          </div>
                                          
                                          <div className="col-span-2 flex justify-end">
                                              <div 
                                                onClick={() => toggleSetCompletion(set.id)}
                                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                                                isCompleted 
                                                ? 'bg-green-500 border-green-500 scale-105 shadow-sm' 
                                                : 'border-slate-300'
                                              }`}>
                                                  {isCompleted && <Check className="w-5 h-5 text-white" />}
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                          
                          <div className="p-2 bg-slate-50/50 border-t border-slate-100">
                              <button 
                                  onClick={() => addSetToExecution(exercise.id)}
                                  className="w-full py-2 text-xs font-medium text-slate-500 hover:text-primary hover:bg-white rounded-lg border border-dashed border-slate-200 flex items-center justify-center transition-colors"
                              >
                                  <Plus className="w-3 h-3 mr-1" /> Add Set
                              </button>
                          </div>
                      </div>
                  ))}

                  <button 
                      onClick={addExerciseToExecution}
                      className="w-full py-4 flex items-center justify-center text-slate-500 font-medium bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl transition-all"
                  >
                      <Plus className="w-5 h-5 mr-2" /> Add Exercise
                  </button>
              </div>

              <div className="p-6 bg-surface border-t border-slate-100 pb-safe flex-shrink-0">
                  <button 
                      onClick={finishExecution}
                      className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center"
                  >
                      <Trophy className="w-5 h-5 mr-2" />
                      Finish Workout
                  </button>
              </div>
          </div>
      );
  }

  // --- Main View ---

  return (
    <div className="min-h-full flex flex-col pb-20 sm:pb-0 relative">
      
      {/* Save Routine Modal */}
      {showSaveRoutinePrompt && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95">
                  <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Workout Completed!</h3>
                      <p className="text-sm text-slate-500 mt-2">Would you like to save this session as a routine to use again later?</p>
                  </div>
                  <div className="flex space-x-3 pt-2">
                      <Button variant="secondary" fullWidth onClick={() => { setShowSaveRoutinePrompt(false); setWorkoutToSaveAsRoutine(null); }}>
                          No, thanks
                      </Button>
                      <Button fullWidth onClick={confirmSaveAsRoutine}>
                          Save as Routine
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* Scheduling Wizard Modal */}
      {isScheduling && scheduleStep !== 'custom' && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-900">Schedule Workout</h2>
                      <button onClick={() => setIsScheduling(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                          <ChevronDown className="w-5 h-5" />
                      </button>
                  </div>

                  {scheduleStep === 'date' && (
                      <div className="space-y-4">
                          <p className="text-slate-500">When do you plan to workout?</p>
                          <input 
                            type="date" 
                            value={scheduleDate}
                            onChange={handleScheduleDateSelect}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-semibold outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button 
                            onClick={confirmScheduleDate}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                          >
                              Next
                          </button>
                      </div>
                  )}

                  {scheduleStep === 'template' && (
                      <div className="space-y-4">
                          <p className="text-slate-500">Choose a routine or create custom:</p>
                          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                              <button 
                                  onClick={handleCreateCustomForSchedule}
                                  className="w-full p-3 border border-dashed border-primary text-primary bg-indigo-50 hover:bg-indigo-100 rounded-xl font-medium transition-colors flex items-center justify-center"
                              >
                                  <Plus className="w-4 h-4 mr-2" /> Create Custom
                              </button>
                              {workouts.map(w => (
                                  <button 
                                      key={w.id}
                                      onClick={() => handleSelectTemplateForSchedule(w)}
                                      className="w-full p-3 border border-slate-200 hover:border-primary hover:bg-slate-50 rounded-xl text-left flex items-center group transition-all"
                                  >
                                      <span 
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm"
                                        style={{ backgroundColor: w.color || '#4F46E5' }}
                                      >
                                          {w.abbreviation || w.name[0]}
                                      </span>
                                      <span className="font-medium text-slate-700 group-hover:text-primary flex-1">{w.name}</span>
                                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Hero Section */}
      <div 
        className={`relative flex flex-col items-center justify-center text-center px-6 shadow-2xl overflow-hidden shrink-0 transition-all duration-[1500ms] ease-in-out rounded-b-[3rem] z-30 pb-12 ${
            isIntro ? 'h-[100vh]' : 'h-[45vh] min-h-[320px]'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl z-0 mix-blend-overlay animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-yellow-300 opacity-20 rounded-full blur-3xl z-0 mix-blend-overlay animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className={`relative z-10 max-w-md space-y-6 transition-all duration-1000 ${isIntro ? 'scale-110' : 'scale-100 translate-y-4'}`}>
          
          {/* Enhanced Trophy for completion */}
          {isRecentlyCompleted && (
            <div className="relative mb-4 flex justify-center items-center">
                 <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse"></div>
                 <Trophy className="w-20 h-20 text-yellow-300 drop-shadow-xl relative z-10 fill-yellow-400/20" strokeWidth={1.5} />
            </div>
          )}
          
          <h1 className="text-5xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            {welcomeMsg.title}
          </h1>
          
          <p className="text-xl text-orange-50 font-medium leading-relaxed max-w-xs mx-auto">
             {welcomeMsg.subtitle}
          </p>

          {/* Go / Resume / Start Button Logic */}
          {!isIntro && (
              <div className="pt-6 animate-in zoom-in duration-500 flex justify-center w-full">
                  {executingWorkout ? (
                       <div className="flex flex-col items-center space-y-2">
                          <button 
                              onClick={() => setIsExecutionOpen(true)}
                              className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group relative ring-4 ring-white/20"
                          >
                              <Play className="w-6 h-6 fill-current ml-1 animate-pulse" />
                          </button>
                          <span className="text-white font-bold text-sm tracking-wide uppercase animate-pulse">Resume</span>
                      </div>
                  ) : todaysPlannedWorkout ? (
                      <div className="flex flex-col items-center space-y-2">
                          <button 
                              onClick={() => startExecution(todaysPlannedWorkout)}
                              className="bg-white text-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group relative"
                          >
                              <Play className="w-6 h-6 fill-current ml-1 group-hover:ml-1.5 transition-all" />
                              <div className="absolute -inset-3 border-2 border-white/30 rounded-full animate-ping"></div>
                          </button>
                          <span className="text-white font-bold text-sm tracking-wide uppercase">GO</span>
                      </div>
                  ) : isRecentlyCompleted ? (
                      <button 
                          onClick={startAdHocWorkout}
                          className="px-8 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm hover:bg-white/30 transition-all shadow-lg active:scale-95"
                      >
                          Start new workout
                      </button>
                  ) : (
                      <div className="flex flex-col items-center space-y-2">
                          <button 
                              onClick={startAdHocWorkout}
                              className="bg-white text-primary w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group relative"
                          >
                              <Plus className="w-8 h-8 group-hover:rotate-90 transition-all" />
                          </button>
                          <span className="text-white font-bold text-sm tracking-wide uppercase">Start Workout</span>
                      </div>
                  )}
              </div>
          )}
        </div>

        <div 
            onClick={scrollToWorkouts}
            className={`absolute bottom-6 sm:bottom-4 left-0 right-0 flex flex-col items-center z-10 text-white/90 hover:text-white cursor-pointer transition-all duration-1000 ${
                isIntro ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
            }`}
        >
            <span className="text-sm font-bold tracking-widest uppercase mb-2 drop-shadow-sm">Swipe up to start</span>
            <ChevronDown className="w-6 h-6 animate-bounce drop-shadow-sm" />
        </div>
      </div>

      {/* Main Content Section */}
      <div 
        id="workout-list" 
        className={`flex-1 px-6 pt-8 bg-background -mt-8 rounded-t-[2rem] relative z-20 transition-opacity duration-1000 delay-500 ${
            isIntro ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6 max-w-md mx-auto mt-6">
            <button
                onClick={() => setActiveTab('workouts')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'workouts' 
                    ? 'bg-white text-slate-900 shadow-sm scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Workouts
            </button>
            <button
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'schedule' 
                    ? 'bg-white text-primary shadow-sm scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Schedule
            </button>
        </div>

        {/* Content Area */}
        <div className="pb-24">
            
            {activeTab === 'workouts' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    
                    {/* 1. Ongoing Workout Card */}
                    {executingWorkout && (
                        <div>
                             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Happening Now</h2>
                             <div 
                                onClick={() => setIsExecutionOpen(true)}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-indigo-200 text-white cursor-pointer relative overflow-hidden group"
                             >
                                 <div className="absolute right-0 top-0 bottom-0 w-32 bg-white opacity-5 skew-x-12 transform translate-x-10"></div>
                                 <div className="relative z-10 flex justify-between items-center">
                                     <div>
                                         <div className="flex items-center space-x-2 mb-1">
                                            <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                                            <span className="text-xs font-bold uppercase tracking-wide text-indigo-100">In Progress</span>
                                         </div>
                                         <h3 className="text-xl font-bold">{executingWorkout.name || 'My Workout'}</h3>
                                         <p className="text-indigo-100 text-sm mt-1">{completedSetIds.size} / {executingWorkout.exercises.reduce((acc,ex)=>acc+ex.sets.length,0)} Sets Completed</p>
                                     </div>
                                     <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                         <ChevronRight className="w-6 h-6 text-white" />
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* 2. Routines Section */}
                    <div>
                        <div className="flex items-center justify-between px-1 mb-3">
                            <h2 className="text-lg font-bold text-slate-800">Routines</h2>
                            <button 
                                onClick={handleCreateNewRoutine}
                                className="text-xs font-bold text-primary bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center shadow-sm border border-indigo-100"
                            >
                                <Plus className="w-3 h-3 mr-1" /> New
                            </button>
                        </div>

                        {workouts.length === 0 ? (
                            <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                <p className="text-slate-500 font-medium text-sm">No saved routines yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {workouts.map(workout => (
                                    <div 
                                        key={workout.id} 
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all group relative overflow-hidden flex items-center"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: workout.color || '#4F46E5' }} />
                                        
                                        <div 
                                            onClick={() => startExecution(workout)}
                                            className="flex-1 flex items-center cursor-pointer"
                                        >
                                            <span 
                                                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm mr-3"
                                                style={{ backgroundColor: workout.color || '#4F46E5' }}
                                            >
                                                {workout.abbreviation || workout.name[0]}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{workout.name}</h3>
                                                <p className="text-xs text-slate-500 mt-0.5">{workout.exercises.length} Exercises</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center border-l border-slate-100 pl-3 ml-2 space-x-1">
                                             <button 
                                                onClick={() => handleEditRoutine(workout)}
                                                aria-label={`Edit ${workout.name}`}
                                                className="p-2 text-slate-300 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors"
                                             >
                                                <Edit2 className="w-4 h-4" />
                                             </button>
                                             <button 
                                                onClick={() => onDeleteWorkout(workout.id)}
                                                aria-label={`Delete ${workout.name}`}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                             >
                                                <Trash2 className="w-4 h-4" />
                                             </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Past Workouts (Recent Activity) */}
                    <div>
                         <h2 className="text-lg font-bold text-slate-800 mb-3 px-1">Recent Activity</h2>
                         {recentHistory.length === 0 ? (
                             <div className="text-sm text-slate-400 italic px-1">No completed workouts yet.</div>
                         ) : (
                             <div className="space-y-3">
                                 {recentHistory.map((w, idx) => (
                                     <div key={`${w.id}-${idx}`} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                                         <div className="flex items-center space-x-3">
                                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                 {format(parseISO(w.date || ''), 'd')}
                                             </div>
                                             <div>
                                                 <h4 className="font-semibold text-slate-700">{w.name}</h4>
                                                 <p className="text-xs text-slate-400">{format(parseISO(w.date || ''), 'MMM yyyy')}</p>
                                             </div>
                                         </div>
                                         <CheckCircle className="w-5 h-5 text-green-500" />
                                     </div>
                                 ))}
                             </div>
                         )}
                    </div>

                </div>
            )}

            {activeTab === 'schedule' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold text-slate-800">Upcoming Schedule</h2>
                        <button 
                            onClick={startScheduleFlow}
                            className="text-xs font-bold text-primary bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center shadow-sm border border-indigo-100"
                        >
                            <Plus className="w-3 h-3 mr-1" /> Schedule
                        </button>
                    </div>

                    {upcomingPlannedWorkouts.length === 0 ? (
                        <div 
                            onClick={startScheduleFlow}
                            className="py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 text-primary group-hover:scale-110 transition-transform">
                                <CalendarIcon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-700">Nothing Scheduled</h3>
                            <p className="text-xs text-slate-500 mt-1">Tap to plan your next session</p>
                        </div>
                    ) : (
                        upcomingPlannedWorkouts.map((item, idx) => {
                            const isTodayItem = isSameDay(parseISO(item.date), new Date());
                            
                            return (
                                <div key={`${item.date}-${item.workout.id}-${idx}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative transition-all">
                                    <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center ${isTodayItem ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500'}`}>
                                        <span>{format(parseISO(item.date), 'EEEE, MMM d')}</span>
                                        {isTodayItem && <span>TODAY</span>}
                                    </div>
                                    <div className="p-4 flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div 
                                                className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5"
                                                style={{ borderColor: item.workout.color || '#4F46E5', color: item.workout.color || '#4F46E5' }}
                                            >
                                                {item.workout.abbreviation || item.workout.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{item.workout.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {item.workout.exercises.length} Exercises • {item.workout.exercises.reduce((acc,ex)=>acc+ex.sets.length,0)} Sets
                                                </p>
                                                
                                                {isTodayItem && (
                                                    <button 
                                                        onClick={() => startExecution(item.workout)}
                                                        className="mt-3 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                                                    >
                                                        <Play className="w-3 h-3 mr-1 fill-current" /> 
                                                        Start Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => deletePlannedWorkout(item.date, item.workout.id)}
                                            aria-label={`Delete scheduled ${item.workout.name}`}
                                            className="text-slate-300 hover:text-red-500 p-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};