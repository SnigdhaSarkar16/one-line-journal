
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CoverPageProps {
  onEnter: () => void;
  userName: string;
}

const CoverPage: React.FC<CoverPageProps> = ({ onEnter, userName }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#fcfbf8] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-serif text-stone-200 select-none">ol.</h1>
          <div className="h-px w-12 bg-stone-200 mx-auto"></div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-serif text-stone-800 italic">
            Welcome back, {userName}.
          </h2>
          <p className="text-stone-400 text-sm tracking-widest uppercase">
            One day. One line. No pressure.
          </p>
        </div>

        <button
          onClick={onEnter}
          className="group relative inline-flex items-center gap-3 px-8 py-4 text-stone-400 hover:text-stone-800 transition-colors duration-500"
        >
          <span className="text-xs uppercase tracking-[0.3em] font-medium">Step Inside</span>
          <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-500" />
          <div className="absolute bottom-2 left-8 right-8 h-[1px] bg-stone-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </button>
      </div>
      
      <footer className="absolute bottom-12 text-[10px] text-stone-300 uppercase tracking-[0.5em] select-none">
        Quietly Preserving Since 2024
      </footer>
    </div>
  );
};

export default CoverPage;
