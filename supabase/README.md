# Friend Calendar Database Schema

This directory contains the database schema and migrations for the Astro Advent Calendar's friend tracking system.

## Overview

The database tracks friends who have access to the calendar and monitors which calendar windows they have opened. This enables features like:
- Unique access codes for each friend
- Progress tracking per user
- Preventing duplicate window opens
- Analytics on calendar engagement

## Database Schema

### Tables

#### `friends`
Stores information about each friend who has access to the calendar.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | TEXT | Friend's display name |
| `email` | TEXT | Friend's email (unique) |
| `unique_code` | TEXT | Unique access code for URL sharing (unique) |
| `created_at` | TIMESTAMP | When the record was created |
| `updated_at` | TIMESTAMP | When the record was last updated |

**Indexes:**
- `idx_friends_unique_code` - Fast lookups by code
- `idx_friends_email` - Fast lookups by email

**Constraints:**
- Email must be unique
- Unique code must be unique

#### `friend_window_opens`
Tracks which calendar windows each friend has opened.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `friend_id` | UUID | Foreign key to friends table |
| `window_number` | INTEGER | Calendar window number (1-24) |
| `opened_at` | TIMESTAMP | When the window was opened |

**Indexes:**
- `idx_friend_window_opens_friend_id` - Fast lookups by friend
- `idx_friend_window_opens_window_number` - Fast lookups by window
- `idx_friend_window_opens_friend_window` - Composite index for common queries

**Constraints:**
- `window_number` must be between 1 and 24
- Unique constraint on (`friend_id`, `window_number`) - prevents duplicates
- Foreign key to `friends` with CASCADE delete

### Relationships

```
friends (1) ----< (many) friend_window_opens
```

When a friend is deleted, all their window opens are automatically deleted (CASCADE).

## Setup Instructions

### 1. Run Migration

Apply the schema to your Supabase database:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard SQL Editor:
# Copy and paste the contents of:
# supabase/migrations/20250101000000_create_friend_calendar_schema.sql
```

### 2. Load Seed Data (Optional)

For development and testing, load sample data:

```bash
# Using Supabase CLI
supabase db seed

# Or manually in SQL Editor:
# Copy and paste the contents of: supabase/seed.sql
```

The seed data includes:
- 5 sample friends with different emails and unique codes
- Various window open patterns (active users, new users, inactive users)

### 3. Verify Setup

Run these queries in the Supabase SQL Editor to verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- View all friends
SELECT * FROM friends ORDER BY created_at;

-- View progress summary
SELECT
  f.name,
  COUNT(fwo.id) as windows_opened,
  ARRAY_AGG(fwo.window_number ORDER BY fwo.window_number) as opened_windows
FROM friends f
LEFT JOIN friend_window_opens fwo ON f.id = fwo.friend_id
GROUP BY f.id, f.name
ORDER BY f.name;
```

## TypeScript Integration

### Import Types

```typescript
import type {
  Friend,
  FriendInsert,
  FriendWindowOpen,
  FriendWithProgress,
} from '../types/database';
```

### Using Database Functions

```typescript
import {
  getAllFriends,
  getFriendByCode,
  createFriend,
  recordWindowOpen,
  getFriendWithProgress,
  generateUniqueCode,
} from '../lib/database';

// Create a new friend
const { data: friend, error } = await createFriend({
  name: 'John Doe',
  email: 'john@example.com',
  unique_code: generateUniqueCode(),
});

// Get friend by their unique code
const { data: friend, error } = await getFriendByCode('ALICE123');

// Record a window open
const { data: windowOpen, error } = await recordWindowOpen({
  friend_id: friend.id,
  window_number: 1,
});

// Get friend with complete progress
const { data: friendProgress, error } = await getFriendWithProgress(friend.id);
console.log(friendProgress.windows_opened); // [1, 2, 3, 5]
console.log(friendProgress.total_windows_opened); // 4
```

## Common Queries

### Get all friends who opened a specific window

```typescript
import { getWindowOpeners } from '../lib/database';

const { data: openers, error } = await getWindowOpeners(5);
```

### Check if a friend already opened a window

```typescript
import { hasOpenedWindow } from '../lib/database';

const { data: hasOpened, error } = await hasOpenedWindow(friendId, 5);
if (hasOpened) {
  console.log('Window already opened!');
}
```

### Get progress for all friends

```typescript
import { getAllFriendsProgress } from '../lib/database';

const { data: progress, error } = await getAllFriendsProgress();
progress.forEach((p) => {
  console.log(`${p.friend_name}: ${p.total_windows} windows opened`);
});
```

## Security Considerations

### Row Level Security (RLS)

The migration includes commented-out RLS policies. To enable:

1. Uncomment the RLS policies in the migration file
2. Customize based on your authentication strategy
3. Re-run the migration

Example policies:
```sql
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_window_opens ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read friends
CREATE POLICY "Friends are viewable by everyone"
  ON friends FOR SELECT USING (true);

-- Allow friends to record their own opens
CREATE POLICY "Friends can record window opens"
  ON friend_window_opens FOR INSERT
  WITH CHECK (true);
```

### Preventing Duplicate Opens

The unique constraint on `(friend_id, window_number)` ensures each friend can only open each window once. Attempting to insert a duplicate will result in a database error.

```typescript
// This will fail if the window was already opened
const { data, error } = await recordWindowOpen({
  friend_id: 'abc123',
  window_number: 5,
});

if (error) {
  console.error('Window already opened or other error:', error);
}
```

## Development Workflow

### Adding New Friends

```typescript
import { createFriend, generateUniqueCode } from '../lib/database';

const { data, error } = await createFriend({
  name: 'New Friend',
  email: 'newfriend@example.com',
  unique_code: generateUniqueCode(), // Generates random 8-char code
});
```

### Testing Window Opens

```typescript
import { recordWindowOpen } from '../lib/database';

// Try to open window 1
const { data, error } = await recordWindowOpen({
  friend_id: friendId,
  window_number: 1,
});

if (error) {
  // Handle error (duplicate, invalid window number, etc.)
}
```

## Maintenance

### Backup Data

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or use Supabase Dashboard > Database > Backups
```

### Reset Database (Development Only)

```bash
# WARNING: This will delete all data!
supabase db reset
```

## Future Enhancements

Potential schema improvements:
- Add `last_login_at` to friends table
- Add `is_active` flag to friends table
- Track IP addresses or user agents for security
- Add `window_unlock_date` to enforce temporal constraints
- Add analytics tables for aggregated statistics
