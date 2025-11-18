-- Seed Data for Friend Calendar
-- This file contains test data for development and testing
-- Run this after the migration to populate the database with sample data

-- ============================================
-- CLEAR EXISTING DATA (for re-seeding)
-- ============================================
-- Uncomment these lines if you want to clear data before re-seeding
-- TRUNCATE TABLE friend_window_opens CASCADE;
-- TRUNCATE TABLE friends CASCADE;

-- ============================================
-- SEED FRIENDS
-- ============================================

INSERT INTO friends (id, name, email, unique_code, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice@example.com', 'ALICE123', '2024-11-01 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Bob Smith', 'bob@example.com', 'BOB45678', '2024-11-02 11:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Charlie Brown', 'charlie@example.com', 'CHAR1LIE', '2024-11-03 09:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Diana Prince', 'diana@example.com', 'DIANA999', '2024-11-04 14:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Eve Martinez', 'eve@example.com', 'EVE77XYZ', '2024-11-05 16:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED WINDOW OPENS
-- ============================================

-- Alice has opened windows 1-5 (active user)
INSERT INTO friend_window_opens (friend_id, window_number, opened_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 1, '2024-12-01 08:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440001', 2, '2024-12-02 09:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440001', 3, '2024-12-03 07:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440001', 4, '2024-12-04 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440001', 5, '2024-12-05 08:45:00+00')
ON CONFLICT (friend_id, window_number) DO NOTHING;

-- Bob has opened windows 1-3 (moderate user)
INSERT INTO friend_window_opens (friend_id, window_number, opened_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 1, '2024-12-01 12:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440002', 2, '2024-12-02 13:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440002', 3, '2024-12-03 11:45:00+00')
ON CONFLICT (friend_id, window_number) DO NOTHING;

-- Charlie has opened only window 1 (new user)
INSERT INTO friend_window_opens (friend_id, window_number, opened_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 1, '2024-12-01 20:00:00+00')
ON CONFLICT (friend_id, window_number) DO NOTHING;

-- Diana has opened windows 1, 2, 4 (skipped 3)
INSERT INTO friend_window_opens (friend_id, window_number, opened_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 1, '2024-12-01 15:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440004', 2, '2024-12-02 16:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440004', 4, '2024-12-04 17:00:00+00')
ON CONFLICT (friend_id, window_number) DO NOTHING;

-- Eve hasn't opened any windows yet (inactive user)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment these to verify the seed data was inserted correctly

-- SELECT * FROM friends ORDER BY created_at;
-- SELECT * FROM friend_window_opens ORDER BY friend_id, window_number;

-- -- Progress summary for all friends
-- SELECT
--   f.name,
--   f.email,
--   f.unique_code,
--   COUNT(fwo.id) as windows_opened,
--   ARRAY_AGG(fwo.window_number ORDER BY fwo.window_number) FILTER (WHERE fwo.window_number IS NOT NULL) as opened_windows
-- FROM friends f
-- LEFT JOIN friend_window_opens fwo ON f.id = fwo.friend_id
-- GROUP BY f.id, f.name, f.email, f.unique_code
-- ORDER BY f.name;
