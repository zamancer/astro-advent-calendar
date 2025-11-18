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
