/**
 * Contest Utilities
 * Constants and helper functions for the Advent Calendar contest
 */

// ============================================
// CONTEST CONSTANTS
// ============================================

/**
 * Contest end time: December 24, 2025 at 11:59 PM Mexico City time (CST/UTC-6)
 * ISO timestamp: 2025-12-25T05:59:00Z
 */
export const CONTEST_END_TIME = new Date("2025-12-25T05:59:00Z");

/**
 * Number of windows in the advent calendar contest
 */
export const TOTAL_CONTEST_WINDOWS = 12;

// ============================================
// CONTEST STATUS FUNCTIONS
// ============================================

/**
 * Check if the contest has ended
 * @returns true if current time is past the contest end time
 */
export function isContestEnded(): boolean {
  return new Date() > CONTEST_END_TIME;
}

/**
 * Get milliseconds until contest end
 * @returns milliseconds remaining (0 if contest has ended)
 */
export function getTimeUntilContestEnd(): number {
  return Math.max(0, CONTEST_END_TIME.getTime() - Date.now());
}

/**
 * Get human-readable time remaining until contest end
 * @returns object with days, hours, minutes, seconds remaining
 */
export function getTimeRemainingBreakdown(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = getTimeUntilContestEnd();

  if (total === 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const seconds = Math.floor(total / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    total,
  };
}

/**
 * Format contest end time for display
 * @param locale - Optional locale for formatting (defaults to 'en-US')
 * @param timeZone - Optional timezone for formatting (defaults to 'America/Mexico_City')
 * @returns formatted date string
 */
export function formatContestEndTime(
  locale: string = "en-US",
  timeZone: string = "America/Mexico_City"
): string {
  return CONTEST_END_TIME.toLocaleString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  });
}

// ============================================
// CONTEST SCORING CONSTANTS
// ============================================

/**
 * Points awarded for opening any window
 */
export const BASE_POINTS = 10;

/**
 * Bonus points for speed ranking
 */
export const SPEED_BONUS = {
  FIRST: 5, // 1st place
  SECOND: 3, // 2nd place
  THIRD: 1, // 3rd place
} as const;

/**
 * Bonus points for opening all windows (perfect attendance)
 */
export const STREAK_BONUS = 20;

/**
 * Calculate maximum possible points
 * @returns maximum points achievable (all 1st places + perfect streak)
 */
export function getMaximumPoints(): number {
  return (
    (BASE_POINTS + SPEED_BONUS.FIRST) * TOTAL_CONTEST_WINDOWS + STREAK_BONUS
  );
}

/**
 * Calculate minimum points for perfect attendance
 * @returns points for opening all windows with no speed bonuses
 */
export function getPerfectAttendancePoints(): number {
  return BASE_POINTS * TOTAL_CONTEST_WINDOWS + STREAK_BONUS;
}
