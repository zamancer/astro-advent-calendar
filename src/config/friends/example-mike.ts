/**
 * Example Friend Configuration: Mike
 *
 * This example demonstrates:
 * - Different content mix focused on music and messages
 * - Using getFriendImageUrl() for Supabase Storage images
 * - More casual, fun tone
 * - Different memory themes (gaming, concerts, food adventures)
 */

import type { FriendCalendarConfig } from "../../types/calendar";
// Uncomment when using Supabase Storage:
// import { getFriendImageUrl } from '../../lib/storage';

export const friendConfig: FriendCalendarConfig = {
  // Friend information
  friendId: "550e8400-e29b-41d4-a716-446655440002",
  friendName: "Mike Chen",

  // Calendar customization
  title: "Mike's Year in Review",
  subtitle: "The highlights of our legendary friendship",
  greeting:
    "What's up Mike! 🎮 I put together this calendar with some of our best moments from this year. Each window has a memory that made me laugh or smile. Enjoy, buddy!",

  // 12 windows
  contents: [
    // Day 1: Message - Gaming victory
    {
      type: "message",
      day: 1,
      title: "We Finally Beat That Boss!",
      message:
        "After 47 attempts (but who's counting?), we finally defeated that impossible boss. Best gaming moment of the year! 🎮",
      imageUrl:
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop",
    },

    // Day 2: Spotify - Concert anthem
    {
      type: "spotify",
      day: 2,
      embedUrl: "https://open.spotify.com/embed/track/7qiZfU4dY1lWllzX7mPBI",
      title: "Rock Concert Vibes",
      description: "This song was INSANE live! Best concert we've been to.",
    },

    // Day 3: Text - Thanks for being there
    {
      type: "text",
      day: 3,
      message:
        "Thanks for always being down for spontaneous adventures, late-night food runs, and random gaming sessions. You're a real one! 🙌",
      author: "Your Gaming Partner",
    },

    // Day 4: Photo - Food adventure
    {
      type: "photo",
      day: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop",
      caption: "Remember when we tried to finish that 5-pound burger challenge? We failed gloriously. 🍔",
      alt: "Giant burger challenge",
    },

    // Day 5: Spotify - Road trip playlist
    {
      type: "spotify",
      day: 5,
      embedUrl: "https://open.spotify.com/embed/track/60nZcImufyMA1MKQY3dcCH",
      title: "Road Trip Essential",
      description:
        "This was on repeat during our road trip to Vegas. Classic!",
    },

    // Day 6: Message - Sports game
    {
      type: "message",
      day: 6,
      title: "The Game We'll Never Forget",
      message:
        "That overtime buzzer-beater! We went absolutely crazy in the stands. I think I lost my voice for three days. Worth it! 🏀",
      imageUrl:
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&auto=format&fit=crop",
    },

    // Day 7: Text - Workout motivation
    {
      type: "text",
      day: 7,
      message:
        "Thanks for being my gym buddy this year. We've come a long way from struggling with the bar to hitting PRs! Let's keep crushing it! 💪",
      author: "Your Gains Partner",
    },

    // Day 8: Photo - Camping trip
    {
      type: "photo",
      day: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop",
      caption:
        "Camping under the stars and burning marshmallows. Perfect weekend! 🏕️",
      alt: "Camping trip under starry sky",
    },

    // Day 9: Spotify - Party track
    {
      type: "spotify",
      day: 9,
      embedUrl: "https://open.spotify.com/embed/track/2mR9WSrxfoc4FVQxdOcqx4",
      title: "House Party Starter",
      description: "This song always gets the party going!",
    },

    // Day 10: Message - New hobby
    {
      type: "message",
      day: 10,
      title: "Learning Guitar Together",
      message:
        "Who knew we'd actually stick with guitar lessons? We sound terrible, but we're improving! Next year, we're starting a band. 🎸",
      imageUrl:
        "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=800&auto=format&fit=crop",
    },

    // Day 11: Photo - Skiing
    {
      type: "photo",
      day: 11,
      imageUrl:
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop",
      caption:
        "First time skiing! You only fell 23 times. I counted. 😂⛷️",
      alt: "Skiing adventure in the mountains",
    },

    // Day 12: Text - Final message
    {
      type: "text",
      day: 12,
      message:
        "Here's to another year of epic adventures, terrible decisions, and unforgettable memories! You're an awesome friend, Mike. Merry Christmas! 🎄🎁",
      author: "Your Best Bro",
    },
  ],
};
