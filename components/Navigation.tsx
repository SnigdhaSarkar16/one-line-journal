
import React from 'react';
import { AppView } from '../types';
import { 
  CalendarDays, 
  Grid3X3, 
  History, 
  Settings, 
  PenLine 
} from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems: { view: AppView; label: string; icon: React.ReactNode }[] = [
    { view: 'today', label: 'Today', icon: <PenLine size={22} /> },
    { view: 'pixels', label: 'Pixels', icon: <Grid3X3 size={22} /> },
    { view: 'timeline', label: 'Timeline', icon: <History size={22} /> },
    { view: 'settings', label: 'Settings', icon: <Settings size={22} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:w-20 md:h-full bg-white md:bg-transparent border-t md:border-t-0 md:border-r border-stone-100 flex md:flex-col justify-around md:justify-center items-center py-4 md:gap-12 z-50">
      <div className="hidden md:block absolute top-10 font-serif text-xl text-stone-400 font-light select-none">
        ol.
      </div>
      
      {navItems.map((item) => (
        <button
          key={item.view}
          onClick={() => onViewChange(item.view)}
          className={`flex flex-col items-center gap-1 transition-colors duration-300 ${
            currentView === item.view ? 'text-stone-800' : 'text-stone-300 hover:text-stone-500'
          }`}
          title={item.label}
        >
          {item.icon}
          <span className="text-[10px] md:hidden font-medium uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
