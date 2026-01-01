
import React from 'react';
import { UserSettings, Mood, JournalEntry } from '../types';
import { Download, Bell, Palette, User, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  entries: Record<string, JournalEntry>;
  onUpdate: (settings: UserSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, entries, onUpdate }) => {
  const exportData = () => {
    // Fix: Explicitly cast to JournalEntry[] to avoid 'unknown' type errors
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
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearData = () => {
    if (confirm('Are you sure you want to delete all your journal entries? This cannot be undone.')) {
      localStorage.removeItem('one-line-entries');
      window.location.reload();
    }
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
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <label className="block text-sm text-stone-500 mb-2">Display Name</label>
            <input 
              type="text" 
              value={settings.userName}
              onChange={(e) => onUpdate({ ...settings, userName: e.target.value })}
              className="w-full bg-stone-50 border-stone-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-all text-stone-800"
            />
          </div>
        </section>

        {/* Reminders */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} className="text-stone-400" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-500">Reminders</h2>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-stone-800 font-medium">Daily Nudge</p>
              <p className="text-stone-400 text-xs mt-1">Gently remind me to write my line.</p>
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
        </section>

        {/* Export / Danger Zone */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Download size={18} className="text-stone-400" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-500">Data & Privacy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={exportData}
              className="flex items-center justify-between p-6 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-left">
                <p className="text-stone-800 font-medium">Export CSV</p>
                <p className="text-stone-400 text-xs mt-1">Take your memories home.</p>
              </div>
              <Download size={20} className="text-stone-300 group-hover:text-stone-800 transition-colors" />
            </button>

            <button 
              onClick={clearData}
              className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-left">
                <p className="text-red-800 font-medium">Erase Everything</p>
                <p className="text-red-400 text-xs mt-1">A clean slate.</p>
              </div>
              <Trash2 size={20} className="text-red-200 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </section>

        <footer className="pt-12 pb-8 text-center">
          <p className="text-[10px] text-stone-300 uppercase tracking-[0.4em]">One Line v1.0 • No Pressure</p>
        </footer>
      </div>
    </div>
  );
};

export default SettingsView;
