/**
 * Calendar Unlock Utilities
 * Handles date-based window unlocking logic for the advent calendar
 */

import type { CalendarContent } from "../types/calendar";

/**
 * Calendar unlock configuration
 * Windows unlock starting Dec 13, 2025 (one per day through Dec 24)
 */
export const CALENDAR_START_DATE = new Date("2025-12-13T00:00:00");
export const TOTAL_WINDOWS = 12; // Windows 1-12 for Dec 13-24

/**
 * Creates an unlock date for a given window number
 * Window 1 unlocks Dec 13, Window 2 unlocks Dec 14, ..., Window 12 unlocks Dec 24
 *
 * @param windowNumber - The window number (1-12)
 * @returns Date when the window unlocks (midnight local time)
 */
export function createUnlockDate(windowNumber: number): Date {
  const unlockDate = new Date(CALENDAR_START_DATE);
  unlockDate.setDate(unlockDate.getDate() + (windowNumber - 1));
  return unlockDate;
}

/**
 * Checks if a window is currently unlocked based on date
 *
 * @param unlockDate - The date when the window unlocks
 * @returns true if window is unlocked (current time >= unlock time)
 */
export function isWindowUnlocked(unlockDate: Date): boolean {
  const now = getCurrentDate();
  return now >= unlockDate;
}

/**
 * Checks if a window is unlocked by window number
 * Uses the standard Dec 13-24 unlock schedule
 *
 * @param windowNumber - The window number (1-12)
 * @returns true if window is unlocked
 */
export function isWindowUnlockedByDay(windowNumber: number): boolean {
  const unlockDate = createUnlockDate(windowNumber);
  return isWindowUnlocked(unlockDate);
}

/**
 * Gets the number of currently unlocked windows
 *
 * @param totalWindows - Total number of windows in the calendar
 * @returns Count of windows that are currently unlocked
 */
export function getUnlockedCount(totalWindows: number = TOTAL_WINDOWS): number {
  let count = 0;
  for (let i = 1; i <= totalWindows; i++) {
    if (isWindowUnlockedByDay(i)) {
      count++;
    }
  }
  return count;
}

/**
 * Gets the number of unlocked windows from calendar content array
 *
 * @param calendarContent - Array of calendar content configs
 * @returns Count of windows that are currently unlocked
 */
export function getUnlockedCountFromContent(
  calendarContent: CalendarContent[]
): number {
  return calendarContent.filter((content) => isWindowUnlockedByDay(content.day))
    .length;
}

/**
 * Gets the next window unlock date
 *
 * @param totalWindows - Total number of windows in the calendar
 * @returns Next unlock date or null if all unlocked
 */
export function getNextUnlockDate(
  totalWindows: number = TOTAL_WINDOWS
): Date | null {
  const now = getCurrentDate();

  for (let i = 1; i <= totalWindows; i++) {
    const unlockDate = createUnlockDate(i);
    if (unlockDate > now) {
      return unlockDate;
    }
  }

  return null;
}

/**
 * Formats time remaining until unlock
 *
 * @param unlockDate - The date when window unlocks
 * @returns Human-readable string like "2 days 5h" or "5 hours"
 */
export function getTimeUntilUnlock(unlockDate: Date): string {
  const now = getCurrentDate();
  const diff = unlockDate.getTime() - now.getTime();

  if (diff <= 0) return "Available now";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m`;
}

/**
 * Formats the unlock date for display
 *
 * @param windowNumber - The window number (1-12)
 * @returns Formatted date string like "Dec 12"
 */
export function formatUnlockDate(windowNumber: number): string {
  const unlockDate = createUnlockDate(windowNumber);
  return unlockDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculates the number of seconds elapsed since a window unlocked
 * This provides a timezone-normalized metric for comparing open times
 *
 * For example, if window 1 unlocks at midnight Dec 12 local time:
 * - Netherlands user opens at 00:05 local → 300 seconds
 * - Mexico user opens at 00:05 local → 300 seconds
 * These are now comparable even though the UTC times differ
 *
 * @param windowNumber - The window number (1-12)
 * @returns Seconds since unlock, or 0 if window hasn't unlocked yet
 */
export function getSecondsAfterUnlock(windowNumber: number): number {
  const now = getCurrentDate();
  const unlockDate = createUnlockDate(windowNumber);

  // If window hasn't unlocked yet, return 0
  if (now < unlockDate) {
    return 0;
  }

  const diffMs = now.getTime() - unlockDate.getTime();
  return Math.floor(diffMs / 1000);
}

/**
 * DEV MODE ONLY: Override unlock checks for testing
 * Set via environment variable DEV_UNLOCK_ALL=true
 */
export function shouldBypassUnlockCheck(): boolean {
  // Check for client-side environment variable
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // Development bypass
    if (import.meta.env.DEV && import.meta.env.DEV_UNLOCK_ALL === "true") {
      return true;
    }
    // Emergency production bypass
    if (import.meta.env.PUBLIC_EMERGENCY_UNLOCK === "true") {
      return true;
    }
  }
  return false;
}

// ============================================
// DATE SIMULATION (for development/testing)
// ============================================

/**
 * Mock date storage for programmatic testing
 */
let mockDate: Date | null = null;

/**
 * TEST HELPER: Simulate current date for testing
 * Use in tests to mock "today's date"
 */
export function setMockCurrentDate(date: Date | null): void {
  mockDate = date;
}

/**
 * Gets the simulated date from environment variable
 * Format: YYYY-MM-DD (simulates midnight local time on that date)
 * Example: DEV_SIMULATE_DATE=2025-12-15
 */
function getEnvSimulatedDate(): Date | null {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const simulatedDateStr =
      import.meta.env.DEV_SIMULATE_DATE || import.meta.env.PUBLIC_SIMULATE_DATE;
    if (simulatedDateStr) {
      // Remove quotes if present (from .env file)
      const cleanDateStr = simulatedDateStr.replace(/['"]/g, "").trim();

      // Parse YYYY-MM-DD format as local midnight
      const dateMatch = cleanDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        const parsed = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1, // months are 0-indexed
          parseInt(day, 10),
          0,
          0,
          0 // midnight local time
        );
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }

      console.warn(
        `Invalid date format: "${simulatedDateStr}". Use YYYY-MM-DD (e.g., 2025-12-15)`
      );
    }
  }
  return null;
}

/**
 * Get the current date for unlock calculations
 * Priority: 1) Programmatic mock, 2) ENV simulated date, 3) Real current date
 */
export function getCurrentDate(): Date {
  // First priority: programmatic mock (for unit tests)
  if (mockDate) {
    return mockDate;
  }

  // Second priority: environment variable simulation
  const envDate = getEnvSimulatedDate();
  if (envDate) {
    return envDate;
  }

  // Default: real current date
  return new Date();
}

/**
 * Check if date simulation is active (for UI indicator)
 */
export function isDateSimulationActive(): boolean {
  return mockDate !== null || getEnvSimulatedDate() !== null;
}

/**
 * Get the simulated date string for display (if active)
 */
export function getSimulatedDateDisplay(): string | null {
  const date = mockDate || getEnvSimulatedDate();
  if (date) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return null;
}
