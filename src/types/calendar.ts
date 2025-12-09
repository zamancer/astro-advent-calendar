// TypeScript interfaces for calendar content types

export type ContentType = "photo" | "spotify" | "text" | "message";

export interface BaseContent {
  type: ContentType;
  day: number;
  unlockDate: Date; // When this window becomes available
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

/**
 * Friend-specific calendar configuration
 * Links a friend's database ID with their personalized calendar content
 */
export interface FriendCalendarConfig extends CalendarConfig {
  /** Friend ID from the database (must match friends table) */
  friendId: string;
  /** Friend's name for display purposes */
  friendName: string;
  /** Optional custom greeting message */
  greeting?: string;
}

/**
 * Validation result for friend configuration
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Metadata about a friend's configuration file
 */
export interface FriendConfigMetadata {
  friendId: string;
  friendName: string;
  windowCount: number;
  lastModified?: Date;
}
