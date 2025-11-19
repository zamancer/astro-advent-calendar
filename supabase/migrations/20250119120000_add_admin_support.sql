-- Migration: Add Admin Support
-- Description: Add admin role to friends table for dashboard access
-- Created: 2025-01-19

-- ============================================
-- ADD ADMIN COLUMN TO FRIENDS TABLE
-- ============================================

-- Add is_admin column to friends table (defaults to false)
ALTER TABLE friends
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Index for faster admin lookups
CREATE INDEX idx_friends_is_admin ON friends(is_admin) WHERE is_admin = true;

-- ============================================
-- ADMIN HELPER VIEWS
-- ============================================

-- View: Friend progress with all statistics
-- This aggregates all window opens for each friend with useful metrics
CREATE OR REPLACE VIEW admin_friend_progress AS
SELECT
  f.id AS friend_id,
  f.name AS friend_name,
  f.email AS friend_email,
  f.created_at AS joined_at,
  COALESCE(ARRAY_AGG(fwo.window_number ORDER BY fwo.window_number) FILTER (WHERE fwo.window_number IS NOT NULL), ARRAY[]::INTEGER[]) AS windows_opened,
  COUNT(fwo.window_number) AS total_windows_opened,
  MAX(fwo.opened_at) AS last_opened_at,
  MIN(fwo.opened_at) AS first_opened_at
FROM friends f
LEFT JOIN friend_window_opens fwo ON f.id = fwo.friend_id
WHERE f.is_admin = false  -- Don't include admins in progress tracking
GROUP BY f.id, f.name, f.email, f.created_at;

-- View: Overall statistics for the admin dashboard
CREATE OR REPLACE VIEW admin_statistics AS
SELECT
  COUNT(DISTINCT f.id) AS total_friends,
  COUNT(DISTINCT fwo.id) AS total_window_opens,
  ROUND(AVG(friend_counts.window_count), 2) AS avg_windows_per_friend,
  MAX(friend_counts.window_count) AS max_windows_opened,
  (
    SELECT window_number
    FROM friend_window_opens
    GROUP BY window_number
    ORDER BY COUNT(*) DESC, window_number ASC
    LIMIT 1
  ) AS most_popular_window,
  (
    SELECT COUNT(DISTINCT friend_id)
    FROM friend_window_opens
    GROUP BY window_number
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ) AS most_popular_window_count
FROM friends f
LEFT JOIN friend_window_opens fwo ON f.id = fwo.friend_id
LEFT JOIN (
  SELECT friend_id, COUNT(*) AS window_count
  FROM friend_window_opens
  GROUP BY friend_id
) friend_counts ON f.id = friend_counts.friend_id
WHERE f.is_admin = false;

-- View: Window popularity (how many friends opened each window)
CREATE OR REPLACE VIEW admin_window_popularity AS
SELECT
  window_number,
  COUNT(DISTINCT friend_id) AS friends_count,
  ARRAY_AGG(DISTINCT friend_id) AS friend_ids,
  MAX(opened_at) AS last_opened_at,
  MIN(opened_at) AS first_opened_at
FROM friend_window_opens
GROUP BY window_number
ORDER BY window_number;

-- ============================================
-- ROW LEVEL SECURITY POLICIES FOR ADMIN
-- ============================================

-- Enable RLS on tables if not already enabled
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_window_opens ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all friends
CREATE POLICY "Admins can view all friends"
ON friends
FOR SELECT
USING (
  -- Allow if user is an admin
  EXISTS (
    SELECT 1 FROM friends admin_friend
    WHERE admin_friend.email = auth.jwt()->>'email'
    AND admin_friend.is_admin = true
  )
  OR
  -- Or if viewing their own record
  email = auth.jwt()->>'email'
);

-- Policy: Friends can view their own record
CREATE POLICY "Friends can view their own record"
ON friends
FOR SELECT
USING (email = auth.jwt()->>'email');

-- Policy: Admins can view all window opens
CREATE POLICY "Admins can view all window opens"
ON friend_window_opens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friends admin_friend
    WHERE admin_friend.email = auth.jwt()->>'email'
    AND admin_friend.is_admin = true
  )
);

-- Policy: Friends can view their own window opens
CREATE POLICY "Friends can view their own window opens"
ON friend_window_opens
FOR SELECT
USING (
  friend_id IN (
    SELECT id FROM friends
    WHERE email = auth.jwt()->>'email'
  )
);

-- Policy: Friends can insert their own window opens
CREATE POLICY "Friends can insert their own window opens"
ON friend_window_opens
FOR INSERT
WITH CHECK (
  friend_id IN (
    SELECT id FROM friends
    WHERE email = auth.jwt()->>'email'
  )
);

-- Policy: Only service role can insert/update/delete friends
-- (This prevents users from modifying friend records directly)
CREATE POLICY "Only service role can modify friends"
ON friends
FOR ALL
USING (false)
WITH CHECK (false);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN friends.is_admin IS 'Whether this friend has admin dashboard access';
COMMENT ON VIEW admin_friend_progress IS 'Aggregated view of all friend progress for admin dashboard';
COMMENT ON VIEW admin_statistics IS 'Overall statistics for the admin dashboard';
COMMENT ON VIEW admin_window_popularity IS 'Statistics about which windows are most popular';
