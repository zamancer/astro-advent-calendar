import type { FriendCalendarConfig } from "../../types/calendar";
import { getFriendImageUrl } from "../../lib/storage";

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
      description:
        "¡Cor sale ahí al minuto 0:50 y creo que yo al 1:30! ¡Chéquele! Si no, al menos me gusta acordarme de este CD 🤘",
    },

    // Day 4: Soup Nazi - Uno de los mejores capítulos de Seinfeld
    {
      type: "youtube",
      day: 4,
      videoId: "RqlQYBcsq54",
      title: "Soup Nazi - Seinfeld",
      description:
        "Una de las cosas más chistosas que me enseñó mi amigo Cor. No soup for you! 🍲",
    },

    // Day 5: Foto Cor pelón como un monje
    {
      type: "photo",
      day: 5,
      imageUrl: getFriendImageUrl(FRIEND_ID, 5, "jpg") || "",
      caption: "Mi monje favorito para pelear contra el mal 🧘‍♂",
      alt: "Foto de Cor pelón",
    },

    // Day 6: Spotify - Study playlist
    {
      type: "spotify",
      day: 6,
      embedUrl: "https://open.spotify.com/embed/track/4JdlbMSByL6z5oqysInM2D",
      title: "Sonata Arctica - I Can't Dance",
      description:
        "Mezcla de Zam y Cor en un cover de Genesis por Sonata Arctica 🎸",
    },

    // Day 7: Text - Encouragement
    {
      type: "text",
      day: 7,
      message: "Brindi la prufka, brindi la pöf... pöf!",
      author: "Roktok van Mücher",
    },

    // Day 8: Foto - Remolcando el coche de Cor
    {
      type: "message",
      day: 8,
      title: "Coche remolcado 🚗",
      message:
        "Recuerdo cuando al fin llegamos sanos y salvos a tú casa, Cor, después de mucha diversión al volante 😂",
      imageUrl: getFriendImageUrl(FRIEND_ID, 8, "jpg") || "",
    },

    // Day 9: Photo - Foto con Dules y Cor en mi cuarto de casa de mi mamá
    {
      type: "photo",
      day: 9,
      imageUrl: getFriendImageUrl(FRIEND_ID, 9, "jpg") || "",
      caption:
        "Viendo esta foto me acordé de cómo era mi cuarto en casa de mi mamá. Bonitos tiempos. 🛏 ",
      alt: "Foto de Dules y Cor en casa de Zam",
    },

    // Day 10: Photo - Pythagora Switch
    {
      type: "youtube",
      day: 10,
      videoId: "cU3YmAFCcCA",
      title: "Pythagora Switch - Sports",
      description:
        "¡¿Te acuerdas de esto?! Me encantaba. ¡Hay que verlo juntos pronto!",
    },

    // Day 11: Foto - Comiendo papitas
    {
      type: "photo",
      day: 11,
      imageUrl: getFriendImageUrl(FRIEND_ID, 11, "jpg") || "",
      caption:
        "Las papitas del puente inolvidables en las visitas con mi mamá 🍟",
      alt: "Foto de Gabo, Cor, Dules y Zam en casa de Zam",
    },

    // Day 12: Message - Final message
    {
      type: "message",
      day: 12,
      title: "¡Feliz Navidad! 🎄🎁",
      message:
        "Que esta actividad te haya gustado, Cor. Disfruta montones esta navidad, y que gocemos mucho el año que viene. ¡Un abrazo fuerte! 🤗",
      imageUrl:
        "https://images.unsplash.com/photo-1483373018724-770a096812ff?w=800&auto=format&fit=crop",
    },
  ],
};
