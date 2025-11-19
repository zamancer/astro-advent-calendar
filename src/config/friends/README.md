# Friend Configuration System

This directory contains personalized calendar configurations for each friend. Each friend gets their own configuration file with 12 custom windows containing photos, music, messages, and memories.

## 📁 Directory Structure

```
src/config/friends/
├── README.md                  # This file
├── index.ts                   # Configuration registry
├── template.ts                # Template for creating new friends
├── example-sarah.ts           # Example configuration (Sarah)
├── example-mike.ts            # Example configuration (Mike)
└── [your-friend-name].ts      # Your friend configurations
```

## 🚀 Quick Start

### 1. Create a Friend in the Database

First, add your friend to the database to get their unique ID:

```typescript
import { createFriend, generateUniqueCode } from '~/lib/database';

const { data: friend, error } = await createFriend({
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  unique_code: generateUniqueCode(),
});

// Copy the friend.id - you'll need it for the configuration
console.log('Friend ID:', friend.id);
```

### 2. Copy the Template

```bash
# Copy the template file
cp src/config/friends/template.ts src/config/friends/sarah-johnson.ts
```

### 3. Customize the Configuration

Open your new file and update:

```typescript
export const friendConfig: FriendCalendarConfig = {
  // STEP 1: Add friend's database ID (from step 1)
  friendId: "550e8400-e29b-41d4-a716-446655440001",

  // STEP 2: Add friend's name
  friendName: "Sarah Johnson",

  // STEP 3: Customize title and subtitle
  title: "Sarah's Christmas Journey",
  subtitle: "12 special moments we shared",

  // STEP 4: Optional greeting message
  greeting: "Hey Sarah! I made this special calendar just for you 🎄",

  // STEP 5: Add exactly 12 windows with your content
  contents: [
    // Add your 12 windows here...
  ],
};
```

### 4. Register the Configuration

Add your configuration to `index.ts`:

```typescript
// Import your configuration
import { friendConfig as sarahConfig } from './sarah-johnson';

// Add to the registry map
export const friendConfigs = new Map<string, FriendCalendarConfig>([
  ['550e8400-e29b-41d4-a716-446655440001', sarahConfig],
  // ... more friends
]);
```

### 5. Validate Your Configuration

Use the validation utilities:

```typescript
import { validateAndLog } from '~/lib/friendConfig';
import { friendConfig } from './sarah-johnson';

// This will log any errors or warnings
validateAndLog(friendConfig, 'Sarah Johnson');
```

## 🎨 Content Types

Each window can contain one of four content types:

### 1. Photo Content

Share a photo with a caption:

```typescript
{
  type: 'photo',
  day: 1,
  imageUrl: '/images/coffee-date.jpg',  // Or use getFriendImageUrl()
  caption: 'Remember our first coffee date? ☕',
  alt: 'Friends at coffee shop',
}
```

**Image URL Options:**
- **Supabase Storage** (recommended): Use `getFriendImageUrl(friendId, windowNumber)`
- **External URL**: `https://example.com/image.jpg`
- **Local public folder**: `/images/photo.jpg`

### 2. Spotify Content

Embed a song or playlist:

```typescript
{
  type: 'spotify',
  day: 2,
  embedUrl: 'https://open.spotify.com/embed/track/0bYg9bo50gSsH3LtXe2SQn',
  title: 'Our Song',
  description: 'This always reminds me of you!',
}
```

**Getting Spotify Embed URLs:**
1. Open song in Spotify
2. Click "Share" → "Embed"
3. Copy the embed URL

### 3. Text Content

Write a heartfelt message:

```typescript
{
  type: 'text',
  day: 3,
  message: 'Thank you for being an amazing friend. Your kindness inspires me every day! 💙',
  author: 'Your Best Friend',
}
```

### 4. Message Content

Combine a title, message, and optional image:

```typescript
{
  type: 'message',
  day: 4,
  title: 'Movie Marathon',
  message: 'Remember when we binged all the Harry Potter movies? We need to do it again!',
  imageUrl: '/images/movie-night.jpg',  // Optional
}
```

## ✅ Validation Rules

Your configuration must follow these rules:

### Required Rules (Will cause errors):
- ✅ **Exactly 12 windows** - No more, no less
- ✅ **Unique day numbers** - Each day 1-12 used exactly once
- ✅ **Valid friend ID** - Must not be the template placeholder
- ✅ **All required fields** - No empty strings
- ✅ **Valid content types** - Only: `photo`, `spotify`, `text`, `message`
- ✅ **Spotify URLs** - Must be `open.spotify.com/embed/...` format

### Content-Specific Requirements:

**Photo:**
- `imageUrl` (required)
- `caption` (required)
- `alt` (required for accessibility)

**Spotify:**
- `embedUrl` (required, must be Spotify embed URL)
- `title` (required)
- `description` (optional)

**Text:**
- `message` (required)
- `author` (optional)

**Message:**
- `title` (required)
- `message` (required)
- `imageUrl` (optional)

## 🛠️ Utilities

### Validation

```typescript
import { validateFriendConfig, validateAndLog } from '~/lib/friendConfig';

// Get validation result
const result = validateFriendConfig(config);
if (!result.valid) {
  console.error('Errors:', result.errors);
}

// Or use the helper that logs for you
validateAndLog(config, 'Config Name');
```

