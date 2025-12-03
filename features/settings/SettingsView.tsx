
import React, { useState } from 'react';
import { NotificationConfig } from '../../types';
import { Button } from '../../components/ui/Button';
import { Bell, Clock, Save, LogOut, User as UserIcon } from 'lucide-react';

interface SettingsViewProps {
  config: NotificationConfig;
  onSave: (config: NotificationConfig) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onSave, onLogout }) => {
  const [localConfig, setLocalConfig] = useState<NotificationConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalConfig({ ...localConfig, usualGymTime: e.target.value });
    setHasChanges(true);
  };

  const toggleNotifications = () => {
    setLocalConfig({ ...localConfig, enabled: !localConfig.enabled });
    setHasChanges(true);
  };

  const saveSettings = () => {
    onSave(localConfig);
    setHasChanges(false);
    // In a real app, we would request Notification permission here
    if (localConfig.enabled && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Customize your experience</p>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        
        {/* Profile Placeholder */}
         <div className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <UserIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-medium text-slate-900">My Profile</h3>
                <p className="text-sm text-slate-500">Manage account details</p>
            </div>
        </div>

        {/* Toggle Section */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-indigo-50 text-primary rounded-lg">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Push Notifications</h3>
              <p className="text-sm text-slate-500">Receive reminders before workout</p>
            </div>
          </div>
          <button 
            onClick={toggleNotifications}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              localConfig.enabled ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                localConfig.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Time Picker Section */}
        <div className={`p-6 transition-opacity duration-200 ${!localConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
           <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 bg-indigo-50 text-primary rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Usual Gym Time</h3>
              <p className="text-sm text-slate-500">When do you usually start?</p>
            </div>
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="time"
              value={localConfig.usualGymTime}
              onChange={handleTimeChange}
              className="block w-full rounded-xl border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 bg-slate-50 border"
            />
          </div>
        </div>
      </div>
        
      <div className="pt-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-4 border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
          >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
          </button>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 px-6 sm:pl-72 flex justify-end pointer-events-none">
        <div className={`pointer-events-auto transform transition-all duration-300 ${hasChanges ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
             <Button onClick={saveSettings} className="shadow-xl">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
             </Button>
        </div>
      </div>
    </div>
  );
};
