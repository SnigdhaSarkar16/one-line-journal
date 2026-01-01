
import { Mood, UserSettings } from './types';

export const DEFAULT_MOODS: Mood[] = [
  { id: 'great', label: 'Radiant', color: '#F6AD55', emoji: '✨' },
  { id: 'good', label: 'Content', color: '#68D391', emoji: '🌿' },
  { id: 'neutral', label: 'Ordinary', color: '#63B3ED', emoji: '☁️' },
  { id: 'low', label: 'Tired', color: '#B794F4', emoji: '🌙' },
  { id: 'bad', label: 'Heavy', color: '#FC8181', emoji: '🌧️' },
];

export const INITIAL_SETTINGS: UserSettings = {
  reminderTime: '21:00',
  notificationsEnabled: false,
  moods: DEFAULT_MOODS,
  userName: 'Journaler',
};

export const MAX_CHARS = 150;

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
