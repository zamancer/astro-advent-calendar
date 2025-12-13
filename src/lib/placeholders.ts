/**
 * Placeholder Image Service
 * Provides placeholder images for demo mode
 */

import type { PlaceholderService, PlaceholderConfig } from "../types/storage";
import type { ContestLeaderboardEntry } from "../types/database";

// ============================================
// CONFIGURATION
// ============================================

/**
 * Default placeholder configuration
 */
const DEFAULT_CONFIG: PlaceholderConfig = {
  service: "unsplash",
  defaultWidth: 800,
  defaultHeight: 600,
};

// ============================================
// PLACEHOLDER SERVICES
// ============================================

/**
 * Unsplash Source placeholder service
 * Provides random images from Unsplash
 */
const unsplashService = {
  getUrl: (width: number, height: number, query?: string): string => {
    if (query) {
      // Use search query
      return `https://source.unsplash.com/${width}x${height}/?${query}`;
    }

    // Use random featured image
    return `https://source.unsplash.com/random/${width}x${height}`;
  },
};

/**
 * Picsum Photos placeholder service
 * Provides random images from Lorem Picsum
 */
const picsumService = {
  getUrl: (width: number, height: number, seed?: string): string => {
    if (seed) {
      return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    }
    return `https://picsum.photos/${width}/${height}`;
  },
};

/**
 * Placeholder.com service
 * Provides simple colored placeholder images
 */
const placeholderService = {
  getUrl: (width: number, height: number, text?: string): string => {
    const baseUrl = `https://via.placeholder.com/${width}x${height}`;
    if (text) {
      return `${baseUrl}?text=${encodeURIComponent(text)}`;
    }
    return baseUrl;
  },
};

// ============================================
// MAIN PLACEHOLDER SERVICE
// ============================================

/**
 * Create a placeholder service instance
 * @param config Placeholder configuration
 * @returns Placeholder service
 */
export function createPlaceholderService(
  config: Partial<PlaceholderConfig> = {}
): PlaceholderService {
  const fullConfig: PlaceholderConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  return {
    /**
     * Get a generic placeholder URL
     */
    getPlaceholderUrl: (
      width: number,
      height: number,
      text?: string
    ): string => {
      switch (fullConfig.service) {
        case "unsplash":
          return unsplashService.getUrl(width, height, text);

        case "picsum":
          return picsumService.getUrl(width, height, text);

        case "placeholder":
          return placeholderService.getUrl(width, height, text);

        case "custom":
          if (fullConfig.baseUrl) {
            return `${fullConfig.baseUrl}/${width}x${height}`;
          }
          // Fall back to placeholder.com
          return placeholderService.getUrl(width, height, text);

        default:
          return unsplashService.getUrl(width, height, text);
      }
    },

    /**
     * Get a placeholder for a friend
     */
    getFriendPlaceholder: (friendName: string): string => {
      const seed = friendName.toLowerCase().replace(/\s+/g, "-");
      return picsumService.getUrl(
        fullConfig.defaultWidth,
        fullConfig.defaultHeight,
        seed
      );
    },

    /**
     * Get a placeholder for a window
     */
    getWindowPlaceholder: (windowNumber: number): string => {
      return picsumService.getUrl(
        fullConfig.defaultWidth,
        fullConfig.defaultHeight,
        `window-${windowNumber}`
      );
    },
  };
}

// ============================================
// DEFAULT INSTANCE
// ============================================

/**
 * Default placeholder service instance
 */
export const placeholders = createPlaceholderService();

// ============================================
// THEMED PLACEHOLDER COLLECTIONS
// ============================================

/**
 * Christmas-themed image collections from Unsplash
 */
export const christmasImages = {
  snow: [
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1482849297070-f4fae2173efe?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&auto=format&fit=crop",
  ],
  ornaments: [
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&auto=format&fit=crop",
  ],
  lights: [
    "https://images.unsplash.com/photo-1482849297070-f4fae2173efe?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?w=800&auto=format&fit=crop",
  ],
  gifts: [
    "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800&auto=format&fit=crop",
  ],
  winter: [
    "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1478827536114-da961b7f86f2?w=800&auto=format&fit=crop",
  ],
};

/**
 * Get a random Christmas-themed image
 * @param category Optional category
 * @returns Image URL
 */
export function getRandomChristmasImage(
  category?: keyof typeof christmasImages
): string {
  if (category && christmasImages[category]) {
    const images = christmasImages[category];
    return images[Math.floor(Math.random() * images.length)];
  }

  // Get random from all categories
  const allImages = Object.values(christmasImages).flat();
  return allImages[Math.floor(Math.random() * allImages.length)];
}

/**
 * Get a Christmas-themed image by index
 * @param index Index (0-based)
 * @returns Image URL
 */
export function getChristmasImageByIndex(index: number): string {
  const allImages = Object.values(christmasImages).flat();
  const safeIndex = index % allImages.length;
  return allImages[safeIndex];
}

/**
 * Get a deterministic placeholder based on friend ID and window number
 * @param friendId Friend's unique ID
 * @param windowNumber Window number
 * @returns Placeholder image URL
 */
export function getDeterministicPlaceholder(
  friendId: string,
  windowNumber: number
): string {
  // Create a simple hash from friendId and windowNumber
  const hash = Array.from(friendId + windowNumber.toString()).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );

  const allImages = Object.values(christmasImages).flat();
  const index = hash % allImages.length;

  return allImages[index];
}

// ============================================
// DEMO LEADERBOARD DATA
// ============================================

export function getDemoLeaderboardWidgetData(): ContestLeaderboardEntry[] {
  return [
    {
      friend_id: "demo-1",
      name: "Demo Player 1",
      windows_opened: 5,
      base_points: 50,
      streak_bonus: 0,
      total_points: 65,
      total_reaction_time: 1200,
      first_place_count: 3,
      completed_at: null,
      last_window_opened_at: new Date().toISOString(),
      rank: 1,
    },
    {
      friend_id: "demo-2",
      name: "Demo Player 2",
      windows_opened: 4,
      base_points: 40,
      streak_bonus: 0,
      total_points: 48,
      total_reaction_time: 2400,
      first_place_count: 1,
      completed_at: null,
      last_window_opened_at: new Date().toISOString(),
      rank: 2,
    },
    {
      friend_id: "demo-3",
      name: "Demo Player 3",
      windows_opened: 3,
      base_points: 30,
      streak_bonus: 0,
      total_points: 35,
      total_reaction_time: 3600,
      first_place_count: 0,
      completed_at: null,
      last_window_opened_at: new Date().toISOString(),
      rank: 3,
    },
  ];
}

export function getDemoLeaderboardDisplayData(): ContestLeaderboardEntry[] {
  return [
    {
      friend_id: "demo-1",
      name: "Demo Player 1",
      windows_opened: 5,
      base_points: 50,
      streak_bonus: 0,
      total_points: 65,
      total_reaction_time: 1200,
      first_place_count: 3,
      completed_at: null,
      last_window_opened_at: new Date().toISOString(),
      rank: 1,
    },
    {
      friend_id: "demo-2",
      name: "Demo Player 2",
      windows_opened: 4,
      base_points: 40,
      streak_bonus: 0,
      total_points: 48,
      total_reaction_time: 2400,
      first_place_count: 1,
      completed_at: null,
      last_window_opened_at: new Date().toISOString(),
      rank: 2,
    },
  ];
}
