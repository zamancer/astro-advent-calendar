# Friend Configuration Guide

Complete guide to creating personalized advent calendars for each friend.

## Overview

The Friend Configuration System allows you to create unique, personalized advent calendars for each friend. Each friend gets:

- **12 custom windows** with personalized content
- **Multiple content types**: Photos, Spotify songs, text messages, and combined message+image
- **Database integration**: Links configuration with friend records
- **Automatic validation**: Ensures configurations are complete and correct
- **Type safety**: Full TypeScript support

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Friend Database                         │
│  (friends table with id, name, email, unique_code)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Links via friendId
                      │
┌─────────────────────┴───────────────────────────────────────┐
│              Friend Configuration Files                     │
│         (src/config/friends/[name].ts)                     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Sarah     │  │    Mike     │  │    Jane     │       │
│  │   Config    │  │   Config    │  │   Config    │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Registered in
                      │
┌─────────────────────┴───────────────────────────────────────┐
│           Configuration Registry                            │
│          (src/config/friends/index.ts)                     │
│                                                             │
│  Map<friendId, FriendCalendarConfig>                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Loaded by
                      │
┌─────────────────────┴───────────────────────────────────────┐
│              Application Pages                              │
│  (Uses getFriendConfig() to load personalized content)    │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Step 1: Create Friend in Database

```typescript
import { createFriend, generateUniqueCode } from '~/lib/database';

const { data: friend } = await createFriend({
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  unique_code: generateUniqueCode(),
});

// Save this ID for the next step
console.log('Friend ID:', friend.id);
```

### Step 2: Create Configuration File

```bash
# Copy the template
cp src/config/friends/template.ts src/config/friends/sarah-johnson.ts
```

### Step 3: Customize Configuration

Edit `sarah-johnson.ts`:

```typescript
import type { FriendCalendarConfig } from "../../types/calendar";

export const friendConfig: FriendCalendarConfig = {
  // Use the ID from Step 1
  friendId: "550e8400-e29b-41d4-a716-446655440001",
  friendName: "Sarah Johnson",

  title: "Sarah's Christmas Journey",
  subtitle: "12 days of special moments",
  greeting: "Hey Sarah! 🎄 I made this for you!",

  contents: [
    // Add 12 windows here...
    {
      type: 'photo',
      day: 1,
      imageUrl: '/images/sarah/day1.jpg',
      caption: 'Remember this? ☕',
      alt: 'Coffee date photo',
    },
    // ... 11 more windows
  ],
};
```

### Step 4: Register Configuration

Add to `src/config/friends/index.ts`:

```typescript
import { friendConfig as sarahConfig } from './sarah-johnson';

export const friendConfigs = new Map<string, FriendCalendarConfig>([
  ['550e8400-e29b-41d4-a716-446655440001', sarahConfig],
]);
```

### Step 5: Test and Validate

```typescript
import { validateAndLog } from '~/lib/friendConfig';
import { friendConfig } from './sarah-johnson';

// Validates and logs errors/warnings
validateAndLog(friendConfig);
```

## Content Types Reference

### Photo Content

**Use when**: Sharing a photo memory

```typescript
{
  type: 'photo',
  day: 1,
  imageUrl: '/images/photo.jpg',          // Required
  caption: 'Our coffee date ☕',          // Required
  alt: 'Friends at coffee shop',          // Required (accessibility)
}
```

**Image Sources:**
- Supabase Storage: `getFriendImageUrl(friendId, windowNumber)`
- Public folder: `/images/friends/sarah/photo.jpg`
- External URL: `https://example.com/image.jpg`

### Spotify Content

**Use when**: Sharing a meaningful song or playlist

```typescript
{
  type: 'spotify',
  day: 2,
  embedUrl: 'https://open.spotify.com/embed/track/...',  // Required
  title: 'Our Song',                                      // Required
  description: 'This reminds me of you!',                 // Optional
}
```

**Getting Embed URL:**
1. Open Spotify (web or app)
2. Find your track/album/playlist
3. Click "Share" → "Embed"
4. Copy the embed URL

