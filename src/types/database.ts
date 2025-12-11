/**
 * Database Types
 * TypeScript types that match the Supabase database schema
 */

// ============================================
// TABLE TYPES
// ============================================

/**
 * Friend record from the database
 */
export interface Friend {
  id: string;
  name: string;
  email: string;
  unique_code: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Friend window open record from the database
 */
export interface FriendWindowOpen {
  id: string;
  friend_id: string;
  window_number: number;
  opened_at: string;
  /** Seconds elapsed since the window unlocked (local midnight) when opened */
  seconds_after_unlock: number | null;
}

// ============================================
// INSERT TYPES (for creating new records)
// ============================================

/**
 * Data required to create a new friend
 */
export interface FriendInsert {
  name: string;
  email: string;
  unique_code: string;
}

/**
 * Data required to record a window open
 */
export interface FriendWindowOpenInsert {
  friend_id: string;
  window_number: number;
  /** Seconds elapsed since the window unlocked (local midnight) when opened */
  seconds_after_unlock?: number;
}

// ============================================
// UPDATE TYPES (for updating records)
// ============================================

/**
 * Data that can be updated on a friend record
 */
export interface FriendUpdate {
  name?: string;
  email?: string;
}

// ============================================
// QUERY RESULT TYPES
// ============================================

/**
 * Friend with their window open progress
 */
export interface FriendWithProgress extends Friend {
  windows_opened: number[];
  total_windows_opened: number;
}

/**
 * Window open event with friend information
 */
export interface WindowOpenWithFriend extends FriendWindowOpen {
  friend: Friend;
}

/**
 * Summary statistics for a friend's progress
 */
export interface FriendProgressSummary {
  friend_id: string;
  friend_name: string;
  windows_opened: number[];
  total_windows: number;
  last_opened_at: string | null;
}

// ============================================
// ADMIN DASHBOARD TYPES
// ============================================

/**
 * Admin view of friend progress (from admin_friend_progress view)
 */
export interface AdminFriendProgress {
  friend_id: string;
  friend_name: string;
  friend_email: string;
  joined_at: string;
  windows_opened: number[];
  total_windows_opened: number;
  last_opened_at: string | null;
  first_opened_at: string | null;
}

/**
 * Overall statistics for admin dashboard (from admin_statistics view)
 */
export interface AdminStatistics {
  total_friends: number;
  total_window_opens: number;
  avg_windows_per_friend: number;
  max_windows_opened: number;
  most_popular_window: number | null;
  most_popular_window_count: number | null;
}

/**
 * Window popularity statistics (from admin_window_popularity view)
 */
export interface AdminWindowPopularity {
  window_number: number;
  friends_count: number;
  friend_ids: string[];
  last_opened_at: string | null;
  first_opened_at: string | null;
}

// ============================================
// CONTEST LEADERBOARD TYPES
// ============================================

/**
 * Contest leaderboard entry (from contest_leaderboard view)
 */
export interface ContestLeaderboardEntry {
  friend_id: string;
  name: string;
  email: string;
  windows_opened: number;
  base_points: number;
  streak_bonus: number;
  total_points: number;
  total_reaction_time: number;
  first_place_count: number;
  last_window_opened_at: string | null;
  rank: number;
}

// ============================================
// DATABASE RESPONSE TYPES
// ============================================

/**
 * Generic database response wrapper
 */
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Database error type
 */
export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}
