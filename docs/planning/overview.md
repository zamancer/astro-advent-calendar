# Advent Calendar Features: Planning Overview

**Date**: 2025-11-22
**Status**: Planning Phase

## Executive Summary

This document outlines the plan for adding two key features to the Advent Calendar application:

1. **Daily Window Unlocking**: Users can unlock one window per day from December 12-24 (13 windows total)
2. **Leaderboard System**: Users who unlock the final window (December 24) are ranked by completion time

## Current State Analysis

### Existing Implementation
- **12-window calendar** with configurable content (photo, Spotify, text, message)
- **No date restrictions** - users can currently open any window at any time
- **Progress tracking** via Supabase (`friend_window_opens` table)
- **Offline-first architecture** with localStorage + async sync
- **Authentication** via Supabase Magic Link (passwordless)
- **Admin dashboard** with progress views and statistics

### Database Schema (Current)
```sql
-- Users/Friends
friends (id, name, email, unique_code, is_admin, created_at, updated_at)

-- Progress Tracking
friend_window_opens (id, friend_id, window_number, opened_at)
  - UNIQUE constraint on (friend_id, window_number)
  - opened_at timestamp automatically captured

-- Admin Views
admin_friend_progress, admin_statistics, admin_window_popularity
```

## Feature 1: Daily Window Unlocking

### Goal
Transform the calendar from "open anytime" to a timed progression game where:
- Windows unlock one per day starting December 12
- Window 1 unlocks Dec 12, Window 2 unlocks Dec 13, ..., Window 13 unlocks Dec 24
- Users cannot open future windows (enforced via UI + validation)
- Clear visual feedback shows locked vs unlocked windows

### Key Design Decisions

#### Number of Windows
- **Changing from 12 to 13 windows** (Dec 12-24 inclusive)
- Requires config updates and content creation for window 13

#### Unlock Schedule
```
Window 1  → December 12, 2025 at 00:00 local time
Window 2  → December 13, 2025 at 00:00 local time
Window 3  → December 14, 2025 at 00:00 local time
...
Window 13 → December 24, 2025 at 00:00 local time
```

#### Timezone Handling
- **Option A (Recommended)**: Use user's **local timezone**
  - Pros: Intuitive, midnight unlocks feel natural
  - Cons: Users in different timezones unlock at different absolute times

- **Option B**: Use **UTC midnight**
  - Pros: Fair/equal for all users
  - Cons: Confusing UX (unlocks at random times depending on timezone)

**Decision**: Use **local timezone** for better UX

#### Validation Strategy
- **Frontend validation**: Disable locked windows, show unlock dates
- **Backend validation** (optional): Reject attempts to open locked windows
- **Trade-off**: Frontend-only is simpler but allows workarounds; backend adds security

**Decision**: **Frontend validation only** (simpler, matches offline-first approach)

### Technical Approach

#### Configuration
Add unlock dates to calendar configuration:
```typescript
// src/config/calendar-content.ts
export const defaultCalendarContent: CalendarContent[] = [
  {
    day: 1,
    unlockDate: new Date('2025-12-12T00:00:00'), // Dec 12 midnight
    type: 'photo',
    // ...
  },
  // ...
];
```

#### Validation Logic
```typescript
// src/lib/calendar.ts
export function isWindowUnlocked(windowNumber: number): boolean {
  const config = getWindowConfig(windowNumber);
  const now = new Date();
  return now >= config.unlockDate;
}

export function getNextUnlockDate(): Date | null {
  // Returns next window unlock date for countdown UI
}
```

#### UI Updates
- **CalendarGrid.tsx**: Check `isWindowUnlocked()` before allowing click
- **CalendarWindow.tsx**: Visual styling for locked vs unlocked
  - Locked: Gray, opacity reduced, lock icon, "Unlocks Dec X" message
  - Unlocked: Normal colors, clickable, hover effects
- **Progress indicator**: Show "X/13 windows unlocked"

### Impact Analysis

