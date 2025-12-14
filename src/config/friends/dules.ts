import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from '../../lib/storage';

const FRIEND_ID = "88d67ed9-ddc4-4f4f-b9e0-331fff991012";

export const friendConfig: FriendCalendarConfig = {
  // Friend information (replace with actual database ID)
  friendId: FRIEND_ID,
  friendName: "Dules",

  // Calendar customization
  title: "Dules Calendar",
  subtitle: "",
  greeting: "",

  // 12 windows with mixed content types
  contents: [
    // Day 1: Photo - Foto en Groningen
    {
      type: "photo",
      day: 1,
      imageUrl: getFriendImageUrl(FRIEND_ID, 1, "jpg") || "",
      caption: "Una visita muy feliz como nuestras caritas 😄",
      alt: "Dules y Cor y Zam",
    },

    // Day 2: Concierto Blind Guardian
    {
      type: "photo",
      day: 2,
      imageUrl: getFriendImageUrl(FRIEND_ID, 2, "jpg") || "",
      caption: "De cuando fuimos al concierto de Blind Guardian 🤘",
      alt: "Dules y Cor en el concierto de Blind Guardian",
    },

    // Day 3: Video último concierto juntos en México; Blind Guardian
    {
      type: "youtube",
      day: 3,
      videoId: "Pv9wh7RzS8c",
      title: "Blind Guardian - Mirror Mirror - México 2011",
      description: "¿Acaso fue nuestro último concierto juntos en México? 🤔 Estuvo muy chévere.",
    },

    // Day 4: Video - Ángeles fuimos de DBZ
    {
      type: "youtube",
      day: 4,
      videoId: "ZZYn2HkCwn4",
      title: "DBZ - Ángeles fuimos 🎤",
      description: "Siempre me acuerdo de Dules cuando la vuelvo a escuchar... ¡Abre! 😂",
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
