
import React, { useState } from 'react';
import { UserSettings, JournalEntry } from '../types';
import { Download, Mail, User, LogOut, Globe, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SettingsViewProps {
  settings: UserSettings;
  entries: Record<string, JournalEntry>;
  onUpdate: (settings: UserSettings) => void;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, entries, onUpdate, onLogout }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ message: string; isError: boolean } | null>(null);

  const triggerTestEmail = async () => {
    if (!supabase) return;
    setIsTesting(true);
    setTestResult(null);
    
    try {
      /**
       * Note: This invokes the Edge Function named 'send-reminders'.
       * If you get a 'Failed to send' error, please ensure:
       * 1. The Edge Function is deployed to Supabase.
       * 2. The function name in Supabase is exactly 'send-reminders'.
       */
      const { data, error } = await supabase.functions.invoke('send-reminders', {
        body: { isTest: true }
      });

      if (error) {
        // Handle case where function returns a 404 or other error
        if (error.message?.includes('404')) {
          throw new Error("Function 'send-reminders' not found. Please ensure it is deployed in your Supabase project.");
        }
        throw error;
      }
      
      setTestResult({ message: "Test trigger sent! Check your inbox (and spam folder).", isError: false });
    } catch (err: any) {
      console.error("Reminder Test Error:", err);
      setTestResult({ 
        message: err.message || "Failed to reach the Edge Function. Is it deployed?", 
        isError: true 
      });
    } finally {
      setIsTesting(false);
      // Keep error visible longer, clear success quickly
      if (testResult && !testResult.isError) {
        setTimeout(() => setTestResult(null), 6000);
      }
    }
  };

  const exportData = () => {
    const sortedEntries = (Object.values(entries) as JournalEntry[]).sort((a, b) => a.date.localeCompare(b.date));
    const csvContent = [
      ['Date', 'Mood', 'Entry', 'Color'],
      ...sortedEntries.map((e: JournalEntry) => [
        e.date, 
        settings.moods.find(m => m.id === e.mood)?.label || e.mood, 
        `"${e.journal_line.replace(/"/g, '""')}"`,
        settings.moods.find(m => m.id === e.mood)?.color || ''
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `one-line-journal-${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-2xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-serif text-stone-800 mb-2">Space for You</h1>
        <p className="text-stone-400 text-sm">Quiet settings for a quiet mind.</p>
      </header>

      <div className="space-y-12">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <User size={18} className="text-stone-400" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-500">Identity</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Display Name</label>
              <input 
                type="text" 
                value={settings.userName}
                onChange={(e) => onUpdate({ ...settings, userName: e.target.value })}
                className="w-full bg-stone-50 border-stone-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-all text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Email Address</label>
              <div className="w-full bg-stone-50 border-stone-100 rounded-xl px-4 py-3 text-stone-400 text-sm">
                {settings.email || 'Not connected'}
              </div>
            </div>
          </div>
        </section>

        {/* Reminders */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={18} className="text-stone-400" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-500">Email Reminders</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-800 font-medium">Daily Nudge</p>
                <p className="text-stone-400 text-xs mt-1">Receive an email at your local time.</p>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="time" 
                  value={settings.reminderTime}
                  onChange={(e) => onUpdate({ ...settings, reminderTime: e.target.value })}
                  className="bg-stone-50 border-stone-100 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none"
                />
                <button 
                  onClick={() => onUpdate({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                    settings.notificationsEnabled ? 'bg-stone-800' : 'bg-stone-200'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                    settings.notificationsEnabled ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-stone-50">
              <Globe size={14} className="text-stone-300" />
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                Timezone: <span className="text-stone-600 font-bold">{settings.timezone || 'Detecting...'}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={triggerTestEmail}
                disabled={isTesting || !settings.notificationsEnabled}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-800 transition-colors disabled:opacity-20"
              >
                <Send size={14} className={isTesting ? "animate-pulse" : ""} />
                {isTesting ? "Testing Connection..." : "Send Test Reminder Now"}
              </button>
              
              {testResult && (
                <div className={`flex items-start gap-2 p-3 rounded-xl text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-1 ${
                  testResult.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                }`}>
                  {testResult.isError && <AlertCircle size={14} className="mt-0.5 shrink-0" />}
                  <p>{testResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Download size={18} className="text-stone-400" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-500">Account</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={exportData}
              className="flex items-center justify-between p-6 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-left">
                <p className="text-stone-800 font-medium">Export Journal</p>
                <p className="text-stone-400 text-xs mt-1">Download CSV format.</p>
              </div>
              <Download size={20} className="text-stone-300 group-hover:text-stone-800 transition-colors" />
            </button>

            <button 
              onClick={onLogout}
              className="flex items-center justify-between p-6 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-left">
                <p className="text-stone-800 font-medium">Sign Out</p>
                <p className="text-stone-400 text-xs mt-1">End this session.</p>
              </div>
              <LogOut size={20} className="text-stone-300 group-hover:text-stone-800 transition-colors" />
            </button>
          </div>
        </section>

        <footer className="pt-12 pb-8 text-center">
          <p className="text-[10px] text-stone-300 uppercase tracking-[0.4em]">One Line Cloud Sync • v2.0</p>
        </footer>
      </div>
    </div>
  );
};

export default SettingsView;
