# Feature 2: Leaderboard & Ranking System

**Feature ID**: F2-LEADERBOARD
**Priority**: MEDIUM (Can ship anytime before Dec 24, 2025)
**Status**: Planning

## Overview

Create a competitive leaderboard that ranks users based on when they unlock the final window (Window 13) on December 24, 2025. This creates a "race to finish" mechanic that encourages engagement and adds excitement to the calendar experience.

---

## User Stories

### Primary User Story
```
As a calendar user who completes the calendar,
I want to see how I rank against other users,
So that I can feel accomplished and competitive about finishing quickly.
```

**Acceptance Criteria**:
- [ ] Users who unlock window 13 are ranked by timestamp (earliest = rank 1)
- [ ] Leaderboard displays top 10 finishers with names and completion times
- [ ] Current user sees their own rank even if not in top 10
- [ ] Leaderboard updates automatically (or on refresh) on Dec 24
- [ ] Only users who unlocked window 13 appear on leaderboard

### Secondary User Story
```
As a competitive user,
I want to know when I unlocked the final window,
So that I can share my achievement and compare with friends.
```

**Acceptance Criteria**:
- [ ] User's personal completion time displayed prominently
- [ ] Shareable achievement (e.g., "I finished #5 on the advent calendar!")
- [ ] Visual indication of rank (medal for top 3, trophy for #1)

### Tertiary User Story
```
As any user (even those who didn't complete),
I want to view the leaderboard,
So that I can see how my friends performed and feel motivated.
```

**Acceptance Criteria**:
- [ ] Leaderboard accessible to all authenticated users
- [ ] Shows total number of completions
- [ ] Shows average completion time or stats
- [ ] Users who didn't complete see leaderboard but aren't ranked

---

## Technical Specification

### Database Schema

#### Option A: Database View (Recommended)

Create a read-only view that computes leaderboard rankings:

**File**: `/supabase/migrations/20251122000000_create_leaderboard_view.sql`

```sql
-- View: Leaderboard for Window 13 completions
CREATE OR REPLACE VIEW leaderboard_window_13 AS
SELECT
  f.id AS friend_id,
  f.name AS friend_name,
  f.email AS friend_email,
  fwo.opened_at AS completed_at,
  RANK() OVER (ORDER BY fwo.opened_at ASC) AS rank,
  -- Calculate time from Dec 24 midnight to completion
  EXTRACT(EPOCH FROM (fwo.opened_at - '2025-12-24 00:00:00'::timestamp)) AS seconds_from_unlock
FROM friend_window_opens fwo
JOIN friends f ON fwo.friend_id = f.id
WHERE fwo.window_number = 13
ORDER BY fwo.opened_at ASC;

-- Grant access to authenticated users
ALTER VIEW leaderboard_window_13 OWNER TO postgres;

-- RLS Policy: Allow authenticated users to read leaderboard
CREATE POLICY "leaderboard_read_policy"
ON friend_window_opens
FOR SELECT
TO authenticated
USING (window_number = 13);
```

**View columns**:
- `friend_id` (UUID): User ID
- `friend_name` (TEXT): Display name
- `friend_email` (TEXT): Email (optional, for admin)
- `completed_at` (TIMESTAMP): When they unlocked window 13
- `rank` (INTEGER): Ranking (1 = first place)
- `seconds_from_unlock` (NUMERIC): How many seconds after midnight Dec 24

**Pros**:
- ✅ Automatic ranking calculation
- ✅ Always up-to-date
- ✅ No additional storage needed
- ✅ Easy to query

**Cons**:
- ❌ Slightly slower than materialized view (negligible for <1000 users)

#### Option B: Materialized View (For Scale)

If performance becomes an issue with many users:

```sql
CREATE MATERIALIZED VIEW leaderboard_window_13_cached AS
SELECT /* same query as above */;

-- Refresh periodically
REFRESH MATERIALIZED VIEW leaderboard_window_13_cached;
```

**Decision**: Start with **Option A** (regular view), upgrade to **Option B** if needed.

#### Additional Statistics View

```sql
-- View: Leaderboard statistics
CREATE OR REPLACE VIEW leaderboard_statistics AS
SELECT
  COUNT(*) AS total_completions,
  MIN(opened_at) AS first_completion,
  MAX(opened_at) AS last_completion,
  AVG(EXTRACT(EPOCH FROM (opened_at - '2025-12-24 00:00:00'::timestamp))) AS avg_seconds_from_unlock,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY opened_at) AS median_completion_time
FROM friend_window_opens
WHERE window_number = 13;
```

### API Functions

Create new module for leaderboard operations.

**File**: `/src/lib/leaderboard.ts` (NEW)

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Leaderboard entry type
 */
export interface LeaderboardEntry {
  rank: number;
  friendId: string;
  friendName: string;
  completedAt: Date;
  secondsFromUnlock: number;
  isCurrentUser: boolean;
}

/**
 * Leaderboard statistics type
 */
export interface LeaderboardStatistics {
  totalCompletions: number;
  firstCompletion: Date | null;
  lastCompletion: Date | null;
  averageSecondsFromUnlock: number;
  medianCompletionTime: Date | null;
}

/**
 * Gets the full leaderboard (all users who completed window 13)
 * @param limit - Optional limit on number of entries (default: 100)
 * @returns Array of leaderboard entries
 */
export async function getLeaderboard(
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_window_13')
    .select('*')
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  // Get current user to mark their entry
  const currentUser = await getCurrentFriend();

  return (data || []).map(entry => ({
    rank: entry.rank,
    friendId: entry.friend_id,
    friendName: entry.friend_name,
    completedAt: new Date(entry.completed_at),
    secondsFromUnlock: entry.seconds_from_unlock,
    isCurrentUser: currentUser?.id === entry.friend_id,
  }));
}

/**
 * Gets top N finishers
 * @param n - Number of top entries to return (default: 10)
 * @returns Top N leaderboard entries
 */
export async function getTopN(n: number = 10): Promise<LeaderboardEntry[]> {
  return getLeaderboard(n);
}

/**
 * Gets a specific user's rank and entry
 * @param friendId - User ID to look up
 * @returns Leaderboard entry for user, or null if not found
 */
export async function getUserRank(
  friendId: string
): Promise<LeaderboardEntry | null> {
  const { data, error } = await supabase
    .from('leaderboard_window_13')
    .select('*')
    .eq('friend_id', friendId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    rank: data.rank,
    friendId: data.friend_id,
    friendName: data.friend_name,
    completedAt: new Date(data.completed_at),
    secondsFromUnlock: data.seconds_from_unlock,
    isCurrentUser: true,
  };
}

/**
 * Gets leaderboard statistics
 * @returns Statistics about completions
 */
export async function getLeaderboardStatistics(): Promise<LeaderboardStatistics | null> {
  const { data, error } = await supabase
    .from('leaderboard_statistics')
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error fetching leaderboard statistics:', error);
    return null;
  }

  return {
    totalCompletions: data.total_completions || 0,
    firstCompletion: data.first_completion ? new Date(data.first_completion) : null,
    lastCompletion: data.last_completion ? new Date(data.last_completion) : null,
    averageSecondsFromUnlock: data.avg_seconds_from_unlock || 0,
    medianCompletionTime: data.median_completion_time
      ? new Date(data.median_completion_time)
      : null,
  };
}

