/**
 * Friend Configuration Utilities
 *
 * This module provides utilities for loading, validating, and managing
 * friend-specific calendar configurations.
 */

import type {
  FriendCalendarConfig,
  CalendarContent,
  ConfigValidationResult,
  FriendConfigMetadata,
} from "../types/calendar";

/**
 * Validates a friend's calendar configuration
 *
 * Ensures:
 * - Exactly 12 windows
 * - All days are numbered 1-12
 * - No duplicate days
 * - All required fields are present
 * - Content types are valid
 *
 * @param config - The friend calendar configuration to validate
 * @returns Validation result with errors and warnings
 */
export function validateFriendConfig(
  config: FriendCalendarConfig
): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate friend information
  if (!config.friendId || config.friendId.trim() === "") {
    errors.push("friendId is required and cannot be empty");
  }

  if (
    config.friendId === "REPLACE_WITH_FRIEND_ID_FROM_DATABASE" ||
    config.friendId.includes("REPLACE")
  ) {
    errors.push(
      "friendId must be updated from the template placeholder. Use the actual friend ID from the database."
    );
  }

  if (!config.friendName || config.friendName.trim() === "") {
    errors.push("friendName is required and cannot be empty");
  }

  if (config.friendName === "Friend Name") {
    warnings.push(
      "friendName appears to be the template default. Consider using a more specific name."
    );
  }

  // Validate title and subtitle
  if (!config.title || config.title.trim() === "") {
    errors.push("title is required and cannot be empty");
  }

  if (!config.subtitle || config.subtitle.trim() === "") {
    errors.push("subtitle is required and cannot be empty");
  }

  // Validate contents array
  if (!config.contents || !Array.isArray(config.contents)) {
    errors.push("contents must be an array");
    return { valid: false, errors, warnings };
  }

  // Check window count
  if (config.contents.length !== 12) {
    errors.push(
      `Expected exactly 12 windows, but found ${config.contents.length}. Each friend must have exactly 12 windows.`
    );
  }

  // Validate each window
  const days = new Set<number>();
  const validContentTypes = ["photo", "spotify", "text", "message"];

  config.contents.forEach((content: CalendarContent, index: number) => {
    const windowNum = index + 1;

    // Check day number
    if (typeof content.day !== "number") {
      errors.push(`Window ${windowNum}: 'day' must be a number`);
    } else {
      if (content.day < 1 || content.day > 12) {
        errors.push(
          `Window ${windowNum}: 'day' must be between 1 and 12, got ${content.day}`
        );
      }

      // Check for duplicates
      if (days.has(content.day)) {
        errors.push(
          `Duplicate day number ${content.day} found. Each day must be unique.`
        );
      }
      days.add(content.day);
    }

    // Check content type
    if (!validContentTypes.includes(content.type)) {
      errors.push(
        `Window ${windowNum}: Invalid content type '${content.type}'. Must be one of: ${validContentTypes.join(", ")}`
      );
    }

    // Type-specific validation
    switch (content.type) {
      case "photo":
        if (!content.imageUrl || content.imageUrl.trim() === "") {
          errors.push(`Window ${windowNum} (photo): imageUrl is required`);
        }
        if (
          content.imageUrl?.includes("example-") ||
          content.imageUrl?.includes("REPLACE")
        ) {
          warnings.push(
            `Window ${windowNum} (photo): imageUrl appears to be a placeholder. Replace with actual image URL.`
          );
        }
        if (!content.caption || content.caption.trim() === "") {
          errors.push(`Window ${windowNum} (photo): caption is required`);
        }
        if (content.caption === "Your memory here...") {
          warnings.push(
            `Window ${windowNum} (photo): caption is still the template placeholder.`
          );
        }
        if (!content.alt || content.alt.trim() === "") {
          errors.push(
            `Window ${windowNum} (photo): alt text is required for accessibility`
          );
        }
        break;

      case "spotify":
        if (!content.embedUrl || content.embedUrl.trim() === "") {
          errors.push(`Window ${windowNum} (spotify): embedUrl is required`);
        }
        if (
          content.embedUrl &&
          !content.embedUrl.includes("open.spotify.com/embed")
        ) {
          errors.push(
            `Window ${windowNum} (spotify): embedUrl must be a Spotify embed URL (https://open.spotify.com/embed/...)`
          );
        }
        if (content.embedUrl?.includes("...")) {
          warnings.push(
            `Window ${windowNum} (spotify): embedUrl appears to be a placeholder.`
          );
        }
        if (!content.title || content.title.trim() === "") {
          errors.push(`Window ${windowNum} (spotify): title is required`);
        }
        break;

      case "text":
        if (!content.message || content.message.trim() === "") {
          errors.push(`Window ${windowNum} (text): message is required`);
        }
        if (content.message === "Your message here...") {
          warnings.push(
            `Window ${windowNum} (text): message is still the template placeholder.`
          );
        }
        break;

      case "message":
        if (!content.title || content.title.trim() === "") {
          errors.push(`Window ${windowNum} (message): title is required`);
        }
        if (content.title === "Memory Title") {
          warnings.push(
            `Window ${windowNum} (message): title is still the template placeholder.`
          );
        }
        if (!content.message || content.message.trim() === "") {
          errors.push(`Window ${windowNum} (message): message is required`);
        }
        if (content.message === "Your message here...") {
          warnings.push(
            `Window ${windowNum} (message): message is still the template placeholder.`
          );
        }
        if (
          content.imageUrl?.includes("example-") ||
          content.imageUrl?.includes("REPLACE")
        ) {
          warnings.push(
            `Window ${windowNum} (message): imageUrl appears to be a placeholder.`
          );
        }
        break;
    }
  });

  // Check if all days 1-12 are present
  if (config.contents.length === 12) {
    for (let day = 1; day <= 12; day++) {
      if (!days.has(day)) {
        errors.push(`Missing day ${day}. All days from 1-12 must be present.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Gets metadata about a friend configuration
 *
 * @param config - The friend calendar configuration
 * @returns Configuration metadata
 */
export function getConfigMetadata(
  config: FriendCalendarConfig
): FriendConfigMetadata {
  return {
    friendId: config.friendId,
    friendName: config.friendName,
    windowCount: config.contents.length,
  };
}

/**
 * Sorts calendar contents by day number
 *
 * @param contents - Array of calendar content items
 * @returns Sorted array of calendar content items
 */
export function sortContentsByDay(
  contents: CalendarContent[]
): CalendarContent[] {
  return [...contents].sort((a, b) => a.day - b.day);
}

/**
 * Gets a specific window's content by day number
 *
 * @param config - The friend calendar configuration
 * @param day - The day number (1-12)
 * @returns The content for that day, or undefined if not found
 */
export function getContentByDay(
  config: FriendCalendarConfig,
  day: number
): CalendarContent | undefined {
  return config.contents.find((content) => content.day === day);
}

/**
 * Validates and logs configuration errors
 * Useful for debugging during development
 *
 * @param config - The friend calendar configuration
 * @param configName - Optional name for logging purposes
 * @returns True if valid, false otherwise
 */
export function validateAndLog(
  config: FriendCalendarConfig,
  configName?: string
): boolean {
  const result = validateFriendConfig(config);
  const name = configName || config.friendName || "Unknown";

  if (!result.valid) {
    console.error(`❌ Configuration validation failed for: ${name}`);
    result.errors.forEach((error) => console.error(`   - ${error}`));
  } else {
    console.warn(`✅ Configuration valid for: ${name}`);
  }

  if (result.warnings && result.warnings.length > 0) {
    console.warn(`⚠️  Warnings for: ${name}`);
    result.warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  return result.valid;
}

/**
 * Type guard to check if a configuration is a FriendCalendarConfig
 *
 * @param config - Configuration object to check
 * @returns True if it's a FriendCalendarConfig
 */
export function isFriendCalendarConfig(
  config: unknown
): config is FriendCalendarConfig {
  if (typeof config !== "object" || config === null) {
    return false;
  }

  const c = config as Record<string, unknown>;

  return (
    typeof c.friendId === "string" &&
    typeof c.friendName === "string" &&
    typeof c.title === "string" &&
    typeof c.subtitle === "string" &&
    Array.isArray(c.contents)
  );
}
