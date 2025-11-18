// TypeScript interfaces for calendar content types

export type ContentType = "photo" | "spotify" | "text" | "message";

export interface BaseContent {
  type: ContentType;
  day: number;
}

export interface PhotoContent extends BaseContent {
  type: "photo";
  imageUrl: string;
  caption: string;
  alt: string;
}

export interface SpotifyContent extends BaseContent {
  type: "spotify";
  embedUrl: string;
  title: string;
  description?: string;
}

export interface TextContent extends BaseContent {
  type: "text";
  message: string;
  author?: string;
}

export interface MessageContent extends BaseContent {
  type: "message";
  title: string;
  message: string;
  imageUrl?: string;
}

export type CalendarContent =
  | PhotoContent
  | SpotifyContent
  | TextContent
  | MessageContent;

export interface CalendarConfig {
  title: string;
  subtitle: string;
  contents: CalendarContent[];
}
