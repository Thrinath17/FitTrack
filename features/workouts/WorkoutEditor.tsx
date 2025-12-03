import React, { useState } from 'react';
import { Workout, Exercise } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface WorkoutEditorProps {
  initialWorkout?: Workout | null;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

// Fixed Default Color for all Workouts
const DEFAULT_WORKOUT_COLOR = '#F97316'; // Orangish-red

const generateLabel = (name: string): string => {
    if (!name || !name.trim()) return 'W';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
};

export const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ initialWorkout, onSave, onCancel }) => {
  const [name, setName] = useState(initialWorkout?.name || '');
  const [note, setNote] = useState(initialWorkout?.note || '');
  const [exercises, setExercises] = useState<Exercise[]>(initialWorkout?.exercises || []);

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [{ id: Date.now().toString() + 's', reps: 0, weight: 0 }]
    };
    setExercises([...exercises, newExercise]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        // Inherit weight from previous set if available
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { id: Date.now().toString(), reps: 0, weight: lastSet ? lastSet.weight : 0 }]
        };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId)
        };
      }
      return ex;
    }));
  };

  const handleSave = () => {
    if (!name.trim()) return; // Validation
    
    // Auto-generate abbreviation
    const finalAbbr = generateLabel(name);

    const workout: Workout = {
      id: initialWorkout?.id || Date.now().toString(),
      name,
      note,
      exercises,
      createdAt: initialWorkout?.createdAt || Date.now(),
      color: DEFAULT_WORKOUT_COLOR,
      abbreviation: finalAbbr,
    };
    onSave(workout);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {initialWorkout ? 'Edit Routine' : 'New Routine'}
        </h1>
        <div className="space-x-2">
            <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2">Cancel</button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Routine Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chest Day"
            className="w-full text-lg font-semibold border-b border-slate-200 focus:border-primary focus:outline-none py-2 bg-transparent placeholder-slate-300"
            autoFocus={!initialWorkout}
          />
        </div>

        {/* Removed Color Picker & Label Selector - Handled Automatically */}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Focus on upper chest, superset with shoulders"
            className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-semibold text-slate-800">Exercises</h2>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div key={exercise.id} className="bg-surface rounded-2xl p-5 shadow-sm border border-slate-100 relative group">
            <div className="absolute top-4 right-4">
                <button 
                    onClick={() => handleRemoveExercise(exercise.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Exercise Header */}
            <div className="space-y-3 mb-4 pr-8">
              <input 
                type="text"
                value={exercise.name}
                onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                placeholder={`Exercise ${index + 1}`}
                className="block w-full font-medium text-slate-900 placeholder-slate-400 border-b border-transparent hover:border-slate-200 focus:border-primary focus:outline-none py-1 bg-transparent transition-colors"
              />
              <input 
                type="text"
                value={exercise.note || ''}
                onChange={(e) => updateExercise(exercise.id, 'note', e.target.value)}
                placeholder="Notes (e.g. Slow negatives)"
                className="block w-full text-xs text-slate-500 placeholder-slate-300 border-b border-transparent hover:border-slate-200 focus:border-primary focus:outline-none py-1 bg-transparent transition-colors"
              />
            </div>

            {/* Sets Header */}
            <div className="grid grid-cols-12 gap-2 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-3">Set</div>
                <div className="col-span-4">Lbs</div>
                <div className="col-span-4">Reps</div>
                <div className="col-span-1"></div>
            </div>

            {/* Sets */}
            <div className="space-y-2 bg-slate-50 rounded-xl p-3">
              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className="grid grid-cols-12 gap-2 items-center text-sm">
                  <span className="col-span-3 text-slate-400 text-xs font-medium uppercase">Set {setIndex + 1}</span>
                  
                  <div className="col-span-4">
                      <input 
                        type="number"
                        min="0"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full text-center rounded-md border border-slate-200 py-1 px-1 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                  </div>
                  
                  <div className="col-span-4">
                    <input 
                      type="number"
                      min="0"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full text-center rounded-md border border-slate-200 py-1 px-1 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <button 
                        onClick={() => removeSet(exercise.id, set.id)}
                        className="text-slate-300 hover:text-red-400"
                    >
                        &times;
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => handleAddSet(exercise.id)}
                className="w-full py-2 flex items-center justify-center text-xs font-medium text-primary hover:bg-indigo-50 rounded-lg transition-colors border border-dashed border-indigo-200 mt-2"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Set
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddExercise}
          className="w-full py-4 flex items-center justify-center text-slate-500 font-medium bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Exercise
        </button>
      </div>

      {/* Floating Save Button on Mobile, Static on Desktop */}
      <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 px-6 sm:pl-72 flex justify-end pointer-events-none">
         <div className="pointer-events-auto shadow-xl rounded-xl">
            <Button onClick={handleSave} disabled={!name.trim()}>
                Save Routine
            </Button>
         </div>
      </div>
    </div>
  );
};