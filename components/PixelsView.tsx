
import React, { useState } from 'react';
import { JournalEntry, Mood } from '../types';
import { MONTH_NAMES } from '../constants';
import { getDaysInMonth, formatDateDisplay } from '../utils';

interface PixelsViewProps {
  entries: Record<string, JournalEntry>;
  moods: Mood[];
}

const PixelsView: React.FC<PixelsViewProps> = ({ entries, moods }) => {
  const year = new Date().getFullYear();
  const [hoveredEntry, setHoveredEntry] = useState<{ date: string; entry?: JournalEntry } | null>(null);

  const getEntryColor = (dateKey: string) => {
    const entry = entries[dateKey];
    if (!entry) return '#f4f1ea'; // Empty color
    const mood = moods.find(m => m.id === entry.mood);
    return mood?.color || '#cbd5e0';
  };

  return (
    <div className="animate-in fade-in duration-1000">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-serif text-stone-800 mb-2">{year} in Pixels</h1>
        <p className="text-stone-400 text-sm italic">Every day has a color.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* The Grid */}
        <div className="flex-1 w-full overflow-x-auto pb-4">
          <div className="min-w-[700px]">
            {/* Days Header */}
            <div className="flex mb-2">
              <div className="w-10"></div>
              {Array.from({ length: 31 }).map((_, i) => (
                <div key={i} className="flex-1 text-[9px] text-stone-300 font-medium text-center">
                  {i + 1}
                </div>
              ))}
            </div>

            {MONTH_NAMES.map((month, mIdx) => (
              <div key={month} className="flex mb-1 group">
                <div className="w-10 text-[10px] text-stone-400 font-medium flex items-center">
                  {month.slice(0, 3)}
                </div>
                <div className="flex-1 flex gap-1">
                  {Array.from({ length: 31 }).map((_, dIdx) => {
                    const day = dIdx + 1;
                    const daysInThisMonth = getDaysInMonth(mIdx, year);
                    const isValidDay = day <= daysInThisMonth;
                    const dateKey = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const entry = entries[dateKey];
                    
                    if (!isValidDay) {
                      return <div key={dIdx} className="flex-1 aspect-square bg-transparent"></div>;
                    }

                    return (
                      <div
                        key={dIdx}
                        className="flex-1 aspect-square rounded-[2px] cursor-pointer transition-transform hover:scale-125 z-0 hover:z-10 relative shadow-sm"
                        style={{ backgroundColor: getEntryColor(dateKey) }}
                        onMouseEnter={() => setHoveredEntry({ date: dateKey, entry })}
                        onMouseLeave={() => setHoveredEntry(null)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend & Details Overlay */}
        <div className="w-full md:w-64 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm min-h-[160px] flex flex-col justify-center">
            {hoveredEntry ? (
              <div className="animate-in fade-in duration-300">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">{formatDateDisplay(hoveredEntry.date)}</p>
                {hoveredEntry.entry ? (
                  <>
                    <p className="text-sm font-serif text-stone-800 leading-relaxed italic">
                      "{hoveredEntry.entry.journal_line}"
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs">{moods.find(m => m.id === hoveredEntry.entry?.mood)?.emoji}</span>
                      <span className="text-xs text-stone-500 font-medium">{moods.find(m => m.id === hoveredEntry.entry?.mood)?.label}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-stone-300 italic">No entry for this day.</p>
                )}
              </div>
            ) : (
              <p className="text-stone-300 text-xs italic text-center">Hover over a pixel to remember.</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold px-1">Legend</h3>
            <div className="grid grid-cols-2 gap-3">
              {moods.map(mood => (
                <div key={mood.id} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mood.color }}></div>
                  <span className="text-xs text-stone-600">{mood.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelsView;
