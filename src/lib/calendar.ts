// Calendar unlock validation logic

import type { CalendarContent } from '../types/calendar';

/**
 * Checks if a window is currently unlocked based on date
 * @param unlockDate - The date when the window unlocks
 * @returns true if window is unlocked (current time >= unlock time)
 */
export function isWindowUnlocked(unlockDate: Date): boolean {
  const now = new Date();
  return now >= unlockDate;
}

/**
 * Gets the number of currently unlocked windows
 * @param calendarContent - Array of calendar content configs
 * @returns Count of windows that are currently unlocked
 */
export function getUnlockedCount(calendarContent: CalendarContent[]): number {
  return calendarContent.filter(content =>
    isWindowUnlocked(content.unlockDate)
  ).length;
}

/**
 * Gets the next window that will unlock
 * @param calendarContent - Array of calendar content configs
 * @returns Next unlock date or null if all unlocked
 */
export function getNextUnlockDate(calendarContent: CalendarContent[]): Date | null {
  const now = new Date();
  const futureWindows = calendarContent
    .filter(content => content.unlockDate > now)
    .sort((a, b) => a.unlockDate.getTime() - b.unlockDate.getTime());

  return futureWindows.length > 0 ? futureWindows[0].unlockDate : null;
}

/**
 * Formats time remaining until unlock
 * @param unlockDate - The date when window unlocks
 * @returns Human-readable string like "2 days 5 hours"
 */
export function getTimeUntilUnlock(unlockDate: Date): string {
  const now = new Date();
  const diff = unlockDate.getTime() - now.getTime();

  if (diff <= 0) return 'Available now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours}h`;
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}

/**
 * DEV MODE ONLY: Override unlock checks for testing
 * Set via environment variable DEV_UNLOCK_ALL=true
 */
export function shouldBypassUnlockCheck(): boolean {
  return import.meta.env.DEV && import.meta.env.DEV_UNLOCK_ALL === 'true';
}
