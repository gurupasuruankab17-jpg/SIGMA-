
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cmctnyqbparwrobmxvwq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY3RueXFicGFyd3JvYm14dndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDEwNTIsImV4cCI6MjA5NDA3NzA1Mn0.hnX5hH4PSXopuM39LLSZyf0sX5RPaYSF_j9r-JZaKmM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetch.bind(window),
  },
});


