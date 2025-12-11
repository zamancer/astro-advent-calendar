-- Migration: Add seconds_after_unlock column
-- Purpose: Enable timezone-normalized ranking for window opens
--
-- This column stores how many seconds after their local midnight unlock time
-- a user opened the window. This allows fair comparison across timezones:
-- - Netherlands user opens at 00:05 local → 300 seconds
-- - Mexico user opens at 00:05 local → 300 seconds
-- Both are now comparable even though UTC times differ.

-- Add the seconds_after_unlock column
ALTER TABLE friend_window_opens
ADD COLUMN seconds_after_unlock INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN friend_window_opens.seconds_after_unlock IS
  'Seconds elapsed since window unlocked (local midnight) when opened. Used for timezone-normalized ranking.';

-- Create index for efficient ranking queries
CREATE INDEX idx_friend_window_opens_seconds_after_unlock
ON friend_window_opens (window_number, seconds_after_unlock)
WHERE seconds_after_unlock IS NOT NULL;
