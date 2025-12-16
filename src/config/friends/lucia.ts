import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from "../../lib/storage";

const FRIEND_ID = "3255ad59-ab52-471f-b557-aad86ad5cd22";

export const friendConfig: FriendCalendarConfig = {
  // Friend information (replace with actual database ID)
  friendId: FRIEND_ID,
  friendName: "Lucia",

  // Calendar customization
  title: "Lucia Calendar",
  subtitle: "",
  greeting: "",

  // 12 windows with mixed content types
  contents: [
    // Day 1: Foto cumple Zam 1
    {
      type: "photo",
      day: 1,
      imageUrl: getFriendImageUrl(FRIEND_ID, 1, "jpg") || "",
      caption: "Hace no mucho en un cumpleaños en mi casa 🎉",
      alt: "Foto de Lucia, Osw, y Zam",
    },

    // Day 2: Foto cumple Zam 2
    {
      type: "photo",
      day: 2,
      imageUrl: getFriendImageUrl(FRIEND_ID, 2, "jpeg") || "",
      caption: "Hace un poco menos en otro cumple de Zam 🥳",
      alt: "Foto de Lucia, amigos, y Zam",
    },

    // Day 3: Video - Kpop Big Bang Fantastic Baby
    {
      type: "youtube",
      day: 3,
      videoId: "AAbokV76tkU",
      title: "BigBang - Fantastic - 2012",
      description: "Una mañana cualquiera rumbo a CODE con Luu 🕺",
    },

    // Day 4: Foto STU
    {
      type: "photo",
      day: 4,
      imageUrl: getFriendImageUrl(FRIEND_ID, 4, "jpg") || "",
      caption: "No lo entenderías, bro. Es Simple To Undertand 😂",
      alt: "Foto del legendario Simple To Undertand",
    },

    // Day 5: Photo - Sunset from Globant Naples
    {
      type: "message",
      day: 5,
      title: "Chill out Globant (Nápoles)",
      message:
        "Un día tomé fotos randoms desde el chill de la oficina en Nápoles, cuando ví una puesta de sol chida. Creo que hasta se veía nuestro depa desde ahí. 😌",
      imageUrl: getFriendImageUrl(FRIEND_ID, 5, "jpeg") || "",
    },

    // Day 6: Photo - Tiscaregno aviador
    {
      type: "photo",
      day: 6,
      imageUrl: getFriendImageUrl(FRIEND_ID, 6, "png") || "",
      caption:
        "¿Y por qué te bajaste del avión de último minuto, Luu? Puees.... ✈️",
      alt: "Foto del legendario roomie aviador",
    },

    // Day 7: Text - Encouragement
    {
      type: "text",
      day: 7,
      message:
        "I will honor Christmas in my heart, and try to keep it all the year. 📖🎄",
      author: "Charles Dickens",
    },

    // Day 8: Foto - Coolotes de calidad
    {
      type: "photo",
      day: 8,
      imageUrl: getFriendImageUrl(FRIEND_ID, 8, "JPG") || "",
      caption: "De cuando teníamos amigos en el trabajo 😎",
      alt: "Foto del grupo de amigos de CODE",
    },

    // Day 9: Foto - CODE K-pop
    {
      type: "photo",
      day: 9,
      imageUrl: getFriendImageUrl(FRIEND_ID, 9, "jpg") || "",
      caption: "De cuando nos sentimos en una boy band en CODE (sale mal) 🎤",
      alt: "Foto del grupo de amigos de CODE",
    },

    // Day 10: Youtube - Santo Puerco
    {
      type: "youtube",
      day: 10,
      videoId: "3vl07cB7OYg",
      title: "Santo Puerco - Cosas Sucias - 2012",
      description: "Un clásico en toda ocasión. 🐽",
    },

    // Day 11: Foto - Juego de mesa pre pandemia
    {
      type: "message",
      day: 11,
      title: "Último juego pre pandemia",
      message:
        "Este jueguito lo conocí en tú depa de la Del Valle, estuvo bien padre. Ya después vino la pandemia y RIP 😢",
      imageUrl: getFriendImageUrl(FRIEND_ID, 11, "jpeg") || "",
    },

    // Day 12: Message - Final message
    {
      type: "message",
      day: 12,
      title: "¡Feliz Navidad! 🎄🎁",
      message:
        "Que esta actividad te haya gustado, Luu. Disfruta montones esta navidad, y que disfrutemos mucho el año que viene. ¡Un abrazo fuerte! 🤗",
      imageUrl:
        "https://images.unsplash.com/photo-1483373018724-770a096812ff?w=800&auto=format&fit=crop",
    },
  ],
};
