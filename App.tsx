
import React, { useState, useEffect } from 'react';
import { AppView, JournalEntry, UserSettings } from './types';
import { INITIAL_SETTINGS } from './constants';
import { getTodayKey } from './utils';
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
  const [hasEntered, setHasEntered] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('one-line-entries');
    const savedSettings = localStorage.getItem('one-line-settings');

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    
    setIsLoading(false);
  }, []);

  // Persist Data
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('one-line-entries', JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('one-line-settings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const saveEntry = (entry: JournalEntry) => {
    setEntries(prev => ({
      ...prev,
      [entry.id]: entry
    }));
  };

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const renderView = () => {
    switch (currentView) {
      case 'today':
        return (
          <TodayView 
            entry={entries[getTodayKey()]} 
            onSave={saveEntry} 
            moods={settings.moods} 
          />
        );
      case 'pixels':
        return (
          <PixelsView 
            entries={entries} 
            moods={settings.moods} 
          />
        );
      case 'timeline':
        return (
          <TimelineView 
            entries={entries} 
            moods={settings.moods} 
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings} 
            entries={entries}
            onUpdate={updateSettings} 
          />
        );
      default:
        return <TodayView entry={entries[getTodayKey()]} onSave={saveEntry} moods={settings.moods} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf8]">
        <p className="text-gray-400 font-serif italic animate-pulse">Breathing in...</p>
      </div>
    );
  }

  if (!hasEntered) {
    return <CoverPage userName={settings.userName} onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-20 animate-in fade-in duration-1000">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-4xl mx-auto px-6 pt-12 md:pt-20">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
