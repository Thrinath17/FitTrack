
import React, { ReactNode } from 'react';
import { Calendar, BarChart2, Settings, LogOut, Dumbbell } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, onLogout }) => {
  // Updated order: Workouts first, then Calendar, Analytics, Settings
  const navItems = [
    { view: AppView.WORKOUTS, icon: Dumbbell, label: 'Workouts' },
    { view: AppView.CALENDAR, icon: Calendar, label: 'Calendar' },
    { view: AppView.ANALYTICS, icon: BarChart2, label: 'Analytics' },
    { view: AppView.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  const isWorkoutsView = currentView === AppView.WORKOUTS;

  return (
    <div className="flex flex-col h-screen bg-background text-slate-800">
      {/* Main Content Area */}
      <main 
        className={`flex-1 overflow-y-auto pb-20 sm:pb-0 sm:pl-64 relative ${isWorkoutsView ? 'scrollbar-hide' : ''}`}
      >
        <div className="max-w-3xl mx-auto w-full min-h-full">
          {children}
        </div>
      </main>

      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex flex-col w-64 bg-surface border-r border-slate-200 fixed inset-y-0 left-0 z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary tracking-tight">FitTrack Pro</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                currentView === item.view
                  ? 'bg-indigo-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-slate-200 pb-safe z-20">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                currentView === item.view ? 'text-primary' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};