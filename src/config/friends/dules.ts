import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from "../../lib/storage";

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
      description:
        "¿Acaso fue nuestro último concierto juntos en México? 🤔 Estuvo muy chévere.",
    },

    // Day 4: Video - Ángeles fuimos de DBZ
    {
      type: "youtube",
      day: 4,
      videoId: "ZZYn2HkCwn4",
      title: "DBZ - Ángeles fuimos 🎤",
      description:
        "Siempre me acuerdo de Dules cuando la vuelvo a escuchar... ¡Abre! 😂",
    },

    // Day 5: Foto - Dules y yo de chamacos
    {
      type: "photo",
      day: 5,
      imageUrl: getFriendImageUrl(FRIEND_ID, 5, "jpg") || "",
      caption: "¡Mira nomás! Súper mocosos y todo 👶🐥",
      alt: "Dules y Zam muy jóvenes",
    },

    // Day 6: Foto - Despedida Dules San Esiquio
    {
      type: "photo",
      day: 6,
      imageUrl: getFriendImageUrl(FRIEND_ID, 6, "jpg") || "",
      caption: "De cuando te 'despedimos' en San Esiquio 🤠",
      alt: "Dules y Zam muy jóvenes",
    },

    // Day 7: Text - Encouragement
    {
      type: "text",
      day: 7,
      message:
        "Friendship is born at that moment when one person says to another, 'What! You too? I thought I was the only one.'",
      author: "C. S. Lewis",
    },

    // Day 8: Spotify - Katzenjammer
    {
      type: "spotify",
      day: 8,
      embedUrl: "https://open.spotify.com/embed/track/2OZMnEZs5MTEiTWeba5twb",
      title: "Katzenjammer - To the Sea",
      description: "La canción de Muse de la Hyper Ximi 🎸",
    },

    // Day 9: Photo - Despeinado con Dules
    {
      type: "photo",
      day: 9,
      imageUrl: getFriendImageUrl(FRIEND_ID, 9, "jpg") || "",
      caption: "Que me peino y que nos sacamos la foto en casa de Gina 🙈",
      alt: "Beach sunset with friends",
    },

    // Day 10: Spotify - Party anthem
    {
      type: "youtube",
      day: 10,
      videoId: "MKwXMn9pqbQ",
      title: "Anna Murphy (Cellar Darling) - Twin Flames",
      description:
        "Primera canción que conocí de Anna Murphy después de dejar Eluveitie (y según yo te gustan también) 🎶",
    },

    // Day 11: Foto - Con Diego y Dules
    {
      type: "photo",
      day: 11,
      imageUrl: getFriendImageUrl(FRIEND_ID, 11, "jpg") || "",
      caption: "Siendo muy felices y jóvenes con Diego 😊",
      alt: "Fodo de Diego, Dules y Zam",
    },

    // Day 12: Message - Final message
    {
      type: "message",
      day: 12,
      title: "¡Feliz Navidad! 🎄🎁",
      message:
        "Que esta actividad te haya gustado, Dules. Disfruta montones esta navidad, y que gocemos mucho el año que viene. ¡Un abrazo fuerte! 🤗",
      imageUrl:
        "https://images.unsplash.com/photo-1483373018724-770a096812ff?w=800&auto=format&fit=crop",
    },
  ],
};
