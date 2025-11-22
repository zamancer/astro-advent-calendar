# Implementation Checklist

**Project**: Advent Calendar Features (Daily Unlocking + Leaderboard)
**Last Updated**: 2025-11-22

## Overview

This document provides a step-by-step implementation guide for both features:
- **Feature 1**: Daily Window Unlocking (Dec 12-24)
- **Feature 2**: Leaderboard/Ranking System

Follow this checklist sequentially to ensure smooth implementation.

---

## Prerequisites

Before starting implementation:

- [ ] Review all planning documents:
  - [ ] [Overview](./overview.md)
  - [ ] [Feature 1: Daily Unlocking](./feature-1-daily-unlocking.md)
  - [ ] [Feature 2: Leaderboard](./feature-2-leaderboard.md)
- [ ] Ensure development environment is set up
- [ ] Verify access to Supabase project
- [ ] Confirm pnpm is installed (not npm/yarn)
- [ ] Create new branch: `git checkout -b claude/advent-calendar-features-<session-id>`

---

## Phase 1: Feature 1 - Daily Window Unlocking

**Priority**: HIGH (Must complete before Dec 12, 2025)
**Estimated Time**: 2-3 development sessions

### Step 1: Extend Calendar to 13 Windows

#### 1.1 Create Content for Window 13

- [ ] Coordinate with content creator for window 13 content
- [ ] Choose content type (message, photo, Spotify, text)
- [ ] Gather assets (images, links, text)
- [ ] Review content for quality and theme

**Acceptance**: Window 13 content is ready and approved

---

#### 1.2 Update Calendar Configuration

**File**: `/src/config/calendar-content.ts`

- [ ] Open `/src/config/calendar-content.ts`
- [ ] Add unlock dates to all existing windows (days 1-12)
- [ ] Add new window 13 configuration
- [ ] Set unlock dates: Window 1 = Dec 12, Window 13 = Dec 24

**Example structure**:
```typescript
{
  day: 1,
  unlockDate: new Date('2025-12-12T00:00:00'),
  type: 'photo',
  title: 'Day 1',
  // ... rest of config
},
// ...
{
  day: 13,
  unlockDate: new Date('2025-12-24T00:00:00'),
  type: 'message',
  title: 'Christmas Eve',
  // ... new content
}
```

- [ ] Run `pnpm build` to verify no errors
- [ ] Run `pnpm lint` to check code style

**Acceptance**: 13 windows configured with correct unlock dates

---

#### 1.3 Update Type Definitions

**File**: `/src/types/calendar.ts`

- [ ] Open `/src/types/calendar.ts`
- [ ] Add `unlockDate: Date` to `CalendarContent` interface
- [ ] Ensure no TypeScript errors after change
- [ ] Run `pnpm build` to verify types are correct

**Example**:
```typescript
export interface CalendarContent {
  day: number;
  type: ContentType;
  title: string;
  unlockDate: Date; // NEW
  // ... existing fields
}
```

**Acceptance**: Type definition updated without errors

---

### Step 2: Implement Unlock Validation Logic

#### 2.1 Create Calendar Utilities Module

**File**: `/src/lib/calendar.ts` (NEW)

- [ ] Create new file `/src/lib/calendar.ts`
- [ ] Implement `isWindowUnlocked(unlockDate: Date): boolean`
- [ ] Implement `getUnlockedCount(calendarContent: CalendarContent[]): number`
- [ ] Implement `getNextUnlockDate(calendarContent: CalendarContent[]): Date | null`
- [ ] Implement `getTimeUntilUnlock(unlockDate: Date): string`
- [ ] Implement `shouldBypassUnlockCheck(): boolean` (for dev mode)
- [ ] Add JSDoc comments to all functions
- [ ] Run `pnpm lint` to check code style

**Reference**: See detailed code in [feature-1-daily-unlocking.md](./feature-1-daily-unlocking.md#unlock-validation-logic)

**Acceptance**: All utility functions implemented and type-safe

---

#### 2.2 Add Development Environment Variable

**File**: `.env` (local only)

- [ ] Open or create `.env` file
- [ ] Add `DEV_UNLOCK_ALL=true` for testing
- [ ] Document this in README or comments
- [ ] Verify it's in `.gitignore` (don't commit `.env`)

