
import React, { useState, useEffect } from 'react';
import { AppView, JournalEntry, UserSettings } from './types';
import { INITIAL_SETTINGS } from './constants';
import { getTodayKey } from './utils';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import TodayView from './components/TodayView';
import PixelsView from './components/PixelsView';
import TimelineView from './components/TimelineView';
import SettingsView from './components/SettingsView';
import Navigation from './components/Navigation';
import CoverPage from './components/CoverPage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('today');
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8] p-10 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-serif text-stone-800">Setup Required</h1>
          <p className="text-stone-500 text-sm">
            Please add your <code className="bg-stone-100 px-1">VITE_SUPABASE_URL</code> and <code className="bg-stone-100 px-1">VITE_SUPABASE_ANON_KEY</code> to your environment variables.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!supabase) return;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await Promise.all([
          fetchEntries(currentUser.id),
          fetchSettings(currentUser.id)
        ]);
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchEntries(currentUser.id);
        fetchSettings(currentUser.id);
      } else {
        setEntries({});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEntries = async (userId: string) => {
    if (!supabase) return;
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
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (data && !error) {
      setSettings(prev => ({
        ...prev,
        userName: data.user_name || prev.userName,
        reminderTime: data.reminder_time || prev.reminderTime,
        notificationsEnabled: data.email_notifications_enabled || prev.notificationsEnabled,
        email: data.email || prev.email,
        timezone: data.timezone || currentTimezone
      }));

      // If the DB has no timezone OR it's just the default 'UTC', 
      // update it to the user's actual detected timezone.
      if (!data.timezone || data.timezone === 'UTC') {
        await supabase
          .from('profiles')
          .update({ timezone: currentTimezone })
          .eq('id', userId);
        
        setSettings(prev => ({ ...prev, timezone: currentTimezone }));
      }
    }
  };

  const saveEntry = async (entry: JournalEntry) => {
    if (!user || !supabase) return;

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
    if (!user || !supabase) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        user_name: newSettings.userName,
        reminder_time: newSettings.reminderTime,
        email_notifications_enabled: newSettings.notificationsEnabled,
        timezone: newSettings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      .eq('id', user.id);

    if (!error) {
      setSettings(newSettings);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <p className="text-stone-300 font-serif italic animate-pulse tracking-widest text-sm">One moment...</p>
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
          <p className="text-[10px] text-stone-300 uppercase tracking-[0.2em] font-medium">
            Session: {user.email}
          </p>
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
