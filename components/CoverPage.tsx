
import React from 'react';
import { LogIn } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Re-using the client logic - usually you'd export a single instance from a 'supabase.ts' file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CoverPage: React.FC = () => {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#fcfbf8] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-serif text-stone-200 select-none">ol.</h1>
          <div className="h-px w-12 bg-stone-200 mx-auto"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-serif text-stone-800 italic">
            Space for your thoughts.
          </h2>
          <p className="text-stone-400 text-sm tracking-widest uppercase">
            One day. One line. No pressure.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-50 transition-all shadow-sm hover:shadow-md"
          >
            <LogIn size={18} />
            <span className="text-xs uppercase tracking-widest font-medium">Continue with Google</span>
          </button>
          
          <p className="text-[10px] text-stone-300 max-w-[200px] leading-relaxed">
            Signing in allows us to sync your journal across devices and send daily email nudges.
          </p>
        </div>
      </div>
      
      <footer className="absolute bottom-12 text-[10px] text-stone-300 uppercase tracking-[0.5em] select-none text-center">
        Quietly Preserving Since 2024<br/>
        <span className="mt-2 block opacity-50 tracking-widest">A Private Experience</span>
      </footer>
    </div>
  );
};

export default CoverPage;