/**
 * Formats seconds from unlock into human-readable string
 * @param seconds - Seconds elapsed from midnight Dec 24
 * @returns Formatted string like "5m 23s" or "2h 15m"
 */
export function formatTimeFromUnlock(seconds: number): string {
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 60) {
    return `${Math.floor(absSeconds)}s`;
  }

  const minutes = Math.floor(absSeconds / 60);
  if (minutes < 60) {
    const secs = Math.floor(absSeconds % 60);
    return `${minutes}m ${secs}s`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
}

/**
 * Check if user has completed window 13
 * @param friendId - User ID to check
 * @returns true if user has unlocked window 13
 */
export async function hasUserCompleted(friendId: string): Promise<boolean> {
  const rank = await getUserRank(friendId);
  return rank !== null;
}
```

### Type Definitions

**File**: `/src/types/leaderboard.ts` (NEW)

```typescript
export interface LeaderboardEntry {
  rank: number;
  friendId: string;
  friendName: string;
  completedAt: Date;
  secondsFromUnlock: number;
  isCurrentUser: boolean;
}

export interface LeaderboardStatistics {
  totalCompletions: number;
  firstCompletion: Date | null;
  lastCompletion: Date | null;
  averageSecondsFromUnlock: number;
  medianCompletionTime: Date | null;
}

export interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  statistics: LeaderboardStatistics | null;
}
```

### React Component

**File**: `/src/components/Leaderboard.tsx` (NEW)

```typescript
import { useState, useEffect } from 'react';
import {
  getTopN,
  getUserRank,
  getLeaderboardStatistics,
  formatTimeFromUnlock,
  type LeaderboardEntry,
  type LeaderboardStatistics,
} from '../lib/leaderboard';
import { getCurrentFriend } from '../lib/auth';

export function Leaderboard() {
  const [topEntries, setTopEntries] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [statistics, setStatistics] = useState<LeaderboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh on Dec 24 every 30 seconds
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();

    // Enable auto-refresh if it's December 24
    const today = new Date();
    if (today.getMonth() === 11 && today.getDate() === 24) {
      const interval = window.setInterval(loadLeaderboard, 30000); // 30 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, []);

  async function loadLeaderboard() {
    try {
      setLoading(true);

      // Load top 10
      const top = await getTopN(10);
      setTopEntries(top);

      // Load current user's rank
      const currentFriend = await getCurrentFriend();
      if (currentFriend) {
        const rank = await getUserRank(currentFriend.id);
        setUserEntry(rank);
      }

      // Load statistics
      const stats = await getLeaderboardStatistics();
      setStatistics(stats);

      setError(null);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading && topEntries.length === 0) {
    return (
      <div className="leaderboard-container">
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error">{error}</div>
        <button onClick={loadLeaderboard}>Retry</button>
      </div>
    );
  }

  const userInTop10 = userEntry && userEntry.rank <= 10;

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <h1>🏆 Window 13 Leaderboard</h1>
        <p className="subtitle">Who unlocked the final window first?</p>
      </header>

      {/* Statistics Bar */}
      {statistics && (
        <div className="leaderboard-stats">
          <div className="stat">
            <span className="stat-value">{statistics.totalCompletions}</span>
            <span className="stat-label">Total Completions</span>
          </div>
          {statistics.firstCompletion && (
            <div className="stat">
              <span className="stat-value">
                {formatTimeFromUnlock(statistics.averageSecondsFromUnlock)}
              </span>
              <span className="stat-label">Average Time</span>
            </div>
          )}
        </div>
      )}

      {/* User's Rank (if not in top 10) */}
      {userEntry && !userInTop10 && (
        <div className="user-rank-card">
          <h3>Your Rank</h3>
          <div className="rank-display">
            <span className="rank-number">#{userEntry.rank}</span>
            <span className="rank-time">
              Completed in {formatTimeFromUnlock(userEntry.secondsFromUnlock)}
            </span>
          </div>
          <p className="rank-date">
            {userEntry.completedAt.toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
      )}

      {/* Top 10 Leaderboard */}
      <div className="leaderboard-list">
        <h2>Top Finishers</h2>
        {topEntries.length === 0 ? (
          <div className="empty-state">
            <p>No completions yet! Be the first to unlock window 13 on December 24.</p>
          </div>
        ) : (
          <ol className="entries">
            {topEntries.map((entry) => (
              <li
                key={entry.friendId}
                className={`entry ${entry.isCurrentUser ? 'current-user' : ''} ${
                  entry.rank <= 3 ? 'podium' : ''
                }`}
              >
                <div className="rank">
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                  {entry.rank > 3 && `#${entry.rank}`}
                </div>
                <div className="name">{entry.friendName}</div>
                <div className="time">
                  {formatTimeFromUnlock(entry.secondsFromUnlock)}
                </div>
                <div className="timestamp">
                  {entry.completedAt.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Refresh Button */}
      <div className="leaderboard-actions">
        <button onClick={loadLeaderboard} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
    </div>
  );
}
```

**Styling** (add to component or global styles):

```css
/* Leaderboard Container */
.leaderboard-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.leaderboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.leaderboard-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

/* Statistics Bar */
.leaderboard-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

/* User Rank Card */
.user-rank-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
}

.rank-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 1rem;
  margin: 1rem 0;
}

.rank-number {
  font-size: 3rem;
  font-weight: bold;
}

.rank-time {
  font-size: 1.2rem;
}

/* Leaderboard List */
.leaderboard-list h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.entries {
  list-style: none;
  padding: 0;
  margin: 0;
}

.entry {
  display: grid;
  grid-template-columns: 60px 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  transition: background 0.2s;
}

.entry:hover {
  background: #f9f9f9;
}

.entry.podium {
  background: #fffbf0;
  font-weight: 600;
}

.entry.current-user {
  background: #e6f3ff;
  border: 2px solid #4a90e2;
  border-radius: 8px;
  margin: 0.5rem 0;
}

.entry .rank {
  font-size: 1.5rem;
  text-align: center;
}

.entry .name {
  font-size: 1.1rem;
}

.entry .time {
  color: #4a90e2;
  font-weight: 600;
}

.entry .timestamp {
  color: #888;
  font-size: 0.9rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

/* Actions */
.leaderboard-actions {
  margin-top: 2rem;
  text-align: center;
}

.leaderboard-actions button {
  padding: 0.75rem 1.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.leaderboard-actions button:hover:not(:disabled) {
  background: #357abd;
}

.leaderboard-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .entry {
    grid-template-columns: 50px 1fr;
    gap: 0.5rem;
  }

  .entry .time,
  .entry .timestamp {
    grid-column: 2;
    font-size: 0.85rem;
  }
}
```

### Leaderboard Page

**File**: `/src/pages/leaderboard.astro` (NEW)

```astro
---
import Layout from '../layouts/Layout.astro';
import Leaderboard from '../components/Leaderboard';
import { isAuthenticated } from '../lib/auth';

const authenticated = await isAuthenticated(Astro.request);

// Redirect to login if not authenticated
if (!authenticated) {
  return Astro.redirect('/login');
}
---

<Layout title="Leaderboard - Advent Calendar">
  <main>
    <Leaderboard client:load />
  </main>
</Layout>
```

### Navigation Updates (Optional)

**File**: `/src/components/Navigation.astro` or similar

Add leaderboard link to navigation:

```astro
<nav>
  <a href="/">Calendar</a>
  <a href="/leaderboard">🏆 Leaderboard</a>
  {isAdmin && <a href="/admin">Admin</a>}
</nav>
```

---

## Integration Points

### Trigger Achievement on Window 13 Unlock

**File**: `/src/components/CalendarGrid.tsx`

When user opens window 13, show achievement:

```typescript
const handleOpenWindow = (day: number) => {
  // ... existing logic

  // NEW: Check if this is window 13
  if (day === 13) {
    // Show achievement modal
    showAchievement();

    // Optionally navigate to leaderboard
    setTimeout(() => {
      if (confirm('You completed the calendar! View leaderboard?')) {
        window.location.href = '/leaderboard';
      }
    }, 2000);
  }
};

function showAchievement() {
  // Show confetti, modal, or toast notification
  console.log('🎉 Calendar completed!');
  // TODO: Implement achievement modal
}
```

### Admin Dashboard Integration

**File**: `/src/components/AdminDashboard.tsx`

Add leaderboard link or embed:

```typescript
<div className="admin-section">
  <h2>Leaderboard</h2>
  <a href="/leaderboard" className="btn-primary">
    View Full Leaderboard
  </a>
  {/* Or embed top 5 */}
</div>
```

---

## Testing Plan

### Unit Tests

**File**: `tests/lib/leaderboard.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { formatTimeFromUnlock } from '../src/lib/leaderboard';

describe('formatTimeFromUnlock', () => {
  it('formats seconds correctly', () => {
    expect(formatTimeFromUnlock(45)).toBe('45s');
  });

  it('formats minutes correctly', () => {
    expect(formatTimeFromUnlock(125)).toBe('2m 5s');
  });

  it('formats hours correctly', () => {
    expect(formatTimeFromUnlock(7320)).toBe('2h 2m');
  });
});
```

### Integration Tests

Test with sample data in Supabase:

```sql
-- Insert test data
INSERT INTO friend_window_opens (friend_id, window_number, opened_at)
VALUES
  ('user1-id', 13, '2025-12-24 00:05:23'),
  ('user2-id', 13, '2025-12-24 00:12:45'),
  ('user3-id', 13, '2025-12-24 01:30:00');

-- Query leaderboard view
SELECT * FROM leaderboard_window_13;
```

**Expected results**:
- Rank 1: user1-id (5m 23s)
- Rank 2: user2-id (12m 45s)
- Rank 3: user3-id (1h 30m)

### Manual Testing Scenarios

#### Scenario 1: Empty Leaderboard
- **When**: Before anyone unlocks window 13
- **Expected**: Empty state message, no errors
- **Verify**: Statistics show 0 completions

#### Scenario 2: Single User
- **When**: Only one user unlocks window 13
- **Expected**: Shows rank #1, correct timestamp
- **Verify**: Statistics show 1 completion

#### Scenario 3: Top 10 + User Outside Top 10
- **When**: Current user ranked #15
- **Expected**: Top 10 displayed, user's rank shown separately
- **Verify**: User card highlights rank #15

#### Scenario 4: User in Top 10
- **When**: Current user ranked #3
- **Expected**: Top 10 displayed with user highlighted
- **Verify**: No separate user card

#### Scenario 5: Auto-Refresh on Dec 24
- **When**: Accessing leaderboard on Dec 24
- **Expected**: Updates every 30 seconds automatically
- **Verify**: New entries appear without manual refresh

#### Scenario 6: Mobile Responsive
- **When**: Accessing on mobile device
- **Expected**: Leaderboard stacks nicely, readable
- **Verify**: All columns visible, no horizontal scroll

### Performance Testing

Test with large dataset:

```sql
-- Generate 1000 test entries
INSERT INTO friend_window_opens (friend_id, window_number, opened_at)
SELECT
  gen_random_uuid(),
  13,
  '2025-12-24 00:00:00'::timestamp + (random() * interval '24 hours')
FROM generate_series(1, 1000);
```

**Measure**:
- [ ] Query time < 100ms for top 10
- [ ] Query time < 200ms for user rank lookup
- [ ] Page load time < 2 seconds

---

## Edge Cases & Error Handling

### Edge Case 1: Tie (Same Timestamp)
**Scenario**: Two users unlock at exact same millisecond

**Handling**:
- PostgreSQL `RANK()` will give same rank to ties
- Next rank skips (e.g., two #1s, then #3)
- This is standard sports ranking behavior

**Example**:
```
#1 - User A (00:05:23.456)
#1 - User B (00:05:23.456)
#3 - User C (00:05:24.000)
```

### Edge Case 2: User Not Logged In
**Scenario**: Anonymous user tries to access leaderboard

**Handling**:
- Redirect to `/login` page
- Show message: "Log in to view leaderboard"

### Edge Case 3: User Hasn't Completed
**Scenario**: Logged-in user views leaderboard without unlocking window 13

**Handling**:
- Show top 10 normally
- No user rank card displayed
- Message: "Complete the calendar to see your rank!"

### Edge Case 4: Database Error
**Scenario**: Supabase query fails

**Handling**:
- Show error message
- Provide retry button
- Log error to console

### Edge Case 5: Unauthenticated Query
**Scenario**: User's session expired

**Handling**:
- RLS policy blocks query
- Redirect to login
- Preserve intended destination for redirect after login

---

## Privacy & Security

### Data Exposure
- **Public**: Friend name, rank, completion time
- **Private**: Email, friend ID (admin-only)

### RLS Policies

Ensure Row Level Security allows reading leaderboard:

```sql
-- Allow authenticated users to read their own and others' window 13 completions
CREATE POLICY "users_can_read_window_13_opens"
ON friend_window_opens
FOR SELECT
TO authenticated
USING (window_number = 13);

-- Allow users to read friend names for leaderboard
CREATE POLICY "users_can_read_friend_names"
ON friends
FOR SELECT
TO authenticated
USING (true); -- Or restrict further if needed
```

### Anti-Cheating Measures

**Current measures**:
- Unique constraint on `(friend_id, window_number)` prevents duplicate opens
- Timestamp set server-side (`opened_at TIMESTAMP DEFAULT NOW()`)
- Users cannot modify their timestamp

**Future enhancements**:
- Validate unlock date on server (from Feature 1)
- Flag suspicious timestamps (e.g., before Dec 24 midnight)
- Admin review for top 10 entries

---

## Deployment Checklist

### Pre-Deployment
- [ ] Database migration created and tested
- [ ] RLS policies configured correctly
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] Manual testing with sample data
- [ ] Performance testing completed
- [ ] Responsive design verified

### Deployment
- [ ] Deploy database migration to Supabase
- [ ] Deploy frontend code to Vercel
- [ ] Verify leaderboard page accessible
- [ ] Test with production data (if any)
- [ ] Check error logs

### Post-Deployment
- [ ] Monitor query performance
- [ ] Check for RLS policy issues
- [ ] Verify auto-refresh works on Dec 24
- [ ] Collect user feedback

---

## Success Metrics

### Quantitative
- **Engagement**: % of users who visit leaderboard page
- **Competition**: Number of users who unlock window 13
- **Performance**: Query time < 100ms
- **Completion rate**: % increase after leaderboard announcement

### Qualitative
- Users report positive competitive experience
- No confusion about ranking system
- Leaderboard is perceived as fair

---

## Future Enhancements

### Phase 2 Improvements
1. **Filtering & Search**: Search for specific friend on leaderboard
2. **Historical leaderboards**: Archive leaderboards for past years
3. **Personal achievements**: Badges, streaks, perfect completions
4. **Social sharing**: "I finished #5! Can you beat me?"
5. **Notifications**: Email when you're overtaken in rankings
6. **Live updates**: Real-time WebSocket updates on Dec 24
7. **Leaderboard for each window**: Who opened window 5 first?

---

## Open Questions

1. **Display email on leaderboard?**
   - **Recommendation**: No, only friend name (privacy)

2. **Allow opt-out from leaderboard?**
   - **Recommendation**: Not initially; add if requested

3. **Archive leaderboard after December?**
   - **Recommendation**: Yes, keep as historical record

4. **Prizes for winners?**
   - **Decision**: Left to product owner

5. **Leaderboard for incomplete users (most windows opened)?**
   - **Recommendation**: Future enhancement, not MVP

---

## Dependencies

### Required Before Implementation
- [ ] Feature 1 (Daily Unlocking) completed (to ensure fair race)
- [ ] Supabase RLS policies reviewed
- [ ] Design approval for leaderboard UI

### External Dependencies
- None (uses existing Supabase setup)

---

## Related Files

### Files to Create
- `/supabase/migrations/20251122000000_create_leaderboard_view.sql` - DB view
- `/src/lib/leaderboard.ts` - Leaderboard API functions
- `/src/types/leaderboard.ts` - Type definitions
- `/src/components/Leaderboard.tsx` - Leaderboard UI
- `/src/pages/leaderboard.astro` - Leaderboard page

### Files to Modify
- `/src/components/CalendarGrid.tsx` - Add achievement trigger for window 13
- `/src/components/Navigation.astro` - Add leaderboard link (optional)
- `/src/components/AdminDashboard.tsx` - Add leaderboard link (optional)

### Files to Reference
- `/src/lib/database.ts` - Existing database utilities
- `/src/lib/auth.ts` - Authentication utilities
- `/src/components/AdminDashboard.tsx` - Similar data display patterns

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Status**: Ready for Implementation
