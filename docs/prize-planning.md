# Advent Calendar Contest & Prize Planning

## Overview

A friendly competition among 2-5 friends with Amazon gift card prizes for the top 3 participants. The system rewards both **speed** (opening windows quickly after unlock) and **consistency** (engaging with the calendar daily).

## Prize Structure

| Place | Prize                |
| ----- | -------------------- |
| 1st   | $50 Amazon gift card |
| 2nd   | $25 Amazon gift card |
| 3rd   | $10 Amazon gift card |

> **Note:** Adjust amounts as desired. Total: $85

---

## Scoring System

### Base Points

- **Opening any window**: 10 points

### Speed Bonuses (per window)

Awarded based on `seconds_after_unlock` ranking:

- **1st to open**: +5 points (15 total)
- **2nd to open**: +3 points (13 total)
- **3rd to open**: +1 point (11 total)
- **4th+ to open**: No bonus (10 total)

### Streak Bonus

- **Perfect attendance** (all 12 windows): +20 bonus points

### Point Ranges

With 12 windows:

- **Maximum possible**: 12 × 15 + 20 = **200 points** (all 1st places + perfect streak)
- **All participation + streak**: 12 × 10 + 20 = **140 points**
- **Casual participation** (8 windows, no speed bonuses): 80 points

---

## Example Scenarios

### Scenario A: Speed Demon

Opens 10 windows, gets 1st place 8 times, 2nd place twice:

- 10 × 10 (base) + 8 × 5 (1st bonus) + 2 × 3 (2nd bonus) = 100 + 40 + 6 = **146 points**

### Scenario B: Consistent Player

Opens all 12 windows, gets 2nd or 3rd place most days:

- 12 × 10 (base) + 6 × 3 (2nd) + 6 × 1 (3rd) + 20 (streak) = 120 + 18 + 6 + 20 = **164 points**

This demonstrates the balanced nature: consistency can beat speed.

---

## Tiebreaker Rules

1. **Total speed score**: Sum of all `seconds_after_unlock` values (lower wins)
2. **Number of 1st place finishes**
3. **Earliest final window open**

---

## Technical Implementation

### Database Changes

Add a `contest_points` view or materialized view:

```sql
CREATE VIEW contest_leaderboard AS
SELECT
  f.id as friend_id,
  f.name,
  COUNT(fwo.id) as windows_opened,
  SUM(
    10 + -- base points
    CASE
      WHEN fwo.rank = 1 THEN 5
      WHEN fwo.rank = 2 THEN 3
      WHEN fwo.rank = 3 THEN 1
      ELSE 0
    END
  ) as points,
  CASE WHEN COUNT(fwo.id) = 12 THEN 20 ELSE 0 END as streak_bonus
FROM friends f
LEFT JOIN (
  SELECT
    *,
    RANK() OVER (PARTITION BY window_number ORDER BY seconds_after_unlock) as rank
  FROM friend_window_opens
) fwo ON f.id = fwo.friend_id
WHERE f.is_admin = false
GROUP BY f.id, f.name;
```

### New Components Needed

1. **LeaderboardDisplay.tsx** - Public leaderboard component

   - Shows current standings with points breakdown
   - Real-time updates via Supabase subscription
   - Mobile-friendly design

2. **Database function** - `get_contest_leaderboard()`
   - Returns ranked participants with point breakdown
   - Handles tiebreakers

### Files to Modify

- `src/types/database.ts` - Add leaderboard types
- `src/lib/database.ts` - Add leaderboard query function
- `src/components/` - Add LeaderboardDisplay component
- `src/pages/` - Add leaderboard page (or integrate into existing)
- `supabase/migrations/` - Add contest view

### UI Placement Options

#### Option A: Dedicated leaderboard page

- `/leaderboard` route
- Link from main calendar page
- Full standings and breakdown

#### Option B: Inline on calendar page

- Compact leaderboard widget
- Shows top 3 with current points
- "View full leaderboard" link

#### Option C: Both (Recommended)

- Widget on calendar for quick glance
- Full page for detailed breakdown

---

## Display Features

### Leaderboard Widget

- Rank, Name, Points
- Visual indicator for prize positions (gold/silver/bronze)
- Current user highlighted
- Points trend (up/down arrow)

### Detailed View

- Points breakdown (base + speed bonuses + streak)
- Number of 1st/2nd/3rd place finishes
- Windows opened count
- Total reaction time (sum of seconds_after_unlock)

---

## Contest Instructions (Calendar Page)