**Example**:
```bash
# .env (local development only)
DEV_UNLOCK_ALL=true
```

**Acceptance**: Dev flag allows bypassing unlock checks locally

---

### Step 3: Update UI Components

#### 3.1 Update CalendarGrid Component

**File**: `/src/components/CalendarGrid.tsx`

- [ ] Import unlock utilities: `import { isWindowUnlocked, shouldBypassUnlockCheck } from '../lib/calendar'`
- [ ] Update `handleOpenWindow()` to check unlock status before opening
- [ ] Add early return if window is locked
- [ ] Pass `isUnlocked` prop to `CalendarWindow` component
- [ ] Calculate and display available vs opened count
- [ ] Run `pnpm build` to check for errors

**Key changes**:
```typescript
const handleOpenWindow = (day: number) => {
  const content = calendarContent.find(c => c.day === day);
  if (!content) return;

  // NEW: Check unlock status
  const unlocked = shouldBypassUnlockCheck() || isWindowUnlocked(content.unlockDate);
  if (!unlocked) {
    console.warn(`Window ${day} is locked`);
    return;
  }

  // ... existing open logic
};
```

- [ ] Test in browser that locked windows don't open

**Acceptance**: Locked windows cannot be opened

---

#### 3.2 Update CalendarWindow Component

**File**: `/src/components/CalendarWindow.tsx`

- [ ] Add `isUnlocked: boolean` to component props interface
- [ ] Add `disabled={!isUnlocked}` to button element
- [ ] Add conditional CSS classes for locked state
- [ ] Add lock icon SVG for locked windows
- [ ] Add unlock date display for locked windows
- [ ] Update aria-label to include locked status
- [ ] Run `pnpm build` and `pnpm lint`

**Visual states to implement**:
- Locked: opacity 0.5, grayscale, lock icon, unlock date
- Unlocked: normal appearance, clickable
- Opened: checkmark indicator

- [ ] Test visual appearance in browser

**Acceptance**: Locked and unlocked windows visually distinct

---

#### 3.3 Add Styling for Locked State

**File**: `/src/components/CalendarWindow.tsx` or global CSS

- [ ] Add CSS for `.calendar-window.locked`
- [ ] Style lock icon (`.lock-indicator`)
- [ ] Style unlock date label (`.unlock-date`)
- [ ] Style unlocked-clickable state (`.unlocked-clickable`)
- [ ] Test responsive design on mobile
- [ ] Verify hover states work only on unlocked windows

**Acceptance**: Styling matches design specifications

---

#### 3.4 Add Progress Indicator

**File**: `/src/components/CalendarGrid.tsx` or new component

- [ ] Import `getUnlockedCount` utility
- [ ] Calculate `availableCount`, `openedCount`, `totalCount`
- [ ] Add UI element displaying progress stats
- [ ] Style progress indicator
- [ ] Test that counts update correctly

**Example display**:
```
Available: 4/13
Opened: 2/4
```

**Acceptance**: Progress indicator shows correct counts

---

### Step 4: Handle Offline Sync

#### 4.1 Update Offline Sync Logic

**File**: `/src/lib/offlineSync.ts`

- [ ] Import `isWindowUnlocked` utility
- [ ] Update `syncPendingOpens()` to check unlock status before syncing
- [ ] Skip syncing locked windows with warning
- [ ] Test offline → online sync behavior

**Acceptance**: Only unlocked windows sync to database

---

### Step 5: Testing

#### 5.1 Unit Tests (Optional but Recommended)

**File**: `tests/lib/calendar.test.ts` (NEW)

- [ ] Create test file
- [ ] Write tests for `isWindowUnlocked()`
- [ ] Write tests for `getUnlockedCount()`
- [ ] Write tests for `getTimeUntilUnlock()`
- [ ] Run tests: `pnpm test` (if configured)

**Acceptance**: All unit tests pass

---

