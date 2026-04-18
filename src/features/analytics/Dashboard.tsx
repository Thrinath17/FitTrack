import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AttendanceRecord } from '@/types';
import { format, subDays, startOfWeek, eachDayOfInterval, endOfWeek, isSameDay } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardProps {
  records: AttendanceRecord[];
}

export function getLocalInsight(records: AttendanceRecord[]): { message: string; trend: 'up' | 'down' | 'neutral' } {
  const attended = records.filter(r => r.attended);

  if (attended.length === 0) {
    return {
      message: "Start logging your workouts to unlock personalized insights.",
      trend: 'neutral',
    };
  }

  const today = new Date();

  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    if (records.some(r => r.date === d && r.attended)) {
      streak++;
    } else {
      break;
    }
  }

  const last30 = Array.from({ length: 30 }).map((_, i) => {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    return records.some(r => r.date === d && r.attended);
  });

  const consistencyRate = Math.round((last30.filter(Boolean).length / 30) * 100);
  const last7 = last30.slice(0, 7).filter(Boolean).length;
  const prev7 = last30.slice(7, 14).filter(Boolean).length;
  const trend: 'up' | 'down' | 'neutral' = last7 > prev7 ? 'up' : last7 < prev7 ? 'down' : 'neutral';

  if (streak >= 7) {
    return {
      message: `${streak}-day streak — elite consistency. Keep this going and it becomes identity, not effort.`,
      trend: 'up',
    };
  }

  if (streak >= 3) {
    return {
      message: `${streak} days in a row. You're building real momentum — don't break the chain.`,
      trend: 'up',
    };
  }

  if (consistencyRate >= 70) {
    return {
      message: `${consistencyRate}% consistency this month. You're showing up more than most people ever will.`,
      trend: 'up',
    };
  }

  if (trend === 'up') {
    return {
      message: `${last7} sessions this week vs ${prev7} last week. You're trending upward — keep the pressure on.`,
      trend: 'up',
    };
  }

  if (trend === 'down' && last7 < 3) {
    return {
      message: `Only ${last7} sessions this week. A tough week is temporary — getting back in tomorrow changes everything.`,
      trend: 'down',
    };
  }

  return {
    message: `${attended.length} sessions logged. Every rep is compounding. Stay consistent and the results follow.`,
    trend: 'neutral',
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  const insight = useMemo(() => getLocalInsight(records), [records]);

  const totalSessions = records.filter(r => r.attended).length;

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), i);
    return records.some(r => isSameDay(new Date(r.date), d) && r.attended);
  }).filter(Boolean).length;

  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end });

  const chartData = weekDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const didAttend = records.some(r => r.date === dateStr && r.attended);
    return {
      day: format(day, 'EEE'),
      attended: didAttend ? 1 : 0,
      fullDate: dateStr,
    };
  });

  const TrendIcon = insight.trend === 'up' ? TrendingUp : insight.trend === 'down' ? TrendingDown : Minus;
  const trendColor = insight.trend === 'up' ? 'text-emerald-300' : insight.trend === 'down' ? 'text-red-300' : 'text-indigo-200';

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500">Your progress at a glance</p>
      </div>

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

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <TrendIcon className={`w-5 h-5 ${trendColor}`} />
            <h3 className="text-lg font-bold">Coach Insight</h3>
          </div>
          <p className="text-lg font-medium leading-relaxed text-white">
            "{insight.message}"
          </p>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};
