
import React, { useState, useEffect } from 'react';
import { Mood, JournalEntry } from '../types';
import { formatDateDisplay } from '../utils';
import { MAX_CHARS } from '../constants';
import { Check } from 'lucide-react';

interface TodayViewProps {
  dateKey: string;
  entry?: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  moods: Mood[];
}

const TodayView: React.FC<TodayViewProps> = ({ dateKey, entry, onSave, moods }) => {
  const [text, setText] = useState(entry?.journal_line || '');
  const [selectedMood, setSelectedMood] = useState<string | null>(entry?.mood || null);
  const [isSaved, setIsSaved] = useState(false);

  // Deep reset whenever the entry OR the dateKey changes
  useEffect(() => {
    setText(entry?.journal_line || '');
    setSelectedMood(entry?.mood || null);
    setIsSaved(false);
  }, [entry, dateKey]);

  const handleSave = () => {
    if (!selectedMood) return;

    onSave({
      id: dateKey,
      date: dateKey,
      journal_line: text,
      mood: selectedMood,
      timestamp: Date.now(),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <p className="text-stone-400 uppercase tracking-widest text-xs mb-2">Today</p>
        <h1 className="text-3xl md:text-4xl font-serif text-stone-800">{formatDateDisplay(dateKey)}</h1>
      </header>

      <section className="space-y-12">
        <div>
          <label className="block text-sm text-stone-500 mb-6 font-medium">How are you feeling?</label>
          <div className="flex flex-wrap gap-4 md:gap-8 justify-between md:justify-start">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className="flex flex-col items-center gap-3 group"
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ring-offset-4 ring-2 ${
                    selectedMood === mood.id 
                      ? 'ring-stone-400 scale-110 shadow-lg' 
                      : 'ring-transparent hover:ring-stone-200'
                  }`}
                  style={{ backgroundColor: mood.color + '22' }}
                >
                  <span className={`${selectedMood === mood.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                    {mood.emoji}
                  </span>
                </div>
                <span className={`text-xs tracking-wide transition-colors ${
                  selectedMood === mood.id ? 'text-stone-800 font-semibold' : 'text-stone-400'
                }`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm text-stone-500 mb-6 font-medium">Just one line.</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="What defined this day?"
            className="w-full bg-transparent border-b border-stone-200 py-4 text-xl md:text-2xl font-serif text-stone-800 focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-200"
          />
          <div className="absolute right-0 -bottom-8 text-[10px] text-stone-300 tracking-widest uppercase">
            {text.length} / {MAX_CHARS}
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={handleSave}
            disabled={!selectedMood || !text.trim()}
            className={`px-10 py-4 rounded-full font-medium tracking-widest uppercase text-xs transition-all duration-500 flex items-center gap-2 ${
              isSaved 
                ? 'bg-green-500 text-white' 
                : 'bg-stone-800 text-stone-50 hover:bg-stone-700 disabled:opacity-20 disabled:cursor-not-allowed'
            }`}
          >
            {isSaved ? (
              <>
                <Check size={14} />
                Saved
              </>
            ) : 'Preserve'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default TodayView;
