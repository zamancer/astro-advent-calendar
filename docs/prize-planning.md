# Advent Calendar Contest & Prize Planning

## Overview

A friendly competition among 2-5 friends with Amazon gift card prizes for the top 3 participants. The system rewards both **speed** (opening windows quickly after unlock) and **consistency** (engaging with the calendar daily).

## Prize Structure

| Place | Prize                |
| ----- | -------------------- |
| 1st   | $50 Amazon gift card |
| 2nd   | $25 Amazon gift card |
| 3rd   | $10 Amazon gift card |

_Adjust amounts as desired. Total: $85_

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

**Option A: Dedicated leaderboard page**

- `/leaderboard` route
- Link from main calendar page
- Full standings and breakdown

**Option B: Inline on calendar page**

- Compact leaderboard widget
- Shows top 3 with current points
- "View full leaderboard" link

**Option C: Both** (Recommended)

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

Users need to understand how the contest works. Add an instructions section/modal accessible from the main calendar page.

### Content to Display

```
🏆 Advent Calendar Contest

WIN AMAZON GIFT CARDS!
1st Place: $50 | 2nd Place: $25 | 3rd Place: $10

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

Winners announced Dec 24. Prizes delivered via email Dec 25.
```

### UI Options

**Option A: Collapsible section** on calendar page (always visible but compact)

**Option B: Info icon/button** that opens a modal with full rules

**Option C: Dedicated tab/section** alongside leaderboard widget

---

## Implementation Timeline

### Phase 1: Database & Backend

| Step | Description                                                   | Files                   |
| ---- | ------------------------------------------------------------- | ----------------------- |
| 1.1  | Create `contest_leaderboard` database view with ranking logic | `supabase/migrations/`  |
| 1.2  | Add TypeScript types for leaderboard data                     | `src/types/database.ts` |
| 1.3  | Create `getContestLeaderboard()` query function               | `src/lib/database.ts`   |

### Phase 2: Contest Instructions

| Step | Description                                                 | Files                                         |
| ---- | ----------------------------------------------------------- | --------------------------------------------- |
| 2.1  | Create ContestInstructions component (modal or collapsible) | `src/components/ContestInstructions.tsx`      |
| 2.2  | Add instructions trigger to calendar page                   | `src/pages/index.astro` or calendar component |
| 2.3  | Style with Tailwind (match existing theme)                  | Component file                                |

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
- `src/components/ContestInstructions.tsx`
- `src/components/LeaderboardDisplay.tsx`
- `src/components/LeaderboardWidget.tsx`
- `src/components/WinnerAnnouncement.tsx`
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

```
🎉 Contest Complete!

1st Place: [Name] - $50 Amazon Gift Card
2nd Place: [Name] - $25 Amazon Gift Card
3rd Place: [Name] - $10 Amazon Gift Card

Winners: Check your email on Dec 25 for your prize code!
```

### Email Template (for your external system)

```
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
