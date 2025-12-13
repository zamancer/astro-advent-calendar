-- ============================================================
-- Test Data for Leaderboard Testing
-- ============================================================
-- This file creates 5 test participants with different playing
-- patterns to test the contest leaderboard scoring system.
--
-- IMPORTANT: Run this AFTER running the migrations.
-- This will add test data alongside any existing data.
--
-- To clean up test data afterwards, run:
--   DELETE FROM friends WHERE email LIKE '%@test-leaderboard.local';
-- ============================================================

-- ============================================================
-- STEP 1: Enable Real-time (run this once if not already done)
-- ============================================================
-- Uncomment and run this if real-time isn't enabled:
-- ALTER PUBLICATION supabase_realtime ADD TABLE friend_window_opens;

-- ============================================================
-- STEP 2: Insert Test Friends
-- ============================================================
-- Using a test email domain for easy cleanup

INSERT INTO friends (id, name, email, unique_code, is_admin, created_at)
VALUES
  -- Speed Demon: Opens fast, but misses some days
  ('11111111-1111-1111-1111-111111111111', 'Speed Demon', 'speed@test-leaderboard.local', 'SPEED001', false, NOW()),

  -- Consistent Carol: Opens all 12 windows, moderate speed (gets streak bonus!)
  ('22222222-2222-2222-2222-222222222222', 'Consistent Carol', 'carol@test-leaderboard.local', 'CAROL002', false, NOW()),

  -- Late Larry: Opens late each day, fewer windows
  ('33333333-3333-3333-3333-333333333333', 'Late Larry', 'larry@test-leaderboard.local', 'LARRY003', false, NOW()),

  -- Quick Quinn: Very fast opener but only a few days
  ('44444444-4444-4444-4444-444444444444', 'Quick Quinn', 'quinn@test-leaderboard.local', 'QUINN004', false, NOW()),

  -- Average Andy: Middle of the pack
  ('55555555-5555-5555-5555-555555555555', 'Average Andy', 'andy@test-leaderboard.local', 'ANDY0005', false, NOW())

ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- STEP 3: Insert Window Opens with Timing Data
-- ============================================================
-- seconds_after_unlock = seconds since local midnight when opened
-- Lower values = faster opener = better ranking for speed bonuses
--
-- Speed bonuses per window:
--   1st place: +5 points
--   2nd place: +3 points
--   3rd place: +1 point
--   4th+: +0 points
--
-- Base points: 10 per window
-- Streak bonus: +20 for opening all 12 windows

