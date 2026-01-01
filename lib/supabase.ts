import { createClient } from '@supabase/supabase-js';

// Accessing environment variables via Vite's import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validates the Supabase configuration.
 * Prevents the app from crashing if keys are "undefined" strings or missing.
 */
export const isSupabaseConfigured = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined') return false;
  
  try {
    const url = new URL(SUPABASE_URL);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Initialize client only if we have a valid configuration.
// Otherwise, we export null to be handled gracefully in App.tsx.
export const supabase = isSupabaseConfigured() 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!isSupabaseConfigured()) {
  console.warn("One Line: Supabase is not configured yet. Check your environment variables.");
}