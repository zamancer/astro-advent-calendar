import { createClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client
 * Only created if not in demo mode
 */
export const supabase =
  import.meta.env.PUBLIC_SUPABASE_URL &&
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};
