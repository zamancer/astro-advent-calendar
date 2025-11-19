/**
 * Example Friend Configuration: Sarah
 *
 * This is a complete example showing how to create a personalized
 * calendar configuration for a friend. This example demonstrates:
 * - Mix of all content types (photo, spotify, text, message)
 * - Using Supabase Storage for images
 * - Personal messages and memories
 * - Proper structure and validation
 */

import type { FriendCalendarConfig } from "../../types/calendar";

export const friendConfig: FriendCalendarConfig = {
  // Friend information (replace with actual database ID)
  friendId: "550e8400-e29b-41d4-a716-446655440001",
  friendName: "Sarah Johnson",

  // Calendar customization
  title: "Sarah's Christmas Journey",
  subtitle: "12 special moments that made this year unforgettable",
  greeting:
    "Hey Sarah! 🎄 I made this special advent calendar for you. Each window holds a memory we shared this year. Open one each day and relive our adventures together!",

  // 12 windows with mixed content types
  contents: [
    // Day 1: Photo - First meeting
    {
      type: "photo",
      day: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop",
      caption: "Remember our first coffee date at Starbucks? You spilled your latte! ☕😄",
      alt: "Coffee shop meeting",
    },

    // Day 2: Spotify - Our song
    {
      type: "spotify",
      day: 2,
      embedUrl: "https://open.spotify.com/embed/track/0bYg9bo50gSsH3LtXe2SQn",
      title: "All I Want for Christmas",
      description:
        "This started playing during our road trip and we sang it 100 times!",
    },

    // Day 3: Text - Heartfelt message
    {
      type: "text",
      day: 3,
      message:
        "Thank you for being an amazing friend this year. Your positivity and kindness inspire me every day. I'm so grateful we met! 💙",
      author: "Your Best Friend",
    },

    // Day 4: Message - Movie marathon
    {
      type: "message",
      day: 4,
      title: "Epic Movie Marathon",
      message:
        "Remember when we binged all 3 Lord of the Rings movies in one day? That was legendary! We need to do it again this year. 🍿",
      imageUrl:
        "https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=800&auto=format&fit=crop",
    },

    // Day 5: Photo - Hiking adventure
    {
      type: "photo",
      day: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop",
      caption:
        "Our sunrise hike at Mount Rainier! Worth waking up at 4 AM. 🏔️",
      alt: "Mountain hiking at sunrise",
    },

    // Day 6: Spotify - Study playlist
    {
      type: "spotify",
      day: 6,
      embedUrl: "https://open.spotify.com/embed/track/3qiyyUfYe7CRYLucrPmulD",
      title: "Study Session Vibes",
      description: "Our go-to song during those late-night study sessions!",
    },

    // Day 7: Text - Encouragement
    {
      type: "text",
      day: 7,
      message:
        "You crushed that presentation at work! I knew you could do it. You're destined for great things, Sarah! 🌟",
      author: "Your Cheerleader",
    },

    // Day 8: Message - Baking disaster
    {
      type: "message",
      day: 8,
      title: "The Great Cookie Disaster",
      message:
        "We may have set off the smoke alarm THREE times, but at least we had fun! Next time, let's follow the recipe. 😂🍪",
      imageUrl:
        "https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=800&auto=format&fit=crop",
    },

    // Day 9: Photo - Beach sunset
    {
      type: "photo",
      day: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
      caption: "Best beach sunset ever! Summer vibes with my favorite person 🌅",
      alt: "Beach sunset with friends",
    },

    // Day 10: Spotify - Party anthem
    {
      type: "spotify",
      day: 10,
      embedUrl: "https://open.spotify.com/embed/track/5x89JFflKZW2rgzKYCZLsQ",
      title: "Birthday Bash Anthem",
      description: "This song made your birthday party absolutely epic!",
    },

    // Day 11: Text - Looking forward
    {
      type: "text",
      day: 11,
      message:
        "Can't wait to see what adventures next year brings us! More hiking, more concerts, more memories. Here's to 2025! 🎉",
      author: "Your Adventure Buddy",
    },

    // Day 12: Message - Final message
    {
      type: "message",
      day: 12,
      title: "Merry Christmas, Sarah! 🎄🎁",
      message:
        "Thank you for being YOU. You're an incredible friend, and I'm so lucky to have you in my life. Here's to many more years of friendship, laughter, and unforgettable moments. Merry Christmas! ❤️",
      imageUrl:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop",
    },
  ],
};