#### Modified Files
- `/src/config/calendar-content.ts` - Add unlock dates, extend to 13 windows
- `/src/lib/calendar.ts` - NEW: Unlock validation utilities
- `/src/components/CalendarGrid.tsx` - Add unlock check before opening
- `/src/components/CalendarWindow.tsx` - Visual locked/unlocked states
- `/src/types/calendar.ts` - Add `unlockDate` to CalendarContent type

#### Database Changes
- **None required** for basic implementation
- Optional: Add `unlock_date` column to calendar config table (future enhancement)

#### Testing Requirements
- Time-based testing (mock dates)
- Edge cases: timezone boundaries, window 13 on Dec 24
- Offline behavior when date changes
- Visual testing: locked vs unlocked states

---

## Feature 2: Leaderboard System

### Goal
Create a competitive element by ranking users who complete the calendar (unlock window 13 on December 24):
- Track timestamp when window 13 is opened
- Display leaderboard showing who finished first
- Show user's rank among all participants
- Encourage users to complete the calendar quickly on Dec 24

### Key Design Decisions

#### Leaderboard Criteria
- **Ranked by**: Timestamp of opening window 13 (earliest = rank 1)
- **Tie-breaking**: Use `opened_at` timestamp precision (milliseconds)
- **Eligibility**: Only users who opened window 13 (partial completions not ranked)

#### Leaderboard Visibility
- **Option A**: Public leaderboard (all users can see all ranks)
- **Option B**: Private (users only see their own rank)
- **Option C**: Hybrid (top 10 + your rank)

