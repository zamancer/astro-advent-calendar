import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from '../../lib/storage';

const FRIEND_ID = "e60a3bf2-4fd4-489f-a204-20ff4ec038c4";

export const friendConfig: FriendCalendarConfig = {
  // Friend information (replace with actual database ID)
  friendId: FRIEND_ID,
  friendName: "Xim",

  // Calendar customization
  title: "Xim Calendar",
  subtitle: "",
  greeting: "",

  // 12 windows with mixed content types
  contents: [
    // Day 1: Foto Xim en Helsinki
    {
      type: "photo",
      day: 1,
      imageUrl: getFriendImageUrl(FRIEND_ID, 1, "jpg") || "",
      caption: "De cuando estuvimos en Helsinki la primera vez 🇫🇮",
      alt: "Foto de Lucia, Osw, y Zam",
    },

    // Day 2: Foto Xim y Zam en Amsterdam
    {
      type: "photo",
      day: 2,
      imageUrl: getFriendImageUrl(FRIEND_ID, 2, "jpg") || "",
      caption: "Luego fuimos a Amsterdam a ver florecitas 🇳🇱",
      alt: "Foto de Lucia, amigos, y Zam",
    },

    // Day 3: Foto Xim Rosita
     {
      type: "photo",
      day: 3,
      imageUrl: getFriendImageUrl(FRIEND_ID, 3, "jpg") || "",
      caption: "Por esas fechas también salió la Xim Hyper Magenta 🩷",
      alt: "Foto de Lucia, amigos, y Zam",
    },

    // Day 4: Foto - Foto random del perro en el café
     {
      type: "photo",
      day: 4,
      imageUrl: getFriendImageUrl(FRIEND_ID, 4, "jpg") || "",
      caption: "Foto random de cuando nos salió un perro en el café 🐶",
      alt: "Foto",
    },

    // Day 5: Video - Poest of the fall
    {
      type: "youtube",
      day: 5,
      videoId: "rv4lBzZUOAE",
      title: "Poest of the fall - Late Goodbye (2018)",
      description: "De cuando fuimos a ver Poest of the fall en nuestro primer viaje a Lahti, Finlandia 🇫🇮",
    },

    // Day 6: Photo
    {
      type: "photo",
      day: 6,
      imageUrl: getFriendImageUrl(FRIEND_ID, 6, "jpg") || "",
      caption: "Foto con los amigos 😎",
      alt: "Foto",
    },

    // Day 7: Foto
    {
      type: "photo",
      day: 7,
      imageUrl: getFriendImageUrl(FRIEND_ID, 7, "jpeg") || "",
      caption: "Peluuuuuuchaaaaaaas Liiiiifeeeeeeee! 🧸",
      alt: "Foto",
    },

    // Day 8: Foto
    {
      type: "photo",
      day: 8,
      imageUrl: getFriendImageUrl(FRIEND_ID, 8, "jpeg") || "",
      caption: "Foto con la familia en las luces 🔆",
      alt: "Foto",
    },

    // Day 9: Spotify 
    {
      type: "spotify",
      day: 9,
      embedUrl: "https://open.spotify.com/embed/track/7BxQJTzBjhfpx8PVT1qASg",
      title: "Muse - Hyper Music",
      description: "La canción de Muse de la Hyper Ximi 🎸",
    },

    // Day 10: Foto
    {
      type: "photo",
      day: 10,
      imageUrl: getFriendImageUrl(FRIEND_ID, 10, "jpeg") || "",
      caption: "La Ximi bien bailadora 💃",
      alt: "Foto",
    },

    // Day 11: Text - Looking forward
    {
      type: "photo",
      day: 11,
      imageUrl: getFriendImageUrl(FRIEND_ID, 11, "jpeg") || "",
      caption: "Una ardilla ha visitado tú calendario. 🐿️",
      alt: "Foto",
    },

    // Day 12: Message - Final message
    {
      type: "message",
      day: 12,
      title: "¡Feliz Navidad! 🎄🎁",
      message:
        "Que esta actividad te haya gustado, Ximita. Disfruta montones esta navidad, y que gozemos mucho el año que viene. ¡Te amo! 🤗",
      imageUrl:
        getFriendImageUrl(FRIEND_ID, 12, "jpeg") || "",
    },
  ],
};
