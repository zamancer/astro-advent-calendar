/**
 * Friend Calendar Configuration Template
 *
 * This is a template for creating personalized calendar configurations for each friend.
 * Copy this file and rename it to match your friend's name or ID (e.g., sarah-smith.ts, john-doe.ts).
 *
 * INSTRUCTIONS:
 * 1. Copy this file: src/config/friends/template.ts → src/config/friends/[friend-name].ts
 * 2. Update friendId to match the friend's ID in the database
 * 3. Update friendName with the friend's display name
 * 4. Customize title, subtitle, and greeting
 * 5. Add exactly 12 windows (one for each day) with your personalized content
 * 6. Ensure each window has a unique day number (1-12)
 * 7. Choose content types: 'photo', 'spotify', 'text', or 'message'
 *
 * CONTENT TYPE EXAMPLES:
 * - photo: Share a photo with a caption
 * - spotify: Embed a song or playlist
 * - text: Write a heartfelt message
 * - message: Combine a title, message, and optional image
 */

import type { FriendCalendarConfig } from "../../types/calendar";

export const friendConfig: FriendCalendarConfig = {
  // ============================================
  // FRIEND INFORMATION (REQUIRED)
  // ============================================

  /**
   * Friend ID from the database
   * IMPORTANT: This must match the 'id' field in the 'friends' table
   * Example: "550e8400-e29b-41d4-a716-446655440000"
   */
  friendId: "REPLACE_WITH_FRIEND_ID_FROM_DATABASE",

  /**
   * Friend's display name
   * This will be used in the calendar title
   */
  friendName: "Friend Name",

  // ============================================
  // CALENDAR CUSTOMIZATION
  // ============================================

  /**
   * Calendar title
   * Will be displayed at the top of the calendar
   */
  title: "Our Christmas Memories",

  /**
   * Calendar subtitle
   * A brief description or tagline
   */
  subtitle: "12 days of special moments we shared together",

  /**
   * Optional custom greeting message
   * Shown when the friend first visits their calendar
   */
  greeting: "Welcome! I made this special advent calendar just for you. Open one window each day to discover a memory we shared together. 🎄",

  // ============================================
  // WINDOW CONTENTS (EXACTLY 12 REQUIRED)
  // ============================================

  contents: [
    // ----------------------------------------
    // Window 1: PHOTO EXAMPLE
    // ----------------------------------------
    {
      type: "photo",
      day: 1,
      /**
       * Unlock date - When this window becomes available
       * Format: new Date('YYYY-MM-DDTHH:MM:SS')
       * Windows unlock Dec 12-23 (one per day at midnight)
       */
      unlockDate: new Date('2025-12-12T00:00:00'),
      /**
       * Image URL - Can be:
       * - Supabase Storage URL: Use getFriendImageUrl() helper
       * - External URL: https://example.com/image.jpg
       * - Local public folder: /images/photo.jpg
       */
      imageUrl: "/images/example-photo.jpg",
      /**
       * Caption shown below the photo
       */
      caption: "Remember our first coffee date this winter? ☕",
      /**
       * Alt text for accessibility
       */
      alt: "Friends at coffee shop",
    },

    // ----------------------------------------
    // Window 2: SPOTIFY EXAMPLE
    // ----------------------------------------
    {
      type: "spotify",
      day: 2,
      unlockDate: new Date('2025-12-13T00:00:00'),
      /**
       * Spotify embed URL
       * Get it from: Spotify → Share → Embed → Copy embed URL
       * Format: https://open.spotify.com/embed/track/[TRACK_ID]
       */
      embedUrl: "https://open.spotify.com/embed/track/0bYg9bo50gSsH3LtXe2SQn",
      /**
       * Title of the song/playlist
       */
      title: "Our Song",
      /**
       * Optional description
       */
      description: "This always reminds me of you!",
    },

    // ----------------------------------------
    // Window 3: TEXT MESSAGE EXAMPLE
    // ----------------------------------------
    {
      type: "text",
      day: 3,
      unlockDate: new Date('2025-12-14T00:00:00'),
      /**
       * Your heartfelt message
       * Can be multiple lines
       */
      message: "Thank you for always being there when I needed someone to talk to. Your friendship means the world to me. 💙",
      /**
       * Optional author name
       */
      author: "Your Friend",
    },

    // ----------------------------------------
    // Window 4: MESSAGE WITH IMAGE EXAMPLE
    // ----------------------------------------
    {
      type: "message",
      day: 4,
      unlockDate: new Date('2025-12-15T00:00:00'),
      /**
       * Message title/heading
       */
      title: "Movie Night",
      /**
       * Message content
       */
      message: "Can't wait for our annual holiday movie marathon! Hot cocoa and terrible Christmas movies are the best combo.",
      /**
       * Optional image URL
       */
      imageUrl: "/images/movie-night.jpg",
    },

    // ----------------------------------------
    // Windows 5-12: ADD YOUR CONTENT
    // ----------------------------------------
    // Copy and customize the examples above to create your remaining 8 windows
    // Make sure each has a unique day number (5, 6, 7, 8, 9, 10, 11, 12)
    // Unlock dates: Dec 16-23 (one per day)

    {
      type: "photo",
      day: 5,
      unlockDate: new Date('2025-12-16T00:00:00'),
      imageUrl: "/images/example-5.jpg",
      caption: "Your memory here...",
      alt: "Description for accessibility",
    },

    {
      type: "text",
      day: 6,
      unlockDate: new Date('2025-12-17T00:00:00'),
      message: "Your message here...",
      author: "You",
    },

    {
      type: "spotify",
      day: 7,
      unlockDate: new Date('2025-12-18T00:00:00'),
      embedUrl: "https://open.spotify.com/embed/track/...",
      title: "Song Title",
      description: "Why this song is special...",
    },

    {
      type: "message",
      day: 8,
      unlockDate: new Date('2025-12-19T00:00:00'),
      title: "Memory Title",
      message: "Your message here...",
      imageUrl: "/images/example-8.jpg",
    },

    {
      type: "photo",
      day: 9,
      unlockDate: new Date('2025-12-20T00:00:00'),
      imageUrl: "/images/example-9.jpg",
      caption: "Your memory here...",
      alt: "Description for accessibility",
    },

    {
      type: "text",
      day: 10,
      unlockDate: new Date('2025-12-21T00:00:00'),
      message: "Your message here...",
      author: "You",
    },

    {
      type: "message",
      day: 11,
      unlockDate: new Date('2025-12-22T00:00:00'),
      title: "Memory Title",
      message: "Your message here...",
    },

    {
      type: "photo",
      day: 12,
      unlockDate: new Date('2025-12-23T00:00:00'),
      imageUrl: "/images/example-12.jpg",
      caption: "Your final message here... 🎁",
      alt: "Description for accessibility",
    },
  ],
};

/**
 * VALIDATION CHECKLIST:
 * ✅ friendId matches the database ID
 * ✅ Exactly 12 windows (no more, no less)
 * ✅ Each window has a unique day number (1-12)
 * ✅ All required fields are filled
 * ✅ Image URLs are valid and accessible
 * ✅ Spotify embed URLs are correct format
 * ✅ Messages are meaningful and personalized
 *
 * TIPS:
 * - Use Supabase Storage for images: getFriendImageUrl(friendId, windowNumber)
 * - Mix content types to keep it interesting
 * - Add emojis to make messages more fun
 * - Test all image URLs before deploying
 * - Keep messages concise but heartfelt
 */