INSERT INTO friend_window_opens (friend_id, window_number, seconds_after_unlock, opened_at)
VALUES
  -- ========== WINDOW 1 ==========
  -- Quinn: 1st (60s), Speed: 2nd (120s), Carol: 3rd (600s), Andy: 4th (1800s), Larry: 5th (7200s)
  ('44444444-4444-4444-4444-444444444444', 1, 60, NOW() - INTERVAL '11 days'),      -- Quinn: 1st (+5)
  ('11111111-1111-1111-1111-111111111111', 1, 120, NOW() - INTERVAL '11 days'),     -- Speed: 2nd (+3)
  ('22222222-2222-2222-2222-222222222222', 1, 600, NOW() - INTERVAL '11 days'),     -- Carol: 3rd (+1)
  ('55555555-5555-5555-5555-555555555555', 1, 1800, NOW() - INTERVAL '11 days'),    -- Andy: 4th (+0)
  ('33333333-3333-3333-3333-333333333333', 1, 7200, NOW() - INTERVAL '11 days'),    -- Larry: 5th (+0)

  -- ========== WINDOW 2 ==========
  -- Speed: 1st (90s), Quinn: 2nd (150s), Carol: 3rd (900s), Andy: 4th (2400s), Larry: 5th (10800s)
  ('11111111-1111-1111-1111-111111111111', 2, 90, NOW() - INTERVAL '10 days'),      -- Speed: 1st (+5)
  ('44444444-4444-4444-4444-444444444444', 2, 150, NOW() - INTERVAL '10 days'),     -- Quinn: 2nd (+3)
  ('22222222-2222-2222-2222-222222222222', 2, 900, NOW() - INTERVAL '10 days'),     -- Carol: 3rd (+1)
  ('55555555-5555-5555-5555-555555555555', 2, 2400, NOW() - INTERVAL '10 days'),    -- Andy: 4th (+0)
  ('33333333-3333-3333-3333-333333333333', 2, 10800, NOW() - INTERVAL '10 days'),   -- Larry: 5th (+0)

  -- ========== WINDOW 3 ==========
  -- Speed: 1st (45s), Carol: 2nd (300s), Andy: 3rd (1200s), Larry: 4th (5400s)
  -- Quinn skips this day
  ('11111111-1111-1111-1111-111111111111', 3, 45, NOW() - INTERVAL '9 days'),       -- Speed: 1st (+5)
  ('22222222-2222-2222-2222-222222222222', 3, 300, NOW() - INTERVAL '9 days'),      -- Carol: 2nd (+3)
  ('55555555-5555-5555-5555-555555555555', 3, 1200, NOW() - INTERVAL '9 days'),     -- Andy: 3rd (+1)
  ('33333333-3333-3333-3333-333333333333', 3, 5400, NOW() - INTERVAL '9 days'),     -- Larry: 4th (+0)

  -- ========== WINDOW 4 ==========
  -- Quinn: 1st (30s), Speed: 2nd (180s), Carol: 3rd (450s), Andy: 4th (3000s)
  -- Larry skips this day
  ('44444444-4444-4444-4444-444444444444', 4, 30, NOW() - INTERVAL '8 days'),       -- Quinn: 1st (+5)
  ('11111111-1111-1111-1111-111111111111', 4, 180, NOW() - INTERVAL '8 days'),      -- Speed: 2nd (+3)
  ('22222222-2222-2222-2222-222222222222', 4, 450, NOW() - INTERVAL '8 days'),      -- Carol: 3rd (+1)
  ('55555555-5555-5555-5555-555555555555', 4, 3000, NOW() - INTERVAL '8 days'),     -- Andy: 4th (+0)

  -- ========== WINDOW 5 ==========
  -- Speed: 1st (75s), Carol: 2nd (500s), Andy: 3rd (1500s), Larry: 4th (8000s)
  -- Quinn stops playing after window 4
  ('11111111-1111-1111-1111-111111111111', 5, 75, NOW() - INTERVAL '7 days'),       -- Speed: 1st (+5)
  ('22222222-2222-2222-2222-222222222222', 5, 500, NOW() - INTERVAL '7 days'),      -- Carol: 2nd (+3)
  ('55555555-5555-5555-5555-555555555555', 5, 1500, NOW() - INTERVAL '7 days'),     -- Andy: 3rd (+1)
  ('33333333-3333-3333-3333-333333333333', 5, 8000, NOW() - INTERVAL '7 days'),     -- Larry: 4th (+0)

  -- ========== WINDOW 6 ==========
  -- Speed: 1st (100s), Carol: 2nd (700s), Andy: 3rd (2000s), Larry: 4th (9000s)
  ('11111111-1111-1111-1111-111111111111', 6, 100, NOW() - INTERVAL '6 days'),      -- Speed: 1st (+5)
  ('22222222-2222-2222-2222-222222222222', 6, 700, NOW() - INTERVAL '6 days'),      -- Carol: 2nd (+3)
  ('55555555-5555-5555-5555-555555555555', 6, 2000, NOW() - INTERVAL '6 days'),     -- Andy: 3rd (+1)
  ('33333333-3333-3333-3333-333333333333', 6, 9000, NOW() - INTERVAL '6 days'),     -- Larry: 4th (+0)

  -- ========== WINDOW 7 ==========
  -- Speed: 1st (60s), Carol: 2nd (400s), Andy: 3rd (1800s)
  -- Larry skips
  ('11111111-1111-1111-1111-111111111111', 7, 60, NOW() - INTERVAL '5 days'),       -- Speed: 1st (+5)
  ('22222222-2222-2222-2222-222222222222', 7, 400, NOW() - INTERVAL '5 days'),      -- Carol: 2nd (+3)
  ('55555555-5555-5555-5555-555555555555', 7, 1800, NOW() - INTERVAL '5 days'),     -- Andy: 3rd (+1)

  -- ========== WINDOW 8 ==========
  -- Speed: 1st (80s), Carol: 2nd (550s), Andy: 3rd (2200s)
  ('11111111-1111-1111-1111-111111111111', 8, 80, NOW() - INTERVAL '4 days'),       -- Speed: 1st (+5)
  ('22222222-2222-2222-2222-222222222222', 8, 550, NOW() - INTERVAL '4 days'),      -- Carol: 2nd (+3)
  ('55555555-5555-5555-5555-555555555555', 8, 2200, NOW() - INTERVAL '4 days'),     -- Andy: 3rd (+1)

  -- ========== WINDOW 9 ==========
  -- Carol: 1st (200s), Andy: 2nd (800s)
  -- Speed skips (only opens 8 windows total)
  ('22222222-2222-2222-2222-222222222222', 9, 200, NOW() - INTERVAL '3 days'),      -- Carol: 1st (+5)
  ('55555555-5555-5555-5555-555555555555', 9, 800, NOW() - INTERVAL '3 days'),      -- Andy: 2nd (+3)

  -- ========== WINDOW 10 ==========
  -- Carol: 1st (250s), Andy: 2nd (1000s)
  ('22222222-2222-2222-2222-222222222222', 10, 250, NOW() - INTERVAL '2 days'),     -- Carol: 1st (+5)
  ('55555555-5555-5555-5555-555555555555', 10, 1000, NOW() - INTERVAL '2 days'),    -- Andy: 2nd (+3)

  -- ========== WINDOW 11 ==========
  -- Carol: 1st (180s)
  -- Andy skips (only opens 10 windows total)
  ('22222222-2222-2222-2222-222222222222', 11, 180, NOW() - INTERVAL '1 day'),      -- Carol: 1st (+5)

  -- ========== WINDOW 12 ==========
  -- Carol: 1st (150s) - Completes all 12! Gets streak bonus!
  ('22222222-2222-2222-2222-222222222222', 12, 150, NOW())                          -- Carol: 1st (+5)