**Decision**: **Hybrid approach** (top 10 + user's personal rank)

#### Display Location
- **Option A**: New `/leaderboard` page accessible to all authenticated users
- **Option B**: Section in admin dashboard (admin-only)
- **Option C**: Modal/section on main calendar page after completion

**Decision**: **New `/leaderboard` page** (accessible to all, increases engagement)

#### Real-time Updates
- **Option A**: Real-time updates via Supabase subscriptions
- **Option B**: Manual refresh or auto-refresh every X seconds
- **Option C**: Static (refresh on page load only)

**Decision**: **Auto-refresh every 30 seconds** on Dec 24 (simple, effective)

### Technical Approach

#### Database View
Create optimized view for leaderboard queries:
```sql
CREATE OR REPLACE VIEW leaderboard_window_13 AS
SELECT
  f.id as friend_id,
  f.name as friend_name,
  fwo.opened_at,
  RANK() OVER (ORDER BY fwo.opened_at ASC) as rank
FROM friend_window_opens fwo
JOIN friends f ON fwo.friend_id = f.id
WHERE fwo.window_number = 13
ORDER BY fwo.opened_at ASC;
```

#### API Functions
```typescript
// src/lib/leaderboard.ts (NEW FILE)
export interface LeaderboardEntry {
  rank: number;
  friendName: string;
  completedAt: Date;
  isCurrentUser: boolean;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // Query leaderboard_window_13 view
}

export async function getUserRank(friendId: string): Promise<number | null> {
  // Get specific user's rank
}

export async function getTopN(n: number = 10): Promise<LeaderboardEntry[]> {
  // Get top N finishers
}
```

#### UI Component
```typescript
// src/components/Leaderboard.tsx (NEW)
export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    // Load leaderboard
    // Auto-refresh every 30s if on Dec 24
  }, []);

  return (
    <div>
      <h2>🏆 Window 13 Completion Leaderboard</h2>
      {/* Top 10 list */}
      {/* User's rank if not in top 10 */}
      {/* Stats: total completions, average time, etc */}
    </div>
  );
}
```

#### Page
```astro
---
// src/pages/leaderboard.astro (NEW)
import Leaderboard from '../components/Leaderboard';
import { isAuthenticated } from '../lib/auth';

const authenticated = await isAuthenticated(Astro.request);
if (!authenticated) {
  return Astro.redirect('/login');
}
---

<Layout title="Leaderboard">
  <Leaderboard client:load />
</Layout>
```

### Impact Analysis

#### New Files
- `/src/lib/leaderboard.ts` - Leaderboard API functions
- `/src/components/Leaderboard.tsx` - Leaderboard UI component
- `/src/pages/leaderboard.astro` - Leaderboard page
- `/supabase/migrations/XXXXXX_create_leaderboard_view.sql` - Database view

#### Modified Files
- Navigation/header to include leaderboard link (optional)
- Admin dashboard to link to leaderboard (optional)

#### Database Changes
- New view: `leaderboard_window_13`
- New RLS policy: Allow authenticated users to read leaderboard view

#### Testing Requirements
- Edge cases: No completions yet, ties, single completion
- Performance: Large number of users (100+)
- Privacy: Verify users can't see unauthorized data
- Visual: Highlight current user, responsive design

---

## Implementation Strategy

### Phase 1: Daily Unlocking (Priority: HIGH)
**Timeline**: Before December 12, 2025

1. Extend calendar to 13 windows
2. Add unlock date configuration
3. Implement unlock validation logic
4. Update UI for locked/unlocked states
5. Test with mocked dates
6. Deploy to production

**Estimated effort**: 2-3 development sessions

### Phase 2: Leaderboard (Priority: MEDIUM)
**Timeline**: Can be deployed anytime (ideally before Dec 24)

1. Create database view and migration
2. Build leaderboard API functions
3. Create leaderboard component
4. Add leaderboard page
5. Test with sample data
6. Deploy to production

**Estimated effort**: 1-2 development sessions

### Phase 3: Polish & Testing (Priority: MEDIUM)
**Timeline**: Before December 12, 2025

1. Cross-browser testing
2. Mobile responsive testing
3. Accessibility audit
4. Performance optimization
5. Edge case testing
6. User acceptance testing

**Estimated effort**: 1 development session

---

## Success Criteria

### Feature 1: Daily Unlocking
- ✅ Users can only open windows that are unlocked based on date
- ✅ Locked windows show clear visual indication
- ✅ Users can see when future windows will unlock
- ✅ No TypeScript errors or linting issues
- ✅ Works offline (localStorage validation)
- ✅ Responsive on mobile and desktop

### Feature 2: Leaderboard
- ✅ Accurate ranking based on window 13 completion time
- ✅ Top 10 displayed prominently
- ✅ Current user's rank visible if not in top 10
- ✅ Updates automatically on Dec 24
- ✅ No TypeScript errors or linting issues
- ✅ Fast query performance (< 100ms)

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Timezone confusion | High | Medium | Use local time, clear messaging |
| Date validation bypass (frontend-only) | Low | Low | Accept as tradeoff; add backend later if needed |
| Leaderboard performance issues | Medium | Low | Use indexed view, limit to top 100 |
| Offline sync issues with locked windows | Medium | Low | Queue opens for sync, validate on server |

### Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Users frustrated by locked windows | Medium | Medium | Clear messaging, countdown timers |
| Low engagement with leaderboard | Low | Medium | Highlight in UI, share socially |
| Content not ready for 13 windows | High | Low | Prepare content before Dec 12 |

---

## Open Questions

1. **Window numbering**: Keep 1-13 or use 12-24 to match dates?
   - **Recommendation**: Keep 1-13 for simplicity (map to dates in config)

2. **Catch-up mechanic**: Can users open missed windows from previous days?
   - **Recommendation**: Yes, allow catch-up (unlock all windows up to current date)

3. **Leaderboard prizes**: Any incentives for top finishers?
   - **Recommendation**: Leave to product owner

4. **After Dec 24**: Keep calendar open or close?
   - **Recommendation**: Keep open for nostalgic viewing

5. **Testing dates**: How to test unlocking without waiting for real dates?
   - **Recommendation**: Add debug flag to override date checks in dev mode

---

## Next Steps

1. ✅ Review this planning document
2. Review detailed feature plans (see separate docs)
3. Approve implementation approach
4. Create content for window 13
5. Begin Phase 1 development
6. Schedule testing window before Dec 12

---

## Related Documents

- [Feature 1: Daily Window Unlocking - Detailed Plan](./feature-1-daily-unlocking.md)
- [Feature 2: Leaderboard System - Detailed Plan](./feature-2-leaderboard.md)
- [Implementation Checklist](./implementation-checklist.md)
- [Project README](../../README.md)
- [Database Schema](../../supabase/README.md)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Owner**: Development Team