Users need to understand how the contest works. Add an instructions section accessible from the main calendar page.

### Content to Display

We won't reveal the exact prize, but will announce there will be more than one single winner.

```text
🏆 Advent Calendar Contest

WIN A SPECIAL PRIZE!
1st Place, 2nd Place, and 3rd Place will get a gift!

HOW TO EARN POINTS:
• Open a window: 10 points
• First to open: +5 bonus
• Second to open: +3 bonus
• Third to open: +1 bonus
• Open all 12 windows: +20 bonus

TIPS:
• Windows unlock at midnight (your local time)
• Be quick to earn speed bonuses!
• Consistency matters - the streak bonus is significant

Contest closes Dec 24 at 11:59 PM (Mexico City time). Prizes delivered via email Dec 25.
```

### UI Decision: Collapsible Banner

A **collapsible banner** at the top of the calendar page:

- **Collapsed state**: Compact bar with trophy icon and "Contest Rules" text, clear expand indicator (chevron/arrow)
- **Expanded state**: Full instructions content shown above
- **Behavior**: Starts collapsed, user can toggle open/closed
- **Persistence**: Optional - remember user's preference in localStorage

No special onboarding or first-visit treatment needed.

---

## Automated Winner Selection

### Contest End Time

**Dec 24, 2025 at 11:59 PM CST (Mexico City time)**

- Timezone: `America/Mexico_City` (UTC-6)
- ISO timestamp: `2025-12-25T05:59:00Z`

### How It Works

The winner selection is **computed automatically** based on the leaderboard view at contest end:

1. **Before deadline**: Leaderboard shows "live" standings, contest is active
2. **After deadline**: Leaderboard shows "final" standings, winners are locked in
3. **No manual intervention needed**: The database view calculates rankings in real-time

### Implementation Approach

**Option A: Client-side check (Simpler)**

