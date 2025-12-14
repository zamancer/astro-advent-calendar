import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from '../../lib/storage';

const FRIEND_ID = "a8c8c14c-c426-41a7-9e11-27ff56ad8511";

export const friendConfig: FriendCalendarConfig = {
  // Friend information (replace with actual database ID)
  friendId: FRIEND_ID,
  friendName: "Cor",

  // Calendar customization
  title: "Cor Calendar",
  subtitle: "",
  greeting: "",

  // 12 windows with mixed content types
  contents: [
    // Day 1: Foto con Cor, y Dules, y Zam
    {
      type: "photo",
      day: 1,
      imageUrl: getFriendImageUrl(FRIEND_ID, 1, "jpeg") || "",
      caption: "Una cenita muy a todo dar con los amigos de Groninja 🥂",
      alt: "Dules y Cor y Zam",
    },

    // Day 2: Decor
    {
      type: "photo",
      day: 2,
      imageUrl: getFriendImageUrl(FRIEND_ID, 2, "jpg") || "",
      caption: "Recuerdo de que todo lo DeCor está muy bien 🎖️",
      alt: "Foto de Cor frente a un decor",
    },

    // Day 3: Video - guerra de bandas 2008
    {
      type: "youtube",
      day: 3,
      videoId: "g9r_8lVWGC0",
      title: "Guerra de bandas - Circo Volador 2008",
      description: "¡Cor sale ahí al minuto 0:50 y creo que yo al 1:30! ¡Chéquele! Si no, al menos me gusta acordarme de este CD 🤘",
    },

    // Day 4: Soup Nazi - Uno de los mejores capítulos de Seinfeld
    {
      type: "youtube",
      day: 4,
      videoId: "RqlQYBcsq54",
      title: "Soup Nazi - Seinfeld",
      description: "Una de las cosa más chistosas que me enseñó mi amigo Cor. No soup for you! 🍲",
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
