
export type MoodId = 'great' | 'good' | 'neutral' | 'low' | 'bad' | string;

export interface Mood {
  id: MoodId;
  label: string;
  color: string;
  emoji: string;
}

export interface JournalEntry {
  id: string; // ISO Date String YYYY-MM-DD
  date: string;
  journal_line: string;
  mood: MoodId;
  timestamp: number;
}

export interface UserSettings {
  reminderTime: string; // HH:mm
  notificationsEnabled: boolean;
  moods: Mood[];
  userName: string;
}

export type AppView = 'today' | 'pixels' | 'timeline' | 'settings';
