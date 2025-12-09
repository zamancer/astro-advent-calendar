# Feature 1: Daily Window Unlocking

**Feature ID**: F1-DAILY-UNLOCK
**Priority**: HIGH (Must ship before Dec 12, 2025)
**Status**: Planning

## Overview

Transform the advent calendar from an "open anytime" model to a time-gated progression system where users can unlock one window per day from December 12-24, 2025.

---

## User Stories

### Primary User Story
```
As a calendar user,
I want to unlock one window per day starting December 12,
So that I experience the advent calendar as a daily surprise game.
```

**Acceptance Criteria**:
- [ ] Windows unlock at midnight (00:00) local time starting Dec 12
- [ ] Window 1 unlocks Dec 12, Window 2 unlocks Dec 13, ..., Window 13 unlocks Dec 24
- [ ] Locked windows are visually distinct and not clickable
- [ ] Users can see when future windows will unlock
- [ ] Users can catch up on missed windows (all past windows are unlocked)
- [ ] Works offline using localStorage date checks

### Secondary User Story
```
As a calendar user,
I want clear visual feedback about which windows I can open,
So that I'm not confused or frustrated by the unlocking system.
```

**Acceptance Criteria**:
- [ ] Locked windows show lock icon and unlock date
- [ ] Unlocked windows have normal appearance
- [ ] Hover states only active on unlocked windows
- [ ] Progress tracker shows "X/13 unlocked" and "Y/13 available"

---

## Technical Specification

### Calendar Configuration

#### Update Type Definitions

**File**: `/src/types/calendar.ts`

Add `unlockDate` to the `CalendarContent` interface:

```typescript
export interface CalendarContent {
  day: number;
  type: ContentType;
  title: string;
  unlockDate: Date; // NEW: When this window becomes available
  // ... existing fields
}
```

### Unlock Validation Logic

Create new utility module for date/unlock logic.

**File**: `/src/lib/calendar.ts` (NEW)

```typescript
import type { CalendarContent } from '../types/calendar';

/**
 * Checks if a window is currently unlocked based on date
 * @param unlockDate - The date when the window unlocks
 * @returns true if window is unlocked (current time >= unlock time)
 */
export function isWindowUnlocked(unlockDate: Date): boolean {
  const now = new Date();
  return now >= unlockDate;
}

/**
 * Gets the number of currently unlocked windows
 * @param calendarContent - Array of calendar content configs
 * @returns Count of windows that are currently unlocked
 */
export function getUnlockedCount(calendarContent: CalendarContent[]): number {
  return calendarContent.filter(content =>
    isWindowUnlocked(content.unlockDate)
  ).length;
}

/**
 * Gets the next window that will unlock
 * @param calendarContent - Array of calendar content configs
 * @returns Next unlock date or null if all unlocked
 */
export function getNextUnlockDate(calendarContent: CalendarContent[]): Date | null {
  const now = new Date();
  const futureWindows = calendarContent
    .filter(content => content.unlockDate > now)
    .sort((a, b) => a.unlockDate.getTime() - b.unlockDate.getTime());

  return futureWindows.length > 0 ? futureWindows[0].unlockDate : null;
}

/**
 * Formats time remaining until unlock
 * @param unlockDate - The date when window unlocks
 * @returns Human-readable string like "2 days 5 hours"
 */
export function getTimeUntilUnlock(unlockDate: Date): string {
  const now = new Date();
  const diff = unlockDate.getTime() - now.getTime();

  if (diff <= 0) return 'Available now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours}h`;
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}

/**
 * DEV MODE ONLY: Override unlock checks for testing
 * Set via environment variable DEV_UNLOCK_ALL=true
 */
export function shouldBypassUnlockCheck(): boolean {
  return import.meta.env.DEV && import.meta.env.DEV_UNLOCK_ALL === 'true';
}
```

**Testing utilities** (for development/testing):

```typescript
/**
 * TEST HELPER: Simulate current date for testing
 * Use in tests to mock "today's date"
 */
export function setMockCurrentDate(date: Date): void {
  // Store in globalThis for test access
  (globalThis as any).__MOCK_DATE__ = date;
}

