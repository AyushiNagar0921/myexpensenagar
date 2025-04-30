
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wahongwkmaaecbltyezo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhaG9uZ3drbWFhZWNibHR5ZXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTg0NzMsImV4cCI6MjA2MTQzNDQ3M30.i1MkjMeQYLYkdIeRXTZghYCCnVpG9GNOjqUmyi4Ao7o";

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Storage bucket has already been created via SQL migration