### Text Content

**Use when**: Writing a heartfelt message

```typescript
{
  type: 'text',
  day: 3,
  message: 'Thank you for being amazing!',  // Required
  author: 'Your Best Friend',               // Optional
}
```

**Tips:**
- Keep messages under 200 words for readability
- Use emojis to add personality
- Be specific - reference actual memories

### Message Content

**Use when**: Combining a title, message, and optional image

```typescript
{
  type: 'message',
  day: 4,
  title: 'Movie Marathon',              // Required
  message: 'Best weekend ever!',        // Required
  imageUrl: '/images/movie-night.jpg',  // Optional
}
```

**Best for:**
- Storytelling with context
- Combining text + image
- Title + detailed message

## Validation System

### Automatic Validation

The system validates:

✅ **Exactly 12 windows** (no more, no less)
✅ **Unique day numbers** (1-12, no duplicates)
✅ **All required fields** present
✅ **Valid content types**
✅ **Proper Spotify embed URLs**
✅ **No template placeholders**
✅ **Accessibility requirements** (alt text for images)

### Running Validation

```typescript
import { validateFriendConfig } from '~/lib/friendConfig';

const result = validateFriendConfig(config);

if (!result.valid) {
  console.error('Validation failed:');
  result.errors.forEach(error => console.error(`  - ${error}`));
}

if (result.warnings) {
  console.warn('Warnings:');
  result.warnings.forEach(warning => console.warn(`  - ${warning}`));
}
```

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Expected exactly 12 windows" | Wrong number of windows | Add/remove windows to total 12 |
| "friendId must be updated" | Using template placeholder | Use real friend ID from database |
| "Duplicate day number X" | Day number used twice | Ensure each day 1-12 used once |
| "Missing day X" | Day not included | Add missing day |
| "embedUrl must be Spotify embed URL" | Wrong URL format | Use Spotify's embed URL |

## Loading Configurations

### In Application Code

```typescript
import { getFriendConfig } from '~/config/friends';

// Get configuration for a specific friend
const config = getFriendConfig(friendId);

if (config) {
  // Use the configuration
  console.log(config.title);
  console.log(config.contents);
}
```

### Utility Functions

```typescript
import {
  getFriendConfig,
  hasFriendConfig,
  getFriendConfigOrThrow,
  getAllFriendIds,
  getAllFriendConfigs,
} from '~/config/friends';

// Check if configuration exists
if (hasFriendConfig(friendId)) {
  const config = getFriendConfig(friendId);
}

// Get or throw error (useful when config is required)
try {
  const config = getFriendConfigOrThrow(friendId);
} catch (error) {
  console.error('Configuration not found');
}

// Get all registered friend IDs
const friendIds = getAllFriendIds();

// Get all configurations
const allConfigs = getAllFriendConfigs();
```

## Best Practices

### 1. File Organization

```
src/config/friends/
├── index.ts                    # Registry
├── template.ts                 # Template
├── example-sarah.ts            # Example
├── sarah-johnson.ts            # Real friend
├── mike-chen.ts                # Real friend
└── jane-smith.ts               # Real friend
```

**Naming convention**: `[firstname-lastname].ts`

### 2. Content Variety

**Good mix** (varied content):
```typescript
contents: [
  { type: 'photo', ... },      // Day 1
  { type: 'spotify', ... },    // Day 2
  { type: 'text', ... },       // Day 3
  { type: 'message', ... },    // Day 4
  { type: 'photo', ... },      // Day 5
  // etc.
]
```

**Avoid** (all same type):
```typescript
contents: [
  { type: 'photo', ... },   // Day 1
  { type: 'photo', ... },   // Day 2
  { type: 'photo', ... },   // Day 3
  // ... boring!
]
```

### 3. Storytelling

**Create a narrative arc**:
- Days 1-3: Early memories, how you met
- Days 4-8: Adventures and fun times
- Days 9-11: Recent memories, growth
- Day 12: Heartfelt message, looking forward

### 4. Image Management

