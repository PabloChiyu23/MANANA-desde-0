import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (process as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (process as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your secrets.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