ON CONFLICT (friend_id, window_number) DO NOTHING;

-- ============================================================
-- STEP 4: Verify Leaderboard Results
-- ============================================================
-- Run this query to see the leaderboard after inserting test data:

SELECT
  rank,
  name,
  total_points,
  base_points,
  streak_bonus,
  windows_opened,
  first_place_count,
  total_reaction_time
FROM contest_leaderboard
ORDER BY rank;

-- ============================================================
-- EXPECTED RESULTS:
-- ============================================================
--
-- | Rank | Name             | Points | Base | Streak | Windows | 1st Places |
-- |------|------------------|--------|------|--------|---------|------------|
-- | 1    | Consistent Carol | 164    | 144  | 20     | 12      | 4          |
-- | 2    | Speed Demon      | 116    | 116  | 0      | 8       | 6          |
-- | 3    | Average Andy     | 110    | 110  | 0      | 10      | 0          |
-- | 4    | Quick Quinn      | 56     | 56   | 0      | 4       | 2          |
-- | 5    | Late Larry       | 60     | 60   | 0      | 6       | 0          |
--
-- Note: Carol wins despite Speed Demon having more 1st places because:
-- 1. Carol opened all 12 windows (+20 streak bonus)
-- 2. Carol has more total base points (12 windows vs 8)
--
-- This demonstrates that consistency beats pure speed!
-- ============================================================

-- ============================================================
-- CLEANUP (run when done testing)
-- ============================================================
-- DELETE FROM friends WHERE email LIKE '%@test-leaderboard.local';
