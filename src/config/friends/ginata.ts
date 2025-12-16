import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from "../../lib/storage";

const FRIEND_ID = "75e7a00d-273f-44ee-ae66-0da90f9520d1";

export const friendConfig: FriendCalendarConfig = {
  // Friend information (replace with actual database ID)
  friendId: FRIEND_ID,
  friendName: "Ginata",

  // Calendar customization
  title: "Ginata Calendar",
  subtitle: "",
  greeting: "",

  // 12 windows with mixed content types
  contents: [
    // Day 1: Foto de todos en Pre-Navidad en casa de Ginata
    {
      type: "photo",
      day: 1,
      imageUrl: getFriendImageUrl(FRIEND_ID, 1, "jpg") || "",
      caption: "Hace 10 años (?) en la pre-navidad en casa de Ginata 🎉",
      alt: "Foto de Gina, Lucio, y todos en casa de Gina",
    },

    // Day 2: Foto Gina, Zam, y Lucio en España
    {
      type: "photo",
      day: 2,
      imageUrl: getFriendImageUrl(FRIEND_ID, 2, "jpg") || "",
      caption: "Después de un metalcito en España 🇪🇸",
      alt: "Foto de Diego y Zam jovenes con Mossi",
    },

    // Day 3: Video primera vez viendo a Sonata Arctica en Mexico
    {
      type: "youtube",
      day: 3,
      videoId: "ypWyR6khQME",
      title: "Sonata Arctica México 2013",
      description: "De cuando los vimos por primera vez en el Circo 🤘",
    },

    // Day 4: Video Colegio indoamericano
    {
      type: "youtube",
      day: 4,
      videoId: "nrfV0iw59fc",
      title: "Random: Orgullosamente Indo",
      description: "¡Ah caray! Yo topo a ese valedor 😂",
    },

    // Day 5: Photo - Hiking adventure
    {
      type: "photo",
      day: 5,
      imageUrl: getFriendImageUrl(FRIEND_ID, 5, "jpg") || "",
      caption: "We've got the power, we are divine! (Y apágale al arroz...) ⚡",
      alt: "Foto de Dules, Zam, Cor, Gina y Payos en la cocina de Gina",
    },

    // Day 6: Photo - Hace unos años con Dules y Gina
    {
      type: "photo",
      day: 6,
      imageUrl: getFriendImageUrl(FRIEND_ID, 6, "jpg") || "",
      caption: "Hace muy poquito en casa de mi mamá, jugando papelitos 🍲",
      alt: "Foto de Dules, Zam, y Gina en casa de Zam",
    },

    // Day 7: Text - Encouragement
    {
      type: "text",
      day: 7,
      message:
        "I will honor Christmas in my heart, and try to keep it all the year. 📖🎄",
      author: "Charles Dickens",
    },

    // Day 8: Video - Sonata Arctica - Where X Marks The Spot
    {
      type: "youtube",
      day: 8,
      videoId: "rSiEXFHIs-Q",
      title: "Sonata Arctica - X Marks The Spot",
      description: "¡Uuff! Esperando que nos toque en vivo pronto 🤞",
    },

    // Day 9: Photo - Rodeo Santa Fe con Dules y Gina
    {
      type: "photo",
      day: 9,
      imageUrl: getFriendImageUrl(FRIEND_ID, 9, "jpg") || "",
      caption: "De cuando fuimos al Rodeo Santa Fe con Dules 🤠",
      alt: "Foto de Dules, Zam, y Gina en casa de Zam",
    },

    // Day 10: Photo - Pre navidad con Gina
    {
      type: "photo",
      day: 10,
      imageUrl: getFriendImageUrl(FRIEND_ID, 10, "jpg") || "",
      caption:
        "Nuestra pre-navidad en casa de Gina del 2014 (¡ya casi es Navidarks!) 🎄",
      alt: "Foto de los amigos en casa de Gina en una pre-navidad del 2014",
    },

    // Day 11: Photo - Mi foto con Henkka de Sonata... tomada por Gina
    {
      type: "photo",
      day: 11,
      imageUrl: getFriendImageUrl(FRIEND_ID, 11, "jpeg") || "",
      caption:
        "Henkka, y Zam, y Gina... detrás de la cámara. Soy muy fan de esta foto porque siempre me acuerdo de ti. 📸",
      alt: "Foto de Henkka y Zam tomada por Gina",
    },

    // Day 12: Message - Final message
    {
      type: "message",
      day: 12,
      title: "¡Feliz Navidad! 🎄🎁",
      message:
        "Que esta actividad te haya gustado, Ginata. Disfruta montones esta navidad, y que disfrutemos mucho el año que viene. ¡Un abrazo fuerte! 🤗",
      imageUrl:
        "https://images.unsplash.com/photo-1483373018724-770a096812ff?w=800&auto=format&fit=crop",
    },
  ],
};