- App checks current time against contest end timestamp
- If past deadline: display "Contest Ended" state, show final winners
- Leaderboard query remains the same (it's always accurate)

**Option B: Database flag (More robust)**

- Add `contest_ended` flag or `contest_end_time` to a settings table
- Query checks this flag to determine display mode
- Allows manual override if needed

**Recommended: Option A** for simplicity, since:

- Small friend group (2-5 people)
- No need for manual overrides
- Leaderboard data is always accurate regardless of end time

### Constants to Add

```typescript
// src/lib/contest.ts
export const CONTEST_END_TIME = new Date("2025-12-25T05:59:00Z"); // Dec 24, 11:59 PM Mexico City

export function isContestEnded(): boolean {
  return new Date() > CONTEST_END_TIME;
}

export function getTimeUntilContestEnd(): number {
  return Math.max(0, CONTEST_END_TIME.getTime() - Date.now());
}
```

### UI States

| State      | Condition       | Display                                               |
| ---------- | --------------- | ----------------------------------------------------- |
| **Active** | Before deadline | "Contest ends Dec 24 at 11:59 PM" + live leaderboard  |
| **Ended**  | After deadline  | "Contest Complete!" + final standings + winner badges |

---

## Implementation Timeline

### Phase 1: Database & Backend

| Step | Description                                                   | Files                   |
| ---- | ------------------------------------------------------------- | ----------------------- |
| 1.1  | Create `contest_leaderboard` database view with ranking logic | `supabase/migrations/`  |
| 1.2  | Add TypeScript types for leaderboard data                     | `src/types/database.ts` |
| 1.3  | Create `getContestLeaderboard()` query function               | `src/lib/database.ts`   |
| 1.4  | Create contest utilities (end time, status checks)            | `src/lib/contest.ts`    |

### Phase 2: Contest Instructions

| Step | Description                                             | Files                                    |
| ---- | ------------------------------------------------------- | ---------------------------------------- |
| 2.1  | Create ContestInstructions collapsible banner component | `src/components/ContestInstructions.tsx` |
| 2.2  | Add banner to calendar page (above calendar grid)       | `src/pages/index.astro`                  |
| 2.3  | Style collapsed/expanded states with Tailwind           | Component file                           |

### Phase 3: Leaderboard Components

| Step | Description                                      | Files                                   |
| ---- | ------------------------------------------------ | --------------------------------------- |
| 3.1  | Create LeaderboardDisplay component              | `src/components/LeaderboardDisplay.tsx` |
| 3.2  | Add compact leaderboard widget for calendar page | `src/components/LeaderboardWidget.tsx`  |
| 3.3  | Create dedicated `/leaderboard` page             | `src/pages/leaderboard.astro`           |

### Phase 4: Integration & Real-time

| Step | Description                                          | Files                   |
| ---- | ---------------------------------------------------- | ----------------------- |
| 4.1  | Integrate widget into main calendar page             | `src/pages/index.astro` |
| 4.2  | Add Supabase real-time subscription for live updates | Leaderboard components  |
| 4.3  | Link between widget and full leaderboard page        | Components              |

### Phase 5: Polish & Winner Announcement

| Step | Description                                            | Files                                   |
| ---- | ------------------------------------------------------ | --------------------------------------- |
| 5.1  | Add gold/silver/bronze styling for top 3               | Leaderboard components                  |
| 5.2  | Highlight current user in leaderboard                  | Leaderboard components                  |
| 5.3  | Add points breakdown tooltip/expandable detail         | LeaderboardDisplay                      |
| 5.4  | Create winner announcement banner (shows after Dec 24) | `src/components/WinnerAnnouncement.tsx` |
| 5.5  | Mobile responsiveness pass                             | All new components                      |

### Phase 6: Testing & Deployment

| Step | Description                              | Files |
| ---- | ---------------------------------------- | ----- |
| 6.1  | Test scoring calculations with mock data | -     |
| 6.2  | Verify real-time updates work correctly  | -     |
| 6.3  | Test on mobile devices                   | -     |
| 6.4  | Run `pnpm lint` and `pnpm build`         | -     |
| 6.5  | Deploy to production                     | -     |

---

## Summary: Files to Create/Modify

### New Files

- `supabase/migrations/YYYYMMDD_contest_leaderboard.sql`
- `src/lib/contest.ts` - Contest end time, status utilities
- `src/components/ContestInstructions.tsx` - Collapsible banner
- `src/components/LeaderboardDisplay.tsx` - Full leaderboard view
- `src/components/LeaderboardWidget.tsx` - Compact widget for calendar page
- `src/components/WinnerAnnouncement.tsx` - Post-contest winner display
- `src/pages/leaderboard.astro`

### Modified Files

- `src/types/database.ts` - Add leaderboard types
- `src/lib/database.ts` - Add leaderboard query
- `src/pages/index.astro` - Integrate instructions + widget

---

## Decisions Made

1. **Leaderboard visibility**: **Public** - Anyone with the link can see standings
2. **Winner announcement**: Real-time leaderboard updates, final results after Dec 24th
3. **Non-participants**: Show with 0 points or exclude from display
4. **Prize delivery**: Email via external system (see below)

---

## Prize Delivery Plan

### Approach: Email Delivery (External System)

The app will **announce winners** but **not store or display gift card codes**. Codes are delivered via a separate email system.

### Flow

1. **Dec 24 (after final window)**: Leaderboard shows final standings with prize indicators
2. **Dec 25**: You send personalized emails to top 3 with their Amazon gift card codes
3. **In-app**: Winners see "Congratulations! Check your email for your prize"

### Why This Approach

- **Security**: Gift card codes never stored in app database
- **Simplicity**: No need to build secure code storage/retrieval
- **Personal touch**: Email feels more celebratory than a code dump
- **Flexibility**: Can add a personal message to each winner

### Implementation in App

Add a simple winner announcement banner/modal:

```text
🎉 Contest Complete!

1st Place: [Name]
2nd Place: [Name]
3rd Place: [Name]

Winners: Check your email on Dec 25 for your prize details!
```

### Email Template (for your external system)

```email
Subject: 🎄 You won the Advent Calendar Contest!

Hi [Name],

Congratulations on finishing [1st/2nd/3rd] place in the Advent Calendar Contest!

Your prize: $[amount] Amazon Gift Card
Code: [XXXX-XXXX-XXXX]

Redeem at: amazon.com/gc/redeem

Thanks for playing! 🎁
```

### No Additional App Changes Needed

Since prize delivery is handled externally:

- No database changes for code storage
- No secure retrieval endpoints
- Just UI updates to show winner announcement

---

## Alternative Approaches Considered

### Approach A: Pure Speed (Not Recommended)

- Only the fastest opener each day gets points
- Cons: Favors night owls, discourages late participation

### Approach B: Pure Participation (Not Recommended)

- Only count windows opened, no speed bonus
- Cons: Less exciting, doesn't use the timing data

### Approach C: Random Drawing

- Each window opened = one lottery entry
- Cons: Less engaging day-to-day, no strategy

**Chosen: Balanced Point System** - Rewards both speed and consistency, keeps competition interesting while ensuring engaged participants always have a chance.