#### 5.2 Manual Testing

- [ ] **Test 1**: Set `DEV_UNLOCK_ALL=false`, verify all windows locked (if before Dec 12)
- [ ] **Test 2**: Set `DEV_UNLOCK_ALL=true`, verify all windows unlocked
- [ ] **Test 3**: Mock current date to Dec 15, verify windows 1-4 unlocked
- [ ] **Test 4**: Test locked window click → no modal opens
- [ ] **Test 5**: Test unlocked window click → modal opens
- [ ] **Test 6**: Verify progress indicator shows correct counts
- [ ] **Test 7**: Test on mobile device (responsive)
- [ ] **Test 8**: Test offline mode (windows open, sync when online)
- [ ] **Test 9**: Test accessibility (keyboard navigation, screen reader)

**Acceptance**: All manual tests pass

---

#### 5.3 Pre-Deployment Checks

- [ ] Run `pnpm lint` → All checks pass
- [ ] Run `pnpm build` → Build succeeds
- [ ] Run `pnpm preview` → Preview in browser
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Responsive on mobile
- [ ] Accessible via keyboard
- [ ] Works in Chrome, Firefox, Safari

**Acceptance**: Ready for deployment

---

### Step 6: Deployment

#### 6.1 Commit and Push

- [ ] Stage changes: `git add .`
- [ ] Commit with message: `git commit -m "feat(calendar): add daily window unlocking (Dec 12-24)"`
- [ ] Push to branch: `git push -u origin claude/advent-calendar-features-<session-id>`
- [ ] Verify GitHub Actions CI passes

**Acceptance**: Code pushed and CI passes

---

#### 6.2 Deploy to Production

- [ ] Merge to main branch (or deploy from feature branch)
- [ ] Deploy to Vercel
- [ ] Verify deployment succeeds
- [ ] Test production site
- [ ] Monitor error logs

**Acceptance**: Feature 1 live in production

---

## Phase 2: Feature 2 - Leaderboard System

**Priority**: MEDIUM (Before Dec 24, 2025)
**Estimated Time**: 1-2 development sessions

### Step 7: Database Setup

#### 7.1 Create Leaderboard View Migration

**File**: `/supabase/migrations/20251122000000_create_leaderboard_view.sql` (NEW)

- [ ] Create new migration file
- [ ] Add SQL for `leaderboard_window_13` view
- [ ] Add SQL for `leaderboard_statistics` view
- [ ] Add RLS policy for reading leaderboard
- [ ] Test SQL locally (optional: use Supabase CLI)