**Recommended workflow**:
1. Collect all images for a friend
2. Optimize images (compress, resize)
3. Upload to Supabase Storage
4. Use `getFriendImageUrl()` in config

**Tools for optimization**:
- ImageOptim (Mac)
- TinyPNG (Web)
- Sharp (Node.js)

See [IMAGE_STORAGE.md](./IMAGE_STORAGE.md) for details.

### 5. Quality Checklist

Before finalizing a configuration:

- [ ] All 12 windows completed
- [ ] No template placeholders remaining
- [ ] All images tested and loading
- [ ] Spotify embeds working
- [ ] Messages are personal and meaningful
- [ ] Alt text provided for accessibility
- [ ] Configuration validated (no errors)
- [ ] Spelling and grammar checked
- [ ] Friend ID matches database

## Advanced Usage

### Dynamic Image URLs

```typescript
import { getFriendImageUrl } from '~/lib/storage';

// Generate URL dynamically
const friendId = '550e8400-e29b-41d4-a716-446655440001';

export const friendConfig: FriendCalendarConfig = {
  friendId,
  // ...
  contents: [
    {
      type: 'photo',
      day: 1,
      imageUrl: getFriendImageUrl(friendId, 1),
      // ...
    },
  ],
};
```

### Conditional Content

```typescript
// Use environment or feature flags
const isPremium = true;

export const friendConfig: FriendCalendarConfig = {
  // ...
  contents: [
    {
      type: isPremium ? 'spotify' : 'text',
      day: 1,
      // ...
    },
  ],
};
```

### Shared Content Helper

Create reusable content:

```typescript
// shared-content.ts
export const commonSongs = {
  ourSong: {
    embedUrl: 'https://open.spotify.com/embed/track/...',
    title: 'Our Song',
  },
};

// In friend config
import { commonSongs } from './shared-content';

export const friendConfig: FriendCalendarConfig = {
  contents: [
    {
      type: 'spotify',
      day: 2,
      ...commonSongs.ourSong,
    },
  ],
};
```

## Troubleshooting

### Issue: Images not loading

**Check:**
1. Image URL is correct and accessible
2. Image exists at the specified path
3. Supabase Storage bucket is public
4. CORS settings allow access

### Issue: Spotify embed not showing

**Check:**
1. Using embed URL (not regular share link)
2. URL format: `https://open.spotify.com/embed/track/...`
3. Track is available in user's region
4. Embed URL is the full URL (not shortened)

### Issue: Validation errors

**Run:**
```typescript
import { validateAndLog } from '~/lib/friendConfig';
validateAndLog(friendConfig, 'Config Name');
```

Check console for specific errors and warnings.

### Issue: Configuration not found

**Check:**
1. Configuration file exists
2. Exported as `friendConfig`
3. Imported in `index.ts`
4. Added to `friendConfigs` Map
5. Using correct friend ID as key

## Examples

See complete working examples:
- [Example: Sarah](../src/config/friends/example-sarah.ts) - Balanced mix of content
- [Example: Mike](../src/config/friends/example-mike.ts) - Music and gaming focused

## TypeScript Types

```typescript
// Core type
interface FriendCalendarConfig extends CalendarConfig {
  friendId: string;
  friendName: string;
  greeting?: string;
}

// Validation result
interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// Metadata
interface FriendConfigMetadata {
  friendId: string;
  friendName: string;
  windowCount: number;
  lastModified?: Date;
}
```

See [src/types/calendar.ts](../src/types/calendar.ts) for complete type definitions.

## Related Documentation

- **[Friend Config README](../src/config/friends/README.md)** - Detailed technical guide
- **[Database Schema](../supabase/README.md)** - Friend database structure
- **[Image Storage](./IMAGE_STORAGE.md)** - Managing images
- **[Calendar Types](../src/types/calendar.ts)** - TypeScript definitions

---

**Need Help?**

- Check the [examples](../src/config/friends/)
- Review the [template](../src/config/friends/template.ts)
- See the [validation utilities](../src/lib/friendConfig.ts)
- Consult the [main README](../README.md)
