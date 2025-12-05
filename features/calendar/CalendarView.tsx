import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { AttendanceRecord, Workout } from '../../types';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Plus, Trash2, Dumbbell, X, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useWorkoutExecution } from '../../contexts/WorkoutExecutionContext';

interface CalendarViewProps {
  records: AttendanceRecord[];
  workouts: Workout[];
  onUpdateRecord: (record: AttendanceRecord) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ records, workouts, onUpdateRecord }) => {
  const { executingWorkout } = useWorkoutExecution();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getRecord = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return records.find(r => r.date === dateStr);
  };

  // Calculate stats for current month view
  const monthStats = useMemo(() => {
    const monthRecords = records.filter(r => 
      isSameMonth(new Date(r.date), currentDate) && r.attended
    );
    return monthRecords.length;
  }, [records, currentDate]);

  const handleDateClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
  };

  const closeModal = () => {
    setSelectedDateStr(null);
    setShowAddWorkout(false);
    setViewingWorkout(null);
  };

  // --- Data Logic for Selected Date ---
  const selectedRecord = selectedDateStr ? records.find(r => r.date === selectedDateStr) : null;
  
  const toggleAttendance = () => {
    if (!selectedDateStr) return;
    const newRecord: AttendanceRecord = {
      ...selectedRecord,
      id: selectedRecord?.id || Date.now().toString(),
      date: selectedDateStr,
      attended: !selectedRecord?.attended,
      timestamp: Date.now(),
      performedWorkouts: selectedRecord?.performedWorkouts || [],
      plannedWorkouts: selectedRecord?.plannedWorkouts || []
    };
    onUpdateRecord(newRecord);
  };

  const addWorkoutToDay = (workoutTemplate: Workout) => {
    if (!selectedDateStr) return;
    
    const currentWorkouts = selectedRecord?.performedWorkouts || [];
    // Create a snapshot of the workout
    const workoutSnapshot: Workout = {
        ...workoutTemplate,
        id: Date.now().toString() // New ID for this specific instance
    };

    const newRecord: AttendanceRecord = {
      ...selectedRecord,
      id: selectedRecord?.id || Date.now().toString(),
      date: selectedDateStr,
      attended: true, // Auto-mark as attended if adding a workout
      timestamp: Date.now(),
      performedWorkouts: [...currentWorkouts, workoutSnapshot],
      plannedWorkouts: selectedRecord?.plannedWorkouts || []
    };
    onUpdateRecord(newRecord);
    setShowAddWorkout(false);
  };

  const removeWorkoutFromDay = (workoutInstanceId: string, type: 'performed' | 'planned') => {
    if (!selectedDateStr || !selectedRecord) return;
    
    let newRecord = { ...selectedRecord, timestamp: Date.now() };

    if (type === 'performed') {
        newRecord.performedWorkouts = (selectedRecord.performedWorkouts || []).filter(w => w.id !== workoutInstanceId);
    } else {
        newRecord.plannedWorkouts = (selectedRecord.plannedWorkouts || []).filter(w => w.id !== workoutInstanceId);
    }
    
    onUpdateRecord(newRecord);
  };


  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 relative">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="text-sm text-slate-500">Log your gym sessions</p>
        </div>
        <div className="text-right">
             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month</p>
             <p className="text-2xl font-bold text-primary">{monthStats} <span className="text-sm font-normal text-slate-400">Sessions</span></p>
        </div>
      </header>

      <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <button 
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button 
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-600 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 mb-4 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {/* Fill empty days at start */}
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const record = getRecord(day);
              const isCurrentDay = isToday(day);
              const isInProgress = isCurrentDay && executingWorkout !== null;
              
              let buttonClass = "h-12 sm:h-16 rounded-xl flex flex-col items-center justify-start pt-2 transition-all relative border border-transparent ";
              
              if (record?.attended) {
                buttonClass += "bg-green-50 text-slate-700 border-green-200 hover:bg-green-100";
              } else if (record && !record.attended && !record.plannedWorkouts?.length) {
                // Missed (only if recorded but not attended and no plans)
                buttonClass += "bg-red-50 text-red-400 border-red-100 hover:bg-red-100";
              } else {
                // Neutral / Planned
                buttonClass += "bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700";
              }

              if (isCurrentDay) {
                buttonClass += " ring-2 ring-primary ring-offset-2";
              }

              // Priority Logic:
              // 1. In Progress (Green Ring)
              // 2. Planned (Dotted Ring)
              // 3. Completed (Filled Circle)
              
              const performed = record?.performedWorkouts || [];
              const performedNames = new Set(performed.map(w => w.name));
              
              // Filter planned workouts that are NOT performed
              const visiblePlanned = (record?.plannedWorkouts || []).filter(w => !performedNames.has(w.name));
              const activePlanned = visiblePlanned.length > 0 ? visiblePlanned[0] : null;

              const lastPerformed = performed.length > 0 ? performed[performed.length - 1] : null;

              // Determine visual state based on priority
              let iconElement = null;

              if (isInProgress && executingWorkout) {
                  // State 1: In Progress -> Green Solid Ring
                  iconElement = (
                    <span 
                        className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold bg-white border-2 border-solid animate-pulse"
                        style={{ borderColor: '#22c55e', color: '#22c55e' }}
                    >
                        {executingWorkout.abbreviation || executingWorkout.name[0]}
                    </span>
                  );
              } else if (activePlanned) {
                  // State 2: Scheduled/Planned -> Dotted Ring
                  iconElement = (
                    <span 
                        className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold bg-white border-2 border-dotted"
                        style={{ borderColor: activePlanned.color || '#4F46E5', color: activePlanned.color || '#4F46E5' }}
                    >
                        {activePlanned.abbreviation || activePlanned.name[0]}
                    </span>
                  );
              } else if (lastPerformed) {
                  // State 3: Completed -> Filled Circle
                  iconElement = (
                    <span 
                        className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-sm"
                        style={{ backgroundColor: lastPerformed.color || '#4F46E5' }}
                    >
                        {lastPerformed.abbreviation || lastPerformed.name[0]}
                    </span>
                  );
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(dateStr)}
                  className={buttonClass}
                >
                  <span className="text-xs font-medium z-10 mb-1">{format(day, 'd')}</span>
                  
                  <div className="flex flex-wrap justify-center gap-1 max-w-full px-1">
                     {iconElement}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start space-x-3">
        <div className="bg-white p-2 rounded-full shadow-sm text-primary mt-1">
           <CheckCircle className="w-5 h-5" />
        </div>
        <div>
            <h3 className="font-medium text-indigo-900">Track your journey</h3>
            <p className="text-sm text-indigo-700 mt-1">Tap on a date to view completed workouts. Green days indicate attendance.</p>
        </div>
      </div>

      {/* Date Detail Modal */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          <div className="bg-surface w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 flex flex-col max-h-[85vh] sm:max-h-[800px] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
               <div className="flex items-center space-x-3">
                  {viewingWorkout ? (
                    <button onClick={() => setViewingWorkout(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 -ml-2">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="p-2 bg-indigo-50 text-primary rounded-lg">
                        <h2 className="text-xl font-bold">{format(new Date(selectedDateStr), 'EEE, MMM d')}</h2>
                    </div>
                  )}
                  {viewingWorkout && <h2 className="text-xl font-bold text-slate-900">Workout Details</h2>}
               </div>
               <button 
                 onClick={closeModal}
                 aria-label="Close modal"
                 className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
               >
                 <X className="w-6 h-6" />
               </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {viewingWorkout ? (
                    // --- READ ONLY WORKOUT DETAILS VIEW ---
                    <div className="animate-in slide-in-from-right duration-300 space-y-6">
                        <div className="flex items-start space-x-4">
                            <span 
                                className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-md"
                                style={{ backgroundColor: viewingWorkout.color || '#4F46E5' }}
                            >
                                {viewingWorkout.abbreviation || viewingWorkout.name[0]}
                            </span>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 leading-tight">{viewingWorkout.name}</h3>
                                <div className="flex items-center mt-1 text-slate-500 text-sm">
                                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                    Completed
                                </div>
                            </div>
                        </div>
                        
                        {viewingWorkout.note && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-slate-600 italic text-sm">"{viewingWorkout.note}"</p>
                            </div>
                        )}

                        <div>
                            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-4">Exercises</h4>
                            <div className="space-y-4">
                                {viewingWorkout.exercises.map((ex, i) => (
                                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                        <div className="mb-3">
                                            <h5 className="font-bold text-slate-800 text-lg">{ex.name}</h5>
                                            {ex.note && <p className="text-sm text-slate-500">{ex.note}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            {ex.sets.map((set, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-lg">
                                                    <div className="flex items-center">
                                                        <span className="font-bold text-slate-400 w-8 text-xs">#{idx + 1}</span>
                                                        <span className="font-bold text-slate-800 text-lg">{set.reps}</span>
                                                        <span className="text-slate-500 text-xs ml-1 font-medium uppercase">reps</span>
                                                    </div>
                                                    {set.weight && (
                                                        <div className="font-medium text-slate-700">
                                                            {set.weight} <span className="text-slate-400 text-xs ml-0.5">lbs</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- STANDARD DAY VIEW ---
                    <>
                        {/* 1. Attendance Toggle */}
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${selectedRecord?.attended ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Gym Attendance</h3>
                                    <p className="text-sm text-slate-500">{selectedRecord?.attended ? 'Marked as attended' : 'Did you go to the gym?'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleAttendance}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                selectedRecord?.attended ? 'bg-green-500' : 'bg-slate-300'
                                }`}
                            >
                                <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    selectedRecord?.attended ? 'translate-x-5' : 'translate-x-0'
                                }`}
                                />
                            </button>
                        </div>

                        {/* 2. Planned Workouts Section */}
                        {selectedRecord?.plannedWorkouts && selectedRecord.plannedWorkouts.length > 0 && (
                            <div className="border-b border-slate-100 pb-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />
                                    Planned for today
                                </h3>
                                <div className="space-y-3">
                                    {selectedRecord.plannedWorkouts.map((w) => {
                                        // Check if this specific plan is completed
                                        const isDone = selectedRecord.performedWorkouts?.some(p => p.name === w.name);
                                        
                                        return (
                                        <div key={w.id} className={`bg-white p-4 rounded-xl border border-dashed border-slate-300 shadow-sm relative group transition-all ${isDone ? 'opacity-60 grayscale' : 'opacity-80 hover:opacity-100'}`}>
                                            <div className="absolute top-4 right-4">
                                                <button 
                                                    onClick={() => removeWorkoutFromDay(w.id, 'planned')}
                                                    aria-label={`Remove planned ${w.name}`}
                                                    className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <span 
                                                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border-2"
                                                    style={{ borderColor: w.color || '#4F46E5', color: w.color || '#4F46E5' }}
                                                >
                                                    {w.abbreviation || w.name[0]}
                                                </span>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{w.name} <span className="text-xs font-normal text-slate-400 ml-2">(Planned)</span></h4>
                                                    <div className="mt-1 space-y-1">
                                                        <p className="text-xs text-slate-500">{w.exercises.length} exercises planned</p>
                                                    </div>
                                                    
                                                    {isDone ? (
                                                        <div className="mt-3 flex items-center text-green-600 text-xs font-bold">
                                                            <CheckCircle className="w-4 h-4 mr-1.5" /> Completed
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => addWorkoutToDay(w)}
                                                            className="mt-3 text-xs font-medium text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                                                        >
                                                            Start Workout Now
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 3. Performed Workouts List */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Performed Workouts</h3>
                                {!showAddWorkout && (
                                    <button 
                                        onClick={() => setShowAddWorkout(true)}
                                        className="text-sm font-medium text-primary hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add Log
                                    </button>
                                )}
                            </div>

                            {showAddWorkout && (
                                <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Select a workout routine:</h4>
                                    {workouts.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No routines found. Create one in the Workouts tab first.</p>
                                    ) : (
                                        <div className="grid gap-2 max-h-48 overflow-y-auto">
                                            {workouts.map(w => (
                                                <button
                                                    key={w.id}
                                                    onClick={() => addWorkoutToDay(w)}
                                                    className="flex items-center w-full p-3 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl transition-colors text-left group"
                                                >
                                                    <span 
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm"
                                                        style={{ backgroundColor: w.color || '#4F46E5' }}
                                                    >
                                                        {w.abbreviation || w.name[0]}
                                                    </span>
                                                    <span className="font-medium text-slate-700 group-hover:text-primary flex-1">{w.name}</span>
                                                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <button onClick={() => setShowAddWorkout(false)} className="mt-3 text-xs text-slate-500 hover:text-slate-800 underline">Cancel</button>
                                </div>
                            )}

                            <div className="space-y-3">
                                {selectedRecord?.performedWorkouts && selectedRecord.performedWorkouts.length > 0 ? (
                                    selectedRecord.performedWorkouts.map((w) => (
                                        <div 
                                            key={w.id} 
                                            onClick={() => setViewingWorkout(w)}
                                            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all"
                                        >
                                            <div className="absolute top-4 right-4">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); removeWorkoutFromDay(w.id, 'performed'); }}
                                                    aria-label={`Remove ${w.name} from this day`}
                                                    className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-start space-x-3 pr-8">
                                                <span 
                                                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm mt-1"
                                                    style={{ backgroundColor: w.color || '#4F46E5' }}
                                                >
                                                    {w.abbreviation || w.name[0]}
                                                </span>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{w.name}</h4>
                                                    {w.note && <p className="text-xs text-slate-500 mt-1 italic">"{w.note}"</p>}
                                                    <div className="mt-3 space-y-1">
                                                        {w.exercises.map((ex, idx) => (
                                                            <div key={idx} className="text-sm text-slate-600">
                                                                <span className="font-medium text-slate-700">{ex.name}</span>
                                                                <span className="text-slate-400 mx-1">•</span>
                                                                <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{ex.sets.length} sets</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-primary font-medium mt-3 flex items-center">
                                                        Tap to view details <ChevronRight className="w-3 h-3 ml-1" />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    !showAddWorkout && (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">No workouts logged for this day.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                )}

            </div>
            
            {/* Modal Footer - Only show Close if not in detail view, or show nothing if detail view (has back) */}
            {!viewingWorkout && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};