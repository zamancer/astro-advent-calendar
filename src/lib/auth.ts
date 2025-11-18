import { supabase } from './supabase';
import { getFriendByEmail } from './database';
import type { User } from '@supabase/supabase-js';
import type { Friend } from '../types/database';

/**
 * Send a magic link to the specified email address
 * Only sends if the email is in the friends table (authorized)
 */
export async function sendMagicLink(email: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    // Check if email is authorized (exists in friends table)
    const { data: friend, error: dbError } = await getFriendByEmail(email);

    if (dbError) {
      console.error('Database error checking email:', dbError);
      return {
        success: false,
        error: 'Failed to verify email authorization',
      };
    }

    if (!friend) {
      return {
        success: false,
        error: 'This email is not authorized to access the calendar',
      };
    }

    // Send magic link using Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session
 */
export async function getSession() {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) return () => {};

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get the friend record for the current authenticated user
 */
export async function getCurrentFriend(): Promise<Friend | null> {
  const user = await getCurrentUser();
  if (!user?.email) return null;

  const { data: friend, error } = await getFriendByEmail(user.email);

  if (error) {
    console.error('Failed to get friend record:', error);
    return null;
  }

  return friend;
}
