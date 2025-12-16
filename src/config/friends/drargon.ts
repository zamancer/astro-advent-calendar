import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from "../../lib/storage";

const FRIEND_ID = "a9abbabf-4f18-480f-8dbb-5f4a02409ca3";

export const friendConfig: FriendCalendarConfig = {
  // Friend information (replace with actual database ID)
  friendId: FRIEND_ID,
  friendName: "Drargon",

  // Calendar customization
  title: "Drargon Calendar",
  subtitle: "",
  greeting: "",

  // 12 windows with mixed content types
  contents: [
    // Day 1: Foto de todos en casa de Diego
    {
      type: "photo",
      day: 1,
      imageUrl: getFriendImageUrl(FRIEND_ID, 1, "jpg") || "",
      caption: "Casi todos en casa de Diego en un Diciembre (creo) 🎉",
      alt: "Foto de Diego, Zam, Xim, Dules, y Cor",
    },

    // Day 2: Foto Diego y Zam de jovenes con Mossi
    {
      type: "photo",
      day: 2,
      imageUrl: getFriendImageUrl(FRIEND_ID, 2, "jpeg") || "",
      caption: "Hace unos añitos en la casa de Mossi 🏡",
      alt: "Foto de Diego y Zam jovenes con Mossi",
    },

    // Day 3: Text - Video Tribuzy
    {
      type: "youtube",
      day: 3,
      videoId: "R77aWkvvhPM",
      title: "Tribuzy - Beast in the Light - Live 2007",
      description:
        "Cada cierto tiempo uno se tiene que acordar de esta joyita 💎",
    },

    // Day 4: Foto - Diego muy fuerte
    {
      type: "photo",
      day: 4,
      imageUrl: getFriendImageUrl(FRIEND_ID, 4, "jpeg") || "",
      caption: "Un dwarf posa con otro dwarf 💪",
      alt: "Foto de Diego con su versión grande",
    },

    // Day 5: Photo - Hiking adventure
    {
      type: "spotify",
      day: 5,
      embedUrl: "https://open.spotify.com/embed/track/6olS0TmHmsGr0hXtcBsiVM",
      title: "Megadeth - A Tout Le Monde",
      description: "Dos limones (A two lemon!) 🍋🍋",
    },

    // Day 6: Spotify - Study playlist
    {
      type: "spotify",
      day: 6,
      embedUrl: "https://open.spotify.com/embed/track/0eV3PB3T0OxW4feG1DlOjQ",
      title: "Hammerfall - Hearts on Fire",
      description: "Hearts on Fire, Hearts on Fire! 🔥",
    },

    // Day 7: Mensaje de aliento previo a Navidad
    {
      type: "text",
      day: 7,
      message:
        "¡Ya casi un nuevo año! Que nada te falte, que nada te sobre, y que nos veamos pronto. 🎄✨",
      author: "Zam",
    },

    // Day 8: Canción Pantera - Cemetery Gates
    {
      type: "spotify",
      day: 8,
      embedUrl: "https://open.spotify.com/embed/track/4vJr55lngvhSM8WIh9CjQc",
      title: "Pantera - Cemetery Gates",
      description: "Never old, always gold. 🪦🚪",
    },

    // Day 9: Foto - Diego y Zam muy chavos
    {
      type: "photo",
      day: 9,
      imageUrl: getFriendImageUrl(FRIEND_ID, 9, "jpg") || "",
      caption: "Dimebag Darrell y Phil Anselmo 🎤",
      alt: "Foto de Zam y Diego muy chavos",
    },

    // Day 10: Foto - Jugando lol en casa de Cor
    {
      type: "photo",
      day: 10,
      imageUrl: getFriendImageUrl(FRIEND_ID, 10, "jpg") || "",
      caption: "Empezando a jugar LoL en casa de Cor 🎮",
      alt: "Foto de Dules, Gabo, Zam y Diego jugando LoL en casa de Cor",
    },

    // Day 11: Text - Looking forward
    {
      type: "photo",
      day: 11,
      imageUrl: getFriendImageUrl(FRIEND_ID, 11, "jpeg") || "",
      caption: "Concierto de Symphony X en 2019 (creo) 🤘",
      alt: "Diego, Gina y Zam en concierto de Symphony X",
    },

    // Day 12: Message - Final message
    {
      type: "message",
      day: 12,
      title: "¡Feliz Navidad! 🎄🎁",
      message:
        "Que esta actividad te haya gustado, Drargon. Disfruta montones esta navidad, y que disfrutemos mucho el año que viene. ¡Un abrazo fuerte! 🤗",
      imageUrl:
        "https://images.unsplash.com/photo-1483373018724-770a096812ff?w=800&auto=format&fit=crop",
    },
  ],
};
