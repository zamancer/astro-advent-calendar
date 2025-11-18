// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Check if we're in demo mode
const isDemoMode = import.meta.env.PUBLIC_DEMO_MODE === 'true';

// Get environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client only if not in demo mode and credentials are available
export const supabase = (!isDemoMode && supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Export demo mode flag
export const DEMO_MODE = isDemoMode;

// Storage bucket name for calendar images
export const STORAGE_BUCKET = 'calendar-images';
