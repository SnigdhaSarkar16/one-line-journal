
import React, { useState, useMemo } from 'react';
import { JournalEntry, Mood, MoodId } from '../types';
import { MONTH_NAMES } from '../constants';
import { formatDateDisplay } from '../utils';
import { Filter, ChevronDown } from 'lucide-react';

interface TimelineViewProps {
  entries: Record<string, JournalEntry>;
  moods: Mood[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ entries, moods }) => {
  const [moodFilter, setMoodFilter] = useState<MoodId | 'all'>('all');
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');

  const sortedEntries = useMemo(() => {
    // Fix: Explicitly cast to JournalEntry[] to avoid 'unknown' type errors during sorting
    return (Object.values(entries) as JournalEntry[]).sort((a, b) => b.timestamp - a.timestamp);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return sortedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const matchesMood = moodFilter === 'all' || entry.mood === moodFilter;
      const matchesMonth = monthFilter === 'all' || entryDate.getMonth() === monthFilter;
      return matchesMood && matchesMonth;
    });
  }, [sortedEntries, moodFilter, monthFilter]);

  return (
    <div className="animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-serif text-stone-800 mb-2">Timeline</h1>
          <p className="text-stone-400 text-sm">A steady stream of moments.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <select 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="appearance-none bg-white border border-stone-100 rounded-lg px-4 py-2 pr-10 text-xs font-medium text-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-shadow shadow-sm"
            >
              <option value="all">All Months</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value as MoodId | 'all')}
              className="appearance-none bg-white border border-stone-100 rounded-lg px-4 py-2 pr-10 text-xs font-medium text-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-shadow shadow-sm"
            >
              <option value="all">All Moods</option>
              {moods.map(mood => (
                <option key={mood.id} value={mood.id}>{mood.emoji} {mood.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" />
          </div>
        </div>
      </header>

      {filteredEntries.length > 0 ? (
        <div className="space-y-8 pb-12">
          {filteredEntries.map((entry, idx) => {
            const mood = moods.find(m => m.id === entry.mood);
            return (
              <div key={entry.id} className="relative pl-12 group">
                {/* Timeline Line */}
                {idx !== filteredEntries.length - 1 && (
                  <div className="absolute left-[23px] top-10 bottom-[-32px] w-[1px] bg-stone-100 group-last:hidden" />
                )}
                
                {/* Mood Dot */}
                <div 
                  className="absolute left-4 top-2 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-1 ring-stone-100" 
                  style={{ backgroundColor: mood?.color }} 
                />

                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm group-hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      {formatDateDisplay(entry.date)}
                    </p>
                    <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                      {mood?.emoji}
                    </span>
                  </div>
                  <p className="text-xl font-serif text-stone-800 leading-relaxed italic">
                    {entry.journal_line}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
          <p className="text-stone-400 italic">No entries found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