export function getCurrentDate(): Date {
  const mockDate = (globalThis as any).__MOCK_DATE__;
  return mockDate || new Date();
}
```

### Component Updates

#### CalendarGrid Component

**File**: `/src/components/CalendarGrid.tsx`

Update the `handleOpenWindow` function to check unlock status:

```typescript
import { isWindowUnlocked, shouldBypassUnlockCheck } from '../lib/calendar';

// Inside CalendarGrid component:

const handleOpenWindow = (day: number) => {
  const content = calendarContent.find(c => c.day === day);
  if (!content) return;

  // NEW: Check if window is unlocked
  const unlocked = shouldBypassUnlockCheck() || isWindowUnlocked(content.unlockDate);
  if (!unlocked) {
    console.warn(`Window ${day} is locked until ${content.unlockDate}`);
    return; // Don't open locked windows
  }

  // Existing logic: update state, record open, show modal
  setOpenedDays(prev => {
    const newSet = new Set(prev);
    newSet.add(day);
    saveLocalProgress(newSet);
    return newSet;
  });

  recordWindowOpen({
    friend_id: currentFriendId,
    window_number: day,
  }).then(({ error }) => {
    // ... existing error handling
  });

  setSelectedContent(content);
  setIsModalOpen(true);
};
```

**Pass unlock status to CalendarWindow**:

```typescript
// In CalendarGrid's render:
{calendarContent.map((content) => {
  const isOpen = openedDays.has(content.day);
  const isUnlocked = shouldBypassUnlockCheck() || isWindowUnlocked(content.unlockDate);

  return (
    <CalendarWindow
      key={content.day}
      day={content.day}
      content={content}
      isOpen={isOpen}
      isUnlocked={isUnlocked} // NEW PROP
      onClick={() => handleOpenWindow(content.day)}
    />
  );
})}
```

#### CalendarWindow Component

**File**: `/src/components/CalendarWindow.tsx`

Add visual states for locked vs unlocked windows:

```typescript
interface CalendarWindowProps {
  day: number;
  content: CalendarContent;
  isOpen: boolean;
  isUnlocked: boolean; // NEW
  onClick: () => void;
}

export function CalendarWindow({
  day,
  content,
  isOpen,
  isUnlocked,
  onClick
}: CalendarWindowProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked} // NEW: Disable locked windows
      className={`
        calendar-window
        ${isOpen ? 'opened' : ''}
        ${!isUnlocked ? 'locked' : ''}
        ${isUnlocked && !isOpen ? 'unlocked-clickable' : ''}
      `}
      aria-label={`Window ${day}${!isUnlocked ? ' (locked)' : ''}${isOpen ? ' (opened)' : ''}`}
    >
      <div className="window-number">{day}</div>

      {/* NEW: Lock icon for locked windows */}
      {!isUnlocked && (
        <div className="lock-indicator">
          <svg className="w-6 h-6" /* lock icon SVG */>
            <path d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3z"/>
          </svg>
        </div>
      )}

      {/* NEW: Unlock date for locked windows */}
      {!isUnlocked && (
        <div className="unlock-date">
          {content.unlockDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )}

      {/* Existing: Checkmark for opened windows */}
      {isOpen && (
        <div className="opened-indicator">✓</div>
      )}
    </button>
  );
}
```

**Styling** (add to component or global styles):

```css
/* Locked window state */
.calendar-window.locked {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
  pointer-events: none; /* Prevent all interactions */
}

.calendar-window.locked:hover {
  transform: none; /* Disable hover effects */
}

/* Unlocked but not opened - add subtle highlight */
.calendar-window.unlocked-clickable {
  border: 2px solid var(--accent-color);
  box-shadow: 0 0 10px rgba(var(--accent-color-rgb), 0.3);
}

/* Lock icon styling */
.lock-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #666;
}

/* Unlock date label */
.unlock-date {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #888;
  white-space: nowrap;
}
```

#### Progress Indicator Enhancement

**File**: `/src/components/CalendarGrid.tsx` or new component

Add a progress display showing available vs opened:

```typescript
import { getUnlockedCount } from '../lib/calendar';

// Inside component:
const availableCount = getUnlockedCount(calendarContent);
const openedCount = openedDays.size;
const totalCount = calendarContent.length;

