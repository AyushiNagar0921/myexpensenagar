
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

// Initialize storage bucket for avatars if it doesn't exist yet
const initializeStorage = async () => {
  try {
    // Check if avatars bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      console.log('Creating avatars storage bucket');
      // This would normally be done via SQL migrations, but we're doing it here for simplicity
      // In a production app, use SQL migrations instead
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

initializeStorage();