### Loading Configurations

```typescript
import {
  getFriendConfig,
  hasFriendConfig,
  getAllFriendIds,
  getFriendConfigOrThrow,
} from '~/config/friends';

// Get a configuration
const config = getFriendConfig('friend-id-here');

// Check if exists
if (hasFriendConfig('friend-id-here')) {
  // Configuration exists
}

// Get or throw error
const config = getFriendConfigOrThrow('friend-id-here');

// Get all registered friend IDs
const friendIds = getAllFriendIds();
```

### Helper Functions

```typescript
import {
  getContentByDay,
  sortContentsByDay,
  getConfigMetadata,
} from '~/lib/friendConfig';

// Get a specific day's content
const day5Content = getContentByDay(config, 5);

// Sort contents by day
const sorted = sortContentsByDay(config.contents);

// Get metadata
const metadata = getConfigMetadata(config);
// { friendId: '...', friendName: '...', windowCount: 12 }
```

## 🖼️ Working with Images

### Option 1: Supabase Storage (Recommended)

Upload images to Supabase Storage and use the helper function:

```typescript
import { getFriendImageUrl } from '~/lib/storage';

// In your configuration
{
  type: 'photo',
  day: 1,
  imageUrl: getFriendImageUrl('friend-id-here', 1),
  caption: 'Photo caption',
  alt: 'Photo description',
}
```

**Bulk Upload:**
```bash
pnpm upload-images --friend-id abc123 --dir ./images/sarah
```

See [docs/IMAGE_STORAGE.md](../../../docs/IMAGE_STORAGE.md) for details.

### Option 2: Public Folder

Place images in `public/images/friends/[friend-name]/`:

```typescript
{
  imageUrl: '/images/friends/sarah/window-1.jpg',
}
```

### Option 3: External URLs

Use any external image URL:

```typescript
{
  imageUrl: 'https://images.unsplash.com/photo-12345...',
}
```

## 📋 Complete Example

See `example-sarah.ts` and `example-mike.ts` for complete, working examples.

Here's a minimal complete configuration:

```typescript
import type { FriendCalendarConfig } from "../../types/calendar";

export const friendConfig: FriendCalendarConfig = {
  friendId: "550e8400-e29b-41d4-a716-446655440001",
  friendName: "Sarah Johnson",
  title: "Sarah's Christmas Journey",
  subtitle: "12 days of memories",
  greeting: "Welcome Sarah! 🎄",

  contents: [
    {
      type: "photo",
      day: 1,
      imageUrl: "/images/day1.jpg",
      caption: "Coffee date ☕",
      alt: "Coffee shop",
    },
    {
      type: "spotify",
      day: 2,
      embedUrl: "https://open.spotify.com/embed/track/...",
      title: "Our Song",
    },
    {
      type: "text",
      day: 3,
      message: "Thanks for being awesome!",
    },
    // ... 9 more windows to reach 12 total
  ],
};
```

## 🔍 Troubleshooting

### "Expected exactly 12 windows, but found X"

Make sure your `contents` array has exactly 12 items.

### "friendId must be updated from the template placeholder"

Replace `REPLACE_WITH_FRIEND_ID_FROM_DATABASE` with the actual friend ID from your database.

### "Duplicate day number X found"

Each window must have a unique day number from 1-12. Check for duplicates.

### "Missing day X"

Ensure all days from 1-12 are present in your configuration.

### "embedUrl must be a Spotify embed URL"

Spotify URLs must be in the format: `https://open.spotify.com/embed/track/...`

Get the embed URL from Spotify's "Share" → "Embed" option, not the regular share link.

## 🎯 Best Practices

1. **Use descriptive file names**: `sarah-johnson.ts`, not `friend1.ts`
2. **Add meaningful captions**: Make memories come alive with personal details
3. **Mix content types**: Don't use all photos or all text - variety is key
4. **Test image URLs**: Ensure all images load before deploying
5. **Validate before registering**: Run `validateAndLog()` to catch issues early
6. **Keep messages personal**: Generic messages aren't as special
7. **Use emojis sparingly**: They add fun but don't overdo it
8. **Optimize images**: Compress images before uploading (see IMAGE_STORAGE.md)
9. **Check accessibility**: Always provide alt text for images
10. **Tell a story**: Order windows to create a narrative arc

## 📚 Related Documentation

- [Database Schema](../../../supabase/README.md) - Friend database structure
- [Image Storage](../../../docs/IMAGE_STORAGE.md) - Image management guide
- [Calendar Types](../../types/calendar.ts) - TypeScript type definitions
- [Friend Config Utils](../../lib/friendConfig.ts) - Validation utilities

## 💡 Tips

- **Start early**: Creating 12 meaningful windows takes time
- **Save memories year-round**: Don't wait until December to gather content
- **Ask for photos**: Friends often have photos you forgot about
- **Use playlists**: Create collaborative Spotify playlists together
- **Make it interactive**: Ask friends to guess which memory is next
- **Keep backups**: Save configuration files to version control

---

Made with ❤️ for creating personalized Christmas memories
