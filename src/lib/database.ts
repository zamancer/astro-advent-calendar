/**
 * Database Helper Functions
 * Functions to interact with the Supabase database for friend calendar tracking
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type {
  Friend,
  FriendInsert,
  FriendUpdate,
  FriendWindowOpen,
  FriendWindowOpenInsert,
  FriendWithProgress,
  FriendProgressSummary,
} from '../types/database';

// ============================================
// FRIENDS OPERATIONS
// ============================================

/**
 * Get all friends
 */
export async function getAllFriends(): Promise<{ data: Friend[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase.from('friends').select('*').order('created_at', { ascending: true });

  return { data, error };
}

/**
 * Get a friend by ID
 */
export async function getFriendById(id: string): Promise<{ data: Friend | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase.from('friends').select('*').eq('id', id).single();

  return { data, error };
}

/**
 * Get a friend by their unique code
 */
export async function getFriendByCode(code: string): Promise<{ data: Friend | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase.from('friends').select('*').eq('unique_code', code).single();

  return { data, error };
}

/**
 * Get a friend by email
 */
export async function getFriendByEmail(email: string): Promise<{ data: Friend | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase.from('friends').select('*').eq('email', email).single();

  return { data, error };
}

/**
 * Create a new friend
 */
export async function createFriend(friend: FriendInsert): Promise<{ data: Friend | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase.from('friends').insert(friend).select().single();

  return { data, error };
}

/**
 * Update a friend's information
 */
export async function updateFriend(
  id: string,
  updates: FriendUpdate,
): Promise<{ data: Friend | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase.from('friends').update(updates).eq('id', id).select().single();

  return { data, error };
}

/**
 * Delete a friend (and all their window opens via CASCADE)
 */
export async function deleteFriend(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured') };
  }

  const { error } = await supabase.from('friends').delete().eq('id', id);

  return { error };
}

// ============================================
// WINDOW OPENS OPERATIONS
// ============================================

/**
 * Record that a friend opened a window
 * Returns error if the window was already opened (duplicate)
 */
export async function recordWindowOpen(
  windowOpen: FriendWindowOpenInsert,
): Promise<{ data: FriendWindowOpen | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase.from('friend_window_opens').insert(windowOpen).select().single();

  return { data, error };
}

/**
 * Get all window opens for a specific friend
 */
export async function getFriendWindowOpens(
  friendId: string,
): Promise<{ data: FriendWindowOpen[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase
    .from('friend_window_opens')
    .select('*')
    .eq('friend_id', friendId)
    .order('window_number', { ascending: true });

  return { data, error };
}

/**
 * Get all friends who opened a specific window
 */
export async function getWindowOpeners(
  windowNumber: number,
): Promise<{ data: FriendWindowOpen[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase
    .from('friend_window_opens')
    .select('*, friend:friends(*)')
    .eq('window_number', windowNumber)
    .order('opened_at', { ascending: true });

  return { data, error };
}

/**
 * Check if a friend has opened a specific window
 */
export async function hasOpenedWindow(friendId: string, windowNumber: number): Promise<{ data: boolean; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: false, error: new Error('Supabase is not configured') };
  }

  const { data, error } = await supabase
    .from('friend_window_opens')
    .select('id')
    .eq('friend_id', friendId)
    .eq('window_number', windowNumber)
    .single();

  return { data: !!data, error: error?.code === 'PGRST116' ? null : error };
}

// ============================================
// COMBINED QUERIES
// ============================================

/**
 * Get a friend with their complete progress
 */
export async function getFriendWithProgress(
  friendId: string,
): Promise<{ data: FriendWithProgress | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  // Get friend
  const { data: friend, error: friendError } = await getFriendById(friendId);
  if (friendError || !friend) {
    return { data: null, error: friendError };
  }

  // Get their window opens
  const { data: windowOpens, error: opensError } = await getFriendWindowOpens(friendId);
  if (opensError) {
    return { data: null, error: opensError };
  }

  const windows_opened = windowOpens?.map((wo) => wo.window_number).sort((a, b) => a - b) || [];

  return {
    data: {
      ...friend,
      windows_opened,
      total_windows_opened: windows_opened.length,
    },
    error: null,
  };
}

/**
 * Get progress summary for all friends
 */
export async function getAllFriendsProgress(): Promise<{ data: FriendProgressSummary[] | null; error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const { data: friends, error: friendsError } = await getAllFriends();
  if (friendsError || !friends) {
    return { data: null, error: friendsError };
  }

  const progressData: FriendProgressSummary[] = [];

  for (const friend of friends) {
    const { data: windowOpens, error: opensError } = await getFriendWindowOpens(friend.id);
    if (opensError) {
      return { data: null, error: opensError };
    }

    const windows_opened = windowOpens?.map((wo) => wo.window_number).sort((a, b) => a - b) || [];
    const last_opened_at = windowOpens?.length ? windowOpens[windowOpens.length - 1].opened_at : null;

    progressData.push({
      friend_id: friend.id,
      friend_name: friend.name,
      windows_opened,
      total_windows: windows_opened.length,
      last_opened_at,
    });
  }

  return { data: progressData, error: null };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique code for a friend
 * Format: 8 random alphanumeric characters (e.g., "A7X9M2K4")
 */
export function generateUniqueCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate window number (1-24 for advent calendar)
 */
export function isValidWindowNumber(windowNumber: number, maxWindows: number = 24): boolean {
  return Number.isInteger(windowNumber) && windowNumber >= 1 && windowNumber <= maxWindows;
}
