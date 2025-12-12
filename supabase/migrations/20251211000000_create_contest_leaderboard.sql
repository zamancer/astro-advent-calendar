-- Migration: Create Contest Leaderboard View
-- Purpose: Calculate contest points, rankings, and leaderboard standings
-- Created: 2025-12-11

-- ============================================
-- CONTEST LEADERBOARD VIEW
-- ============================================
-- This view calculates contest points for each friend based on:
-- - Base points: 10 per window opened
-- - Speed bonuses: 5 for 1st, 3 for 2nd, 1 for 3rd place per window
-- - Streak bonus: 20 points for opening all 12 windows
-- - Tiebreakers: total reaction time, number of 1st places, earliest final window

CREATE OR REPLACE VIEW contest_leaderboard AS
WITH ranked_opens AS (
  -- Calculate ranking for each window based on seconds_after_unlock
  SELECT
    fwo.*,
    RANK() OVER (
      PARTITION BY fwo.window_number
      ORDER BY fwo.seconds_after_unlock ASC NULLS LAST
    ) as speed_rank
  FROM friend_window_opens fwo
),
friend_points AS (
  -- Calculate points for each friend
  SELECT
    f.id as friend_id,
    f.name,
    COUNT(DISTINCT ro.window_number) as windows_opened,
    -- Base points (10 per window) + speed bonuses
    COALESCE(SUM(
      10 + -- base points
      CASE
        WHEN ro.speed_rank = 1 THEN 5
        WHEN ro.speed_rank = 2 THEN 3
        WHEN ro.speed_rank = 3 THEN 1
        ELSE 0
      END
    ), 0) as base_points,
    -- Streak bonus: 20 points if all 12 unique windows opened
    CASE WHEN COUNT(DISTINCT ro.window_number) = 12 THEN 20 ELSE 0 END as streak_bonus,
    -- Tiebreaker 1: Total reaction time (lower is better)
    COALESCE(SUM(ro.seconds_after_unlock), 0) as total_reaction_time,
    -- Tiebreaker 2: Number of 1st place finishes
    COALESCE(SUM(CASE WHEN ro.speed_rank = 1 THEN 1 ELSE 0 END), 0) as first_place_count,
    -- Tiebreaker 3: When contest was completed (window 12 opened), NULL if not completed
    MAX(CASE WHEN ro.window_number = 12 THEN ro.opened_at END) as completed_at,
    -- For display: most recent window open
    MAX(ro.opened_at) as last_window_opened_at
  FROM friends f
  LEFT JOIN ranked_opens ro ON f.id = ro.friend_id
  WHERE f.is_admin = false
  GROUP BY f.id, f.name
)
SELECT
  friend_id,
  name,
  windows_opened,
  base_points,
  streak_bonus,
  (base_points + streak_bonus) as total_points,
  total_reaction_time,
  first_place_count,
  completed_at,
  last_window_opened_at,
  -- Calculate final rank with tiebreakers
  RANK() OVER (
    ORDER BY
      (base_points + streak_bonus) DESC,  -- Primary: highest points
      total_reaction_time ASC,             -- Tiebreaker 1: lowest reaction time
      first_place_count DESC,              -- Tiebreaker 2: most 1st places
      completed_at ASC NULLS LAST          -- Tiebreaker 3: earliest completion (non-finishers last)
  ) as rank
FROM friend_points
ORDER BY rank ASC;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON VIEW contest_leaderboard IS 'Contest leaderboard with points, rankings, and tiebreakers. Excludes admin users.';
