import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from '../../lib/storage';

const FRIEND_ID = "297da6f1-e25b-4c12-961e-d8d244e12579";

export const friendConfig: FriendCalendarConfig = {
  // Friend information (replace with actual database ID)
  friendId: FRIEND_ID,
  friendName: "Xamster",

  // Calendar customization
  title: "Xams Calendar",
  subtitle: "",
  greeting: "",

  // 12 windows with mixed content types
  contents: [
    // Day 1: Foto de Xamster con cara pintada de jaguar
    {
      type: "photo",
      day: 1,
      imageUrl: getFriendImageUrl(FRIEND_ID, 1, "jpeg") || "",
      caption: "Mi carnal en mi cumple con cara de jaguar (creo) 🐯",
      alt: "Foto de Xamster con cara pintada",
    },

    // Day 2: Foto Xamster ayudando con la mudanza
    {
      type: "photo",
      day: 2,
      imageUrl: getFriendImageUrl(FRIEND_ID, 2, "jpeg") || "",
      caption: "Mi carnal ayudándome con la mudanza y la armadera de muebles 📦",
      alt: "Foto de Diego y Zam jovenes con Mossi",
    },

    // Day 3: Text - Heartfelt message
     {
      type: "spotify",
      day: 3,
      embedUrl: "https://open.spotify.com/embed/track/4gFhLQA90CAFuS0Ma8aIiX",
      title: "Mirror Mirror Everywhere!",
      description: "Canción de culto para una culta persona.",
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
