// Configuration file for calendar content - customize this with your own content!

import type { CalendarConfig } from "../types/calendar";

export const calendarConfig: CalendarConfig = {
  title: "Our Christmas Memories",
  subtitle: "12 days of special moments we shared together",
  contents: [
    {
      type: "photo",
      day: 1,
      imageUrl: "/cozy-winter-coffee-shop-with-friends.jpg",
      caption: "Remember our first coffee date this winter? ☕",
      alt: "Friends at coffee shop",
    },
    {
      type: "spotify",
      day: 2,
      embedUrl: "https://open.spotify.com/embed/track/0bYg9bo50gSsH3LtXe2SQn",
      title: "Our Song",
      description: "This always reminds me of you!",
    },
    {
      type: "text",
      day: 3,
      message:
        "Thank you for always being there when I needed someone to talk to. Your friendship means the world to me. 💙",
      author: "Your Friend",
    },
    {
      type: "message",
      day: 4,
      title: "Movie Night",
      message:
        "Can't wait for our annual holiday movie marathon! Hot cocoa and terrible Christmas movies are the best combo.",
      imageUrl: "/cozy-movie-night-with-blankets-and-popcorn.jpg",
    },
    {
      type: "photo",
      day: 5,
      imageUrl: "/snowy-mountain-landscape-winter-adventure.jpg",
      caption: "That epic ski trip we took! Best adventure ever! 🎿",
      alt: "Ski trip memories",
    },
    {
      type: "text",
      day: 6,
      message:
        "Life is better with friends like you. Here's to many more memories together! 🎄",
      author: "Me",
    },
    {
      type: "spotify",
      day: 7,
      embedUrl: "https://open.spotify.com/embed/track/7vQbuQcyTflfCIOu3Uzzya",
      title: "Holiday Vibes",
      description: "Our go-to Christmas playlist starter!",
    },
    {
      type: "message",
      day: 8,
      title: "Baking Disaster",
      message:
        "Remember when we tried to bake cookies and set off the smoke alarm? 😂 Good times!",
      imageUrl: "/messy-kitchen-with-baking-ingredients-and-cookies.jpg",
    },
    {
      type: "photo",
      day: 9,
      imageUrl: "/beautiful-christmas-lights-downtown-city.jpg",
      caption: "The night we went to see the Christmas lights downtown ✨",
      alt: "Christmas lights downtown",
    },
    {
      type: "text",
      day: 10,
      message:
        "Grateful for every laugh, every conversation, and every moment we've shared. You're the best! 🌟",
      author: "Your Bestie",
    },
    {
      type: "message",
      day: 11,
      title: "New Year Plans",
      message:
        "Let's make next year even more amazing! So many adventures await us. 🎉",
      imageUrl: "/fireworks-celebration-new-year.jpg",
    },
    {
      type: "photo",
      day: 12,
      imageUrl: "/group-of-friends-laughing-together-at-dinner.jpg",
      caption: "To friendship, love, and endless memories. Merry Christmas! 🎁",
      alt: "Friends celebrating together",
    },
  ],
};