**Reference**: See SQL in [feature-2-leaderboard.md](./feature-2-leaderboard.md#database-schema)

**Acceptance**: Migration file created

---

#### 7.2 Apply Migration to Supabase

- [ ] Open Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Paste migration SQL
- [ ] Execute migration
- [ ] Verify views created successfully
- [ ] Test query: `SELECT * FROM leaderboard_window_13 LIMIT 10`
- [ ] Insert test data to verify ranking works

**Test data**:
```sql
INSERT INTO friend_window_opens (friend_id, window_number, opened_at)
VALUES
  ((SELECT id FROM friends LIMIT 1), 13, '2025-12-24 00:05:00');
```

**Acceptance**: Views working in Supabase

---

#### 7.3 Verify RLS Policies

- [ ] Check that authenticated users can read `friend_window_opens` where `window_number = 13`
- [ ] Check that authenticated users can read `friends` table (for names)
- [ ] Test query as authenticated user
- [ ] Test query as anonymous user (should fail)

**Acceptance**: RLS policies configured correctly

---

### Step 8: Create Leaderboard API

#### 8.1 Create Type Definitions

**File**: `/src/types/leaderboard.ts` (NEW)

- [ ] Create new file
- [ ] Define `LeaderboardEntry` interface
- [ ] Define `LeaderboardStatistics` interface
- [ ] Define `LeaderboardDisplayProps` interface (if needed)
- [ ] Run `pnpm build` to verify types

**Reference**: See types in [feature-2-leaderboard.md](./feature-2-leaderboard.md#type-definitions)

**Acceptance**: Types defined without errors

---

#### 8.2 Implement Leaderboard Utilities

**File**: `/src/lib/leaderboard.ts` (NEW)

- [ ] Create new file
- [ ] Import types from `/src/types/leaderboard`
- [ ] Implement `getLeaderboard(limit?: number)`
- [ ] Implement `getTopN(n?: number)`
- [ ] Implement `getUserRank(friendId: string)`
- [ ] Implement `getLeaderboardStatistics()`
- [ ] Implement `formatTimeFromUnlock(seconds: number)`
- [ ] Implement `hasUserCompleted(friendId: string)`
- [ ] Add JSDoc comments
- [ ] Run `pnpm lint`

**Reference**: See implementation in [feature-2-leaderboard.md](./feature-2-leaderboard.md#api-functions)

**Acceptance**: All leaderboard functions implemented

---

#### 8.3 Test Leaderboard API

- [ ] Create temporary test page or component
- [ ] Call `getLeaderboard()` and log results
- [ ] Call `getUserRank()` with test user ID
- [ ] Call `getLeaderboardStatistics()`
- [ ] Verify data returned correctly
- [ ] Verify formatting functions work

**Acceptance**: API functions return correct data

---

### Step 9: Build Leaderboard UI

#### 9.1 Create Leaderboard Component

**File**: `/src/components/Leaderboard.tsx` (NEW)

- [ ] Create new file
- [ ] Import leaderboard utilities
- [ ] Implement component state (entries, userEntry, statistics, loading, error)
- [ ] Implement `loadLeaderboard()` function
- [ ] Implement auto-refresh logic (every 30s on Dec 24)
- [ ] Implement UI rendering:
  - [ ] Header with title
  - [ ] Statistics bar
  - [ ] User rank card (if not in top 10)
  - [ ] Top 10 leaderboard list
  - [ ] Refresh button
  - [ ] Empty state
  - [ ] Error state
- [ ] Run `pnpm build` and `pnpm lint`

**Reference**: See component code in [feature-2-leaderboard.md](./feature-2-leaderboard.md#react-component)

**Acceptance**: Component renders without errors

---

#### 9.2 Add Leaderboard Styling

**File**: `/src/components/Leaderboard.tsx` or global CSS

- [ ] Add CSS for `.leaderboard-container`
- [ ] Add CSS for `.leaderboard-header`
- [ ] Add CSS for `.leaderboard-stats`
- [ ] Add CSS for `.user-rank-card`
- [ ] Add CSS for `.leaderboard-list` and `.entries`
- [ ] Add CSS for `.entry`, `.podium`, `.current-user`
- [ ] Add CSS for `.empty-state` and error states
- [ ] Add responsive styles for mobile
- [ ] Test visual appearance in browser

**Acceptance**: Leaderboard looks good on desktop and mobile

---

#### 9.3 Create Leaderboard Page

**File**: `/src/pages/leaderboard.astro` (NEW)

- [ ] Create new file
- [ ] Import `Leaderboard` component
- [ ] Import `isAuthenticated` from auth lib
- [ ] Add authentication check
- [ ] Redirect to `/login` if not authenticated
- [ ] Render `Leaderboard` component with `client:load`
- [ ] Run `pnpm build`

**Example structure**:
```astro
---
import Layout from '../layouts/Layout.astro';
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

**Acceptance**: Leaderboard page accessible at `/leaderboard`

---

### Step 10: Integration & Polish

#### 10.1 Add Achievement Trigger

**File**: `/src/components/CalendarGrid.tsx`

- [ ] Update `handleOpenWindow()` to detect window 13 unlock
- [ ] Show achievement message/modal when window 13 opened
- [ ] Optionally prompt user to view leaderboard
- [ ] Add confetti or celebration animation (optional)
- [ ] Test in browser

**Example**:
```typescript
if (day === 13) {
  console.log('🎉 Calendar completed!');
  setTimeout(() => {
    if (confirm('View leaderboard?')) {
      window.location.href = '/leaderboard';
    }
  }, 2000);
}
```

**Acceptance**: Window 13 completion triggers achievement

---

#### 10.2 Add Navigation Link (Optional)

**File**: Navigation component or header

- [ ] Add link to `/leaderboard` in main navigation
- [ ] Add trophy emoji or icon
- [ ] Test link works
- [ ] Style navigation item

**Acceptance**: Users can easily navigate to leaderboard

---

#### 10.3 Add Admin Dashboard Link (Optional)

**File**: `/src/components/AdminDashboard.tsx`

- [ ] Add link or section for leaderboard
- [ ] Display top 5 or link to full leaderboard
- [ ] Test in admin view

**Acceptance**: Admin can access leaderboard from dashboard

---

### Step 11: Testing

#### 11.1 Unit Tests (Optional)

**File**: `tests/lib/leaderboard.test.ts` (NEW)

- [ ] Create test file
- [ ] Write tests for `formatTimeFromUnlock()`
- [ ] Write tests for other utility functions
- [ ] Run tests: `pnpm test`

**Acceptance**: All unit tests pass

---

#### 11.2 Manual Testing

- [ ] **Test 1**: Empty leaderboard (no completions) → shows empty state
- [ ] **Test 2**: Single completion → shows rank #1
- [ ] **Test 3**: Multiple completions → correct ranking order
- [ ] **Test 4**: Current user in top 10 → highlighted in list
- [ ] **Test 5**: Current user outside top 10 → shows in user rank card
- [ ] **Test 6**: Auto-refresh on Dec 24 → updates every 30s
- [ ] **Test 7**: Unauthenticated access → redirects to login
- [ ] **Test 8**: Mobile responsive → looks good
- [ ] **Test 9**: Accessibility → keyboard navigation works
- [ ] **Test 10**: Performance → loads quickly with 100+ entries

**Acceptance**: All manual tests pass

---

#### 11.3 Pre-Deployment Checks

- [ ] Run `pnpm lint` → All checks pass
- [ ] Run `pnpm build` → Build succeeds
- [ ] Run `pnpm preview` → Preview in browser
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Responsive design works
- [ ] Accessible via keyboard

**Acceptance**: Ready for deployment

---

### Step 12: Deployment

#### 12.1 Commit and Push

- [ ] Stage changes: `git add .`
- [ ] Commit: `git commit -m "feat(leaderboard): add window 13 completion leaderboard"`
- [ ] Push: `git push -u origin claude/advent-calendar-features-<session-id>`
- [ ] Verify CI passes

**Acceptance**: Code pushed and CI passes

---

#### 12.2 Deploy to Production

- [ ] Merge to main (or deploy from feature branch)
- [ ] Deploy to Vercel
- [ ] Verify deployment succeeds
- [ ] Test production site
- [ ] Verify leaderboard accessible at `/leaderboard`
- [ ] Monitor error logs

**Acceptance**: Feature 2 live in production

---

## Phase 3: Post-Deployment

### Step 13: Monitoring & Validation

#### 13.1 Monitor Production

- [ ] Check Supabase logs for errors
- [ ] Check Vercel logs for errors
- [ ] Monitor page load times
- [ ] Check database query performance
- [ ] Watch for user feedback

**Acceptance**: No critical errors in production

---

#### 13.2 User Acceptance Testing

- [ ] Test with real users (internal team first)
- [ ] Collect feedback on unlock mechanic
- [ ] Collect feedback on leaderboard
- [ ] Identify any usability issues
- [ ] Document bugs or enhancement requests

**Acceptance**: Users can successfully use both features

---

#### 13.3 Pre-Launch Preparation

Before December 12, 2025:

- [ ] Verify all 13 windows have content
- [ ] Verify unlock dates are correct (Dec 12-24)
- [ ] Test that window 1 unlocks at midnight Dec 12
- [ ] Announce leaderboard to users
- [ ] Prepare support documentation/FAQ
- [ ] Monitor closely on Dec 12 launch day

**Acceptance**: Confident in launch readiness

---

## Rollback Plan

If critical issues occur:

### Emergency Unlock (Feature 1)

If unlock mechanic breaks:

- [ ] Set environment variable: `PUBLIC_EMERGENCY_UNLOCK=true`
- [ ] Deploy immediately
- [ ] All windows unlock (reverts to old behavior)
- [ ] Debug issue offline
- [ ] Remove flag when fixed

### Disable Leaderboard (Feature 2)

If leaderboard has critical bugs:

- [ ] Remove `/leaderboard` route temporarily
- [ ] Hide navigation links
- [ ] Display maintenance message
- [ ] Fix issue
- [ ] Re-enable when ready

---

## Final Pre-Launch Checklist

**Complete before December 12, 2025:**

### Feature 1 (Daily Unlocking)
- [ ] All 13 windows have content
- [ ] Unlock dates set correctly (Dec 12-24, 2025)
- [ ] Visual states (locked/unlocked) work correctly
- [ ] Progress indicator accurate
- [ ] Offline sync respects unlock dates
- [ ] No TypeScript/ESLint errors
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile (iOS, Android)
- [ ] Accessible (keyboard, screen reader)
- [ ] Performance acceptable (< 2s load time)

### Feature 2 (Leaderboard)
- [ ] Database views working
- [ ] RLS policies correct
- [ ] Leaderboard API functions working
- [ ] Leaderboard UI complete
- [ ] Auto-refresh on Dec 24 works
- [ ] Achievement trigger on window 13 works
- [ ] Navigation links added
- [ ] No TypeScript/ESLint errors
- [ ] Tested with sample data
- [ ] Performance acceptable (< 100ms queries)

### General
- [ ] All code in version control
- [ ] CI/CD pipeline passing
- [ ] Deployed to production
- [ ] Monitoring in place
- [ ] Documentation updated
- [ ] Team trained on features
- [ ] Support prepared for user questions
- [ ] Rollback plan documented and ready

---

## Success Criteria

Both features are considered successful if:

### Feature 1: Daily Unlocking
- ✅ Users can only open unlocked windows (based on date)
- ✅ Locked windows clearly indicated visually
- ✅ No user confusion about unlock mechanic
- ✅ < 1% error rate on window opens
- ✅ Works offline

### Feature 2: Leaderboard
- ✅ Accurate ranking of window 13 completions
- ✅ Top 10 displayed correctly
- ✅ Users can see their rank
- ✅ Page loads quickly (< 2s)
- ✅ No RLS policy violations
- ✅ Users find it engaging

---

## Post-Launch Monitoring

**First week after Dec 12 launch:**

- [ ] Daily check of error logs
- [ ] Monitor unlock patterns (are users opening on schedule?)
- [ ] Collect user feedback
- [ ] Check for any abuse/cheating
- [ ] Verify leaderboard accuracy
- [ ] Address any bugs promptly

**December 24 (race day):**

- [ ] Monitor leaderboard performance closely
- [ ] Watch for auto-refresh issues
- [ ] Check database query performance
- [ ] Be ready for high traffic
- [ ] Celebrate with users! 🎉

---

## Documentation Updates

After implementation:

- [ ] Update main README with new features
- [ ] Update user guide/FAQ
- [ ] Document any environment variables
- [ ] Document database schema changes
- [ ] Update API documentation (if applicable)
- [ ] Create demo video or screenshots

---

## Questions & Support

If you encounter issues during implementation:

1. **Check planning docs**: Review detailed feature plans
2. **Check codebase**: Reference existing patterns in `/src/components`, `/src/lib`
3. **Check Supabase docs**: For database/RLS issues
4. **Check Astro docs**: For framework-specific questions
5. **Ask for help**: Document blockers and questions

---

## Appendix: Quick Reference Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Check for issues
pnpm lint:fix     # Auto-fix issues

# Git
git status
git add .
git commit -m "feat(calendar): implement feature"
git push -u origin <branch-name>

# Testing dates (in browser console)
# Mock current date for testing
Object.defineProperty(Date.prototype, 'constructor', {
  value: function() { return new Date('2025-12-15T10:00:00'); }
});
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Status**: Ready for Use

**Good luck with implementation! 🚀**
