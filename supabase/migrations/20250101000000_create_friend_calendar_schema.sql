-- Migration: Create Friend Calendar Schema
-- Description: Tables for storing friend information and tracking calendar window opens
-- Created: 2025-01-01

-- Enable UUID extension for generating unique codes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FRIENDS TABLE
-- ============================================
-- Stores information about each friend who has access to the calendar
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  unique_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by unique_code (primary access pattern)
CREATE INDEX idx_friends_unique_code ON friends(unique_code);

-- Index for email lookups
CREATE INDEX idx_friends_email ON friends(email);

-- ============================================
-- FRIEND_WINDOW_OPENS TABLE
-- ============================================
-- Tracks which calendar windows each friend has opened
CREATE TABLE friend_window_opens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  window_number INTEGER NOT NULL CHECK (window_number >= 1 AND window_number <= 24),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure each friend can only open each window once
  CONSTRAINT unique_friend_window UNIQUE (friend_id, window_number)
);

-- Index for querying windows opened by a specific friend
CREATE INDEX idx_friend_window_opens_friend_id ON friend_window_opens(friend_id);

-- Index for querying who opened a specific window
CREATE INDEX idx_friend_window_opens_window_number ON friend_window_opens(window_number);

-- Composite index for the most common query pattern
CREATE INDEX idx_friend_window_opens_friend_window ON friend_window_opens(friend_id, window_number);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on friends table
CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Optional - disabled by default)
-- ============================================
-- Uncomment these if you want to enable RLS for additional security

-- ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE friend_window_opens ENABLE ROW LEVEL SECURITY;

-- Example policies (customize based on your auth strategy):
-- CREATE POLICY "Friends are viewable by everyone" ON friends FOR SELECT USING (true);
-- CREATE POLICY "Window opens are viewable by everyone" ON friend_window_opens FOR SELECT USING (true);
-- CREATE POLICY "Only service role can insert friends" ON friends FOR INSERT WITH CHECK (false);
-- CREATE POLICY "Friends can record their own window opens" ON friend_window_opens FOR INSERT WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE friends IS 'Stores friend information for calendar access';
COMMENT ON COLUMN friends.id IS 'Unique identifier for the friend';
COMMENT ON COLUMN friends.name IS 'Friend''s display name';
COMMENT ON COLUMN friends.email IS 'Friend''s email address (unique)';
COMMENT ON COLUMN friends.unique_code IS 'Unique access code for the friend (for URL sharing)';
COMMENT ON COLUMN friends.created_at IS 'Timestamp when friend record was created';
COMMENT ON COLUMN friends.updated_at IS 'Timestamp when friend record was last updated';

COMMENT ON TABLE friend_window_opens IS 'Tracks which calendar windows each friend has opened';
COMMENT ON COLUMN friend_window_opens.id IS 'Unique identifier for the window open event';
COMMENT ON COLUMN friend_window_opens.friend_id IS 'Reference to the friend who opened the window';
COMMENT ON COLUMN friend_window_opens.window_number IS 'Calendar window number (1-24)';
COMMENT ON COLUMN friend_window_opens.opened_at IS 'Timestamp when the window was opened';
