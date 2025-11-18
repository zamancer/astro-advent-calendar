import { createClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client
 * Only created if PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are provided
 */
export const supabase =
  import.meta.env.PUBLIC_SUPABASE_URL &&
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            detectSessionInUrl: true,
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          },
        }
      )
    : null;

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseConfigured = !!supabase;
