import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AttendanceRecord } from '../../types';
import { format, subDays, startOfWeek, eachDayOfInterval, endOfWeek, isSameDay } from 'date-fns';
import { generateCoachInsight } from '../../services/geminiService';
import { Sparkles } from 'lucide-react';

interface DashboardProps {
  records: AttendanceRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Calculate basic stats
  const totalSessions = records.filter(r => r.attended).length;
  
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), i);
    return records.some(r => isSameDay(new Date(r.date), d) && r.attended);
  }).filter(Boolean).length;

  // Prepare Chart Data (This week)
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  const chartData = weekDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const didAttend = records.some(r => r.date === dateStr && r.attended);
    return {
      day: format(day, 'EEE'), // Mon, Tue
      attended: didAttend ? 1 : 0,
      fullDate: dateStr
    };
  });

  const handleGetAdvice = async () => {
    setIsLoadingAi(true);
    const tip = await generateCoachInsight(records);
    setAiTip(tip);
    setIsLoadingAi(false);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500">Your progress at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Last 7 Days</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{last7Days}</p>
        </div>
        <div className="bg-surface p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Total Sessions</p>
          <p className="mt-2 text-3xl font-bold text-primary">{totalSessions}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Weekly Frequency</h3>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 12 }} 
                dy={10}
              />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="attended" radius={[6, 6, 6, 6]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.attended ? '#4F46E5' : '#E2E8F0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Coach Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h3 className="text-lg font-bold">AI Performance Coach</h3>
            </div>
            
            {!aiTip ? (
                <div className="space-y-4">
                    <p className="text-indigo-100 text-sm leading-relaxed">
                        Get personalized insights based on your attendance patterns using Gemini AI.
                    </p>
                    <button 
                        onClick={handleGetAdvice}
                        disabled={isLoadingAi}
                        className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-sm font-medium transition-colors border border-white/20 flex items-center"
                    >
                        {isLoadingAi ? 'Analyzing...' : 'Analyze My Consistency'}
                    </button>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-lg font-medium leading-relaxed mb-4">
                        "{aiTip}"
                    </p>
                    <button 
                        onClick={() => setAiTip(null)}
                        className="text-xs text-indigo-200 hover:text-white uppercase tracking-wide font-semibold"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};