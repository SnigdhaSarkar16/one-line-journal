
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AppView, JournalEntry, UserSettings } from './types';
import { INITIAL_SETTINGS } from './constants';
import { getTodayKey } from './utils';
import TodayView from './components/TodayView';
import PixelsView from './components/PixelsView';
import TimelineView from './components/TimelineView';
import SettingsView from './components/SettingsView';
import Navigation from './components/Navigation';
import CoverPage from './components/CoverPage';

// Replace these with your actual Supabase credentials from Settings > API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('today');
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Check current session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await Promise.all([
          fetchEntries(session.user.id),
          fetchSettings(session.user.id)
        ]);
      }
      setIsLoading(false);
    };

    initAuth();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchEntries(session.user.id);
        fetchSettings(session.user.id);
      } else {
        setEntries({});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId);
    
    if (data && !error) {
      const entryMap = data.reduce((acc, entry) => ({
        ...acc,
        [entry.date]: entry
      }), {});
      setEntries(entryMap);
    }
  };

  const fetchSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      setSettings(prev => ({
        ...prev,
        userName: data.user_name || prev.userName,
        reminderTime: data.reminder_time || prev.reminderTime,
        notificationsEnabled: data.email_notifications_enabled || prev.notificationsEnabled,
        email: data.email
      }));
    }
  };

  const saveEntry = async (entry: JournalEntry) => {
    if (!user) return;

    const { error } = await supabase
      .from('entries')
      .upsert({
        user_id: user.id,
        date: entry.date,
        journal_line: entry.journal_line,
        mood: entry.mood,
        timestamp: entry.timestamp
      });

    if (!error) {
      setEntries(prev => ({
        ...prev,
        [entry.date]: entry
      }));
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        user_name: newSettings.userName,
        reminder_time: newSettings.reminderTime,
        email_notifications_enabled: newSettings.notificationsEnabled
      })
      .eq('id', user.id);

    if (!error) {
      setSettings(newSettings);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <p className="text-gray-400 font-serif italic animate-pulse">Establishing connection...</p>
      </div>
    );
  }

  if (!user) {
    return <CoverPage />;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-20 animate-in fade-in duration-1000">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-4xl mx-auto px-6 pt-12 md:pt-20">
        <div className="flex justify-end mb-4">
          <p className="text-[10px] text-stone-300 uppercase tracking-widest">Signed in as {user.email}</p>
        </div>
        {renderView()}
      </main>
    </div>
  );

  function renderView() {
    switch (currentView) {
      case 'today':
        return <TodayView entry={entries[getTodayKey()]} onSave={saveEntry} moods={settings.moods} />;
      case 'pixels':
        return <PixelsView entries={entries} moods={settings.moods} />;
      case 'timeline':
        return <TimelineView entries={entries} moods={settings.moods} />;
      case 'settings':
        return (
          <SettingsView 
            settings={settings} 
            entries={entries}
            onUpdate={updateSettings}
            onLogout={handleLogout}
          />
        );
      default:
        return <TodayView entry={entries[getTodayKey()]} onSave={saveEntry} moods={settings.moods} />;
    }
  }
};

export default App;
