import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from "../../lib/storage";

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
      caption:
        "Mi carnal ayudándome con la mudanza y la armadera de muebles 📦",
      alt: "Foto de Diego y Zam jovenes con Mossi",
    },

    // Day 3: Video - La banda de mi carnal Xamster
    {
      type: "youtube",
      day: 3,
      videoId: "zQPfO80_O4s",
      title: "Entrevista - Ideología Vigente 2010",
      description:
        "Mi carnal poniendo gente a bailar. ¡Yo estuve ahí! 🎤 (Also, primera cosa que vió Xim de aquel entonces)",
    },

    // Day 4: Video - Nothing good ever happens after 2 AM
    {
      type: "youtube",
      day: 4,
      videoId: "EKQT7WjPUIk",
      title: "HIMYM - Nothing good ever happens after 2 AM",
      description:
        "Lección aprendida con mi carnal por allá del 2012 (y sí, esto lo subí pasando 2AM como dice el primer comentario) 🫰",
    },

    // Day 5: Photo - Pelicula en casa de Mariana
    {
      type: "photo",
      day: 5,
      imageUrl: getFriendImageUrl(FRIEND_ID, 5, "jpg") || "",
      caption: "Dules, Xamster y Zam jugando al cine gore 🎬",
      alt: "Foto de Dules, Xamster y Zam viendo película en casa de Mariana",
    },

    // Day 6: Foto - Despedida Dules en el Rodeo Santa Fe
    {
      type: "photo",
      day: 6,
      imageUrl: getFriendImageUrl(FRIEND_ID, 6, "jpg") || "",
      caption: "Despedida de Dules en el Rodeo Santa Fe 🎉",
      alt: "Foto de Xamster, Zam, y amigos en la despedida de Dules",
    },

    // Day 7: Text - Encouragement
    {
      type: "text",
      day: 7,
      message:
        "Friendship is born at that moment when one person says to another, 'What! You too? I thought I was the only one.'",
      author: "C. S. Lewis",
    },

    // Day 8: Picture - Mas orca meme
    {
      type: "photo",
      day: 8,
      imageUrl: getFriendImageUrl(FRIEND_ID, 8, "jpeg") || "",
      caption:
        "Mi primer meme en Facebook; siempre me acuerdo que fuiste el primero en reirte. 🐋",
      alt: "Meme de orca y mas orca",
    },

    // Day 9: Foto - Cena navideña en casa de Gina
    {
      type: "photo",
      day: 9,
      imageUrl: getFriendImageUrl(FRIEND_ID, 9, "jpeg") || "",
      caption: "Una de tantas cenas navideñas en casa de Gina 🎄",
      alt: "Foto de Xamster, Zam, y amigos en la cena navideña en casa de Gina",
    },

    // Day 10: Photo - Cena navideña con Kary
    {
      type: "photo",
      day: 10,
      imageUrl: getFriendImageUrl(FRIEND_ID, 10, "jpg") || "",
      caption: "La primera cena navideña con Kary (creo) en casa de Gina 🎅",
      alt: "Foto de Xamster, Kary, y Zam en la cena navideña en casa de Gina",
    },

    // Day 11: Foto - La boda de Xamster y Kary
    {
      type: "message",
      day: 11,
      title: "Boda Oskar y Kary 👰🤵",
      message:
        "Me gusta mucho esta foto porque me recuerda de que fui un feliz testigo de un día muy especial de mi hermano. ¡Qué gran recuerdo! 🎉",
      imageUrl: getFriendImageUrl(FRIEND_ID, 11, "jpeg") || "",
    },

    // Day 12: Message - Final message
    {
      type: "message",
      day: 12,
      title: "¡Feliz Navidad! 🎄🎁",
      message:
        "Que esta actividad te haya gustado, carnalito. Disfruta montones esta navidad, y que gocemos mucho el año que viene. ¡Un abrazo fuerte! 🤗",
      imageUrl:
        "https://images.unsplash.com/photo-1483373018724-770a096812ff?w=800&auto=format&fit=crop",
    },
  ],
};
