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
import { friendConfig as dulesConfig } from "./dules";
import { friendConfig as corConfig } from "./cor";
import { friendConfig as luciaConfig } from "./lucia";
import { friendConfig as ximConfig } from "./xim";
import { friendConfig as drargonConfig } from "./drargon";
import { friendConfig as ginataConfig } from "./ginata";
import { friendConfig as xamsConfig } from "./xams";

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
  ['550e8400-e29b-41d4-a716-446655440002', mikeConfig],
  ['88d67ed9-ddc4-4f4f-b9e0-331fff991012', dulesConfig],
  ['a8c8c14c-c426-41a7-9e11-27ff56ad8511', corConfig],
  ['3255ad59-ab52-471f-b557-aad86ad5cd22', luciaConfig],
  ['e60a3bf2-4fd4-489f-a204-20ff4ec038c4', ximConfig],
  ['a9abbabf-4f18-480f-8dbb-5f4a02409ca3', drargonConfig],
  ['75e7a00d-273f-44ee-ae66-0da90f9520d1', ginataConfig],
  ['297da6f1-e25b-4c12-961e-d8d244e12579', xamsConfig],
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