return (
  <div className="calendar-container">
    {/* NEW: Progress stats */}
    <div className="calendar-progress">
      <div className="progress-stat">
        <span className="stat-label">Available:</span>
        <span className="stat-value">{availableCount}/{totalCount}</span>
      </div>
      <div className="progress-stat">
        <span className="stat-label">Opened:</span>
        <span className="stat-value">{openedCount}/{availableCount}</span>
      </div>
    </div>

    {/* Existing grid */}
    <div className="calendar-grid">
      {/* ... windows */}
    </div>
  </div>
);
```

### Offline Support

**File**: `/src/lib/offlineSync.ts`

Update offline sync to respect unlock dates:

```typescript
import { isWindowUnlocked } from './calendar';

export async function syncPendingOpens() {
  const pending = getPendingOpens();

  for (const open of pending) {
    const content = getContentForDay(open.window_number);

    // NEW: Verify window is still unlocked before syncing
    if (!content || !isWindowUnlocked(content.unlockDate)) {
      console.warn(`Skipping sync for locked window ${open.window_number}`);
      continue;
    }

    // Existing sync logic...
  }
}
```

**Edge case handling**:
- User opens window while online → goes offline → date passes → comes back online
- Should still sync the open (it was valid when performed)
- Store timestamp of when window was opened locally to validate

### Environment Configuration

**File**: `.env` (for development)

Add development flag to bypass unlock checks:

```bash
# Development only: Unlock all windows for testing
DEV_UNLOCK_ALL=true
```

**Usage in code**:
```typescript
if (import.meta.env.DEV && import.meta.env.DEV_UNLOCK_ALL === 'true') {
  // Bypass unlock checks
}
```

---

## Database Considerations

### Option A: No Database Changes (Recommended)
- Store unlock dates in frontend configuration only
- Validation happens client-side
- Simpler implementation, faster to ship
- Aligns with offline-first architecture

**Pros**:
- ✅ No migration needed
- ✅ Faster development
- ✅ Works offline seamlessly
- ✅ Easy to adjust dates if needed

**Cons**:
- ❌ Users could bypass by changing system clock (acceptable risk)
- ❌ No server-side enforcement (can add later if needed)

### Option B: Add Unlock Dates to Database (Future Enhancement)
If server-side validation becomes necessary:

```sql
-- Add unlock_date column to calendar configuration table
ALTER TABLE calendar_windows
ADD COLUMN unlock_date TIMESTAMP NOT NULL DEFAULT NOW();

-- Create function to validate window opens
CREATE OR REPLACE FUNCTION validate_window_open()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.opened_at < (
    SELECT unlock_date FROM calendar_windows
    WHERE window_number = NEW.window_number
  ) THEN
    RAISE EXCEPTION 'Window % is not yet unlocked', NEW.window_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to friend_window_opens
CREATE TRIGGER check_window_unlocked
BEFORE INSERT ON friend_window_opens
FOR EACH ROW
EXECUTE FUNCTION validate_window_open();
```

**Decision**: Start with **Option A**, implement **Option B** only if abuse detected.

---

## Testing Plan

### Unit Tests

Test the unlock validation logic:

```typescript
// tests/lib/calendar.test.ts
import { describe, it, expect } from 'vitest';
import { isWindowUnlocked, getUnlockedCount } from '../src/lib/calendar';

describe('isWindowUnlocked', () => {
  it('returns true for past unlock dates', () => {
    const pastDate = new Date('2020-01-01');
    expect(isWindowUnlocked(pastDate)).toBe(true);
  });

  it('returns false for future unlock dates', () => {
    const futureDate = new Date('2099-12-31');
    expect(isWindowUnlocked(futureDate)).toBe(false);
  });

  it('returns true for current moment', () => {
    const now = new Date();
    expect(isWindowUnlocked(now)).toBe(true);
  });
});

describe('getUnlockedCount', () => {
  it('counts only unlocked windows', () => {
    const content = [
      { day: 1, unlockDate: new Date('2020-01-01') }, // past = unlocked
      { day: 2, unlockDate: new Date('2099-01-01') }, // future = locked
      { day: 3, unlockDate: new Date('2020-01-01') }, // past = unlocked
    ];
    expect(getUnlockedCount(content)).toBe(2);
  });
});
```

### Integration Tests

Test the UI behavior:

```typescript
// tests/components/CalendarWindow.test.tsx
import { render, screen } from '@testing-library/react';
import { CalendarWindow } from '../src/components/CalendarWindow';

