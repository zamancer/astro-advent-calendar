/**
 * Friend Configuration Registry
 *
 * This file serves as the central registry for all friend configurations.
 * Import and register each friend's configuration here to make it available
 * to the application.
 *
 * USAGE:
 * 1. Create a new friend configuration file (copy template.ts)
 * 2. Import it in this file
 * 3. Add it to the friendConfigs map using the friend's database ID as the key
 * 4. The configuration will automatically be available via getFriendConfig()
 */

import type { FriendCalendarConfig } from "../../types/calendar";
import { friendConfig as mikeConfig } from "./example-mike";

// ============================================
// IMPORT FRIEND CONFIGURATIONS
// ============================================
// Import your friend configurations here
// Example:
// import { friendConfig as sarahConfig } from './sarah-smith';
// import { friendConfig as johnConfig } from './john-doe';

// ============================================
// FRIEND CONFIGURATION MAP
// ============================================

/**
 * Registry of all friend configurations
 * Key: Friend ID from database
 * Value: Friend calendar configuration
 *
 * IMPORTANT: The key must match the friend's ID in the 'friends' database table
 */
export const friendConfigs = new Map<string, FriendCalendarConfig>([
  // Add your friend configurations here
  // Example:
  // ['friend-id-uuid-here', sarahConfig],
  // ['another-friend-id', johnConfig],
  ['550e8400-e29b-41d4-a716-446655440002', mikeConfig]
]);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Gets a friend's calendar configuration by their ID
 *
 * @param friendId - The friend's ID from the database
 * @returns The friend's calendar configuration, or undefined if not found
 */
export function getFriendConfig(
  friendId: string
): FriendCalendarConfig | undefined {
  return friendConfigs.get(friendId);
}

/**
 * Checks if a configuration exists for a given friend ID
 *
 * @param friendId - The friend's ID from the database
 * @returns True if a configuration exists
 */
export function hasFriendConfig(friendId: string): boolean {
  return friendConfigs.has(friendId);
}

/**
 * Gets all registered friend IDs
 *
 * @returns Array of all friend IDs that have configurations
 */
export function getAllFriendIds(): string[] {
  return Array.from(friendConfigs.keys());
}

/**
 * Gets the total number of registered friend configurations
 *
 * @returns Count of friend configurations
 */
export function getFriendConfigCount(): number {
  return friendConfigs.size;
}

/**
 * Gets all friend configurations
 *
 * @returns Array of all friend configurations
 */
export function getAllFriendConfigs(): FriendCalendarConfig[] {
  return Array.from(friendConfigs.values());
}

/**
 * Gets a friend configuration with validation
 * Throws an error if the configuration doesn't exist or is invalid
 *
 * @param friendId - The friend's ID from the database
 * @returns The friend's calendar configuration
 * @throws Error if configuration not found
 */
export function getFriendConfigOrThrow(friendId: string): FriendCalendarConfig {
  const config = getFriendConfig(friendId);

  if (!config) {
    throw new Error(
      `No configuration found for friend ID: ${friendId}. ` +
        `Make sure to add the friend's configuration to src/config/friends/index.ts`
    );
  }

  return config;
}