it('disables locked windows', () => {
  render(
    <CalendarWindow
      day={1}
      content={mockContent}
      isOpen={false}
      isUnlocked={false}
      onClick={mockOnClick}
    />
  );

  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(button).toHaveClass('locked');
});

it('enables unlocked windows', () => {
  render(
    <CalendarWindow
      day={1}
      content={mockContent}
      isOpen={false}
      isUnlocked={true}
      onClick={mockOnClick}
    />
  );

  const button = screen.getByRole('button');
  expect(button).not.toBeDisabled();
  expect(button).not.toHaveClass('locked');
});
```

### Manual Testing Scenarios

#### Scenario 1: Before Dec 12, 2025
- **Expected**: All windows locked
- **Verify**: No windows clickable, all show lock icons

#### Scenario 2: December 15, 2025
- **Expected**: Windows 1-4 unlocked (Dec 12, 13, 14, 15)
- **Verify**: Windows 1-4 clickable, windows 5-13 locked

#### Scenario 3: December 24, 2025
- **Expected**: All windows unlocked
- **Verify**: All 13 windows clickable

#### Scenario 4: Development Mode
- **Set**: `DEV_UNLOCK_ALL=true`
- **Expected**: All windows unlocked regardless of date
- **Verify**: Can test all windows in development

#### Scenario 5: Offline Behavior
- **Steps**:
  1. Go offline
  2. Try to open locked window → blocked
  3. Try to open unlocked window → succeeds
  4. Go online → syncs only valid opens
- **Verify**: Locked windows not synced to database

#### Scenario 6: Timezone Edge Cases
- **Test**: Open app at 11:59 PM, wait until 12:00 AM
- **Expected**: New window unlocks at midnight
- **Verify**: Window becomes available without refresh (or on refresh)

### Accessibility Testing

- [ ] Locked windows have aria-label indicating locked status
- [ ] Keyboard navigation skips locked windows or clearly indicates they're locked
- [ ] Screen reader announces "locked" and unlock date
- [ ] Focus states visible on unlocked windows only
- [ ] Color contrast meets WCAG AA standards for locked state

### Performance Testing

- [ ] Calendar renders quickly with all windows locked
- [ ] Date checks don't cause re-renders
- [ ] No performance degradation on mobile devices

---

## Edge Cases & Error Handling

### Edge Case 1: User Changes System Clock
**Scenario**: User sets clock forward to unlock future windows

**Handling**:
- Client-side validation only, so this is possible
- Accept as acceptable risk (offline-first tradeoff)
- If becomes issue, add server-side validation (Option B)

**Mitigation**:
- Store `opened_at` timestamp when window opened locally
- Server can validate timestamp is after unlock date when syncing

### Edge Case 2: Browser Timezone Changes
**Scenario**: User travels across timezones

**Handling**:
- Unlock dates interpreted in current timezone
- Window might unlock earlier/later than expected
- This is expected behavior (follows user's local time)

**Mitigation**:
- Document in FAQ that unlocks are local midnight
- Consider adding timezone indicator in UI (optional)

### Edge Case 3: User Opens Window Just Before Midnight
**Scenario**: User opens window at 11:59:59 PM on unlock day

**Handling**:
- Window is unlocked, open succeeds
- Timestamp recorded accurately in database
- No issues expected

### Edge Case 4: Offline for Multiple Days
**Scenario**: User goes offline Dec 12, comes back online Dec 20

**Handling**:
- All windows 1-9 should be unlocked when they return
- User can catch up on all missed windows
- Sync all opens to database when online

### Edge Case 5: January 2026 Access
**Scenario**: User accesses calendar after December 24, 2025

**Handling**:
- All windows remain unlocked
- User can view all content
- Leaderboard shows final rankings

---

## Content Requirements

### Window 13 Content Needs
- **Type**: Message (recommended for finale)
- **Title**: "Christmas Eve" or custom
- **Content**: Special message, image, or video
- **Deadline**: Before December 12, 2025

**Action item**: Coordinate with content creator for window 13 material.

---

## Deployment Checklist

### Pre-Deployment
- [ ] All 13 windows have content configured
- [ ] Unlock dates set correctly (Dec 12-24, 2025)
- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Visual regression testing complete
- [ ] Accessibility audit passed
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing (iOS, Android)

### Deployment
- [ ] Deploy to staging environment
- [ ] Test with real dates using system clock
- [ ] Verify locked windows not clickable
- [ ] Verify unlocked windows work correctly
- [ ] Test offline mode
- [ ] Deploy to production
- [ ] Monitor error logs for issues

### Post-Deployment
- [ ] Verify Dec 12 unlock works correctly (midnight local time)
- [ ] Monitor user feedback
- [ ] Check error rates in Supabase
- [ ] Ensure no sync failures

---

## Rollback Plan

If critical issues arise post-deployment:

### Quick Fix: Unlock All Windows
```typescript
// In calendar-content.ts, set all unlock dates to past:
export const defaultCalendarContent: CalendarContent[] = [
  { day: 1, unlockDate: new Date('2020-01-01'), /* ... */ },
  // ... all dates in past
];
```

**Deploy time**: ~5 minutes
**Impact**: Reverts to "open anytime" behavior

### Alternative: Disable Unlock Checks
```typescript
// Add to shouldBypassUnlockCheck():
export function shouldBypassUnlockCheck(): boolean {
  // Emergency unlock all
  if (import.meta.env.PUBLIC_EMERGENCY_UNLOCK === 'true') {
    return true;
  }
  return import.meta.env.DEV && import.meta.env.DEV_UNLOCK_ALL === 'true';
}
```

Set environment variable in Vercel: `PUBLIC_EMERGENCY_UNLOCK=true`

---

## Success Metrics

### Quantitative
- **Window open rate**: % of users who open windows on unlock day
- **Catch-up rate**: % of users who open missed windows
- **Error rate**: < 1% of window open attempts fail
- **Performance**: Calendar loads in < 2 seconds on 3G

### Qualitative
- User feedback is positive about unlock mechanic
- No confusion about when windows unlock
- Visual design clearly communicates locked/unlocked state

---

## Future Enhancements

### Phase 2 Improvements (Post-MVP)
1. **Countdown timers**: Show "Unlocks in 5 hours" on locked windows
2. **Notifications**: Browser notifications when new window unlocks
3. **Server-side validation**: Add database-level unlock date enforcement
4. **Admin controls**: Allow admins to manually unlock windows early
5. **Custom unlock times**: Different unlock times (e.g., 6 AM instead of midnight)
6. **Animated unlocks**: Visual animation when window unlocks at midnight

---

## Dependencies

### Required Before Implementation
- [ ] Content for windows created
- [ ] Design approval for locked window visuals
- [ ] Decision on catch-up mechanic (allow or not)

### No External Dependencies
- No new packages required
- Uses existing Supabase setup
- Uses existing TypeScript/React stack

---

## Questions & Decisions Log

| Question | Decision | Date | Rationale |
|----------|----------|------|-----------|
| 12 or 13 windows? | 12 (Dec 13-24) | 2025-11-22 | Not matching original Dec 12-24 range exactly, but works |
| Local or UTC time? | Local time | 2025-11-22 | Better UX, intuitive |
| Client or server validation? | Client-side only (for now) | 2025-11-22 | Simpler, offline-first |
| Allow catch-up? | Yes | 2025-11-22 | Better UX, less frustration |
| Window numbering? | 1-12 (not 13-24) | 2025-11-22 | Simpler implementation |

---

## Related Files

### Files to Create
- `/src/lib/calendar.ts` - Unlock validation logic

### Files to Modify
- `/src/config/calendar-content.ts` - Add window 13 + unlock dates
- `/src/types/calendar.ts` - Add unlockDate field
- `/src/components/CalendarGrid.tsx` - Add unlock checks
- `/src/components/CalendarWindow.tsx` - Add locked/unlocked visuals
- `/src/lib/offlineSync.ts` - Respect unlock dates in sync

### Files to Reference
- `/src/lib/database.ts` - Existing window open logic
- `/src/lib/storage.ts` - LocalStorage utilities

---

**Document Version**: 1.0
**Last Updated**: 2025-11-22
**Status**: Ready for Implementation
