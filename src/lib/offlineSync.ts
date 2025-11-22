/**
 * Offline Sync Module
 * Handles offline progress tracking with automatic sync when connection is restored
 */

import { recordWindowOpen, isPostgrestError } from './database';
import type { FriendWindowOpenInsert } from '../types/database';

const SYNC_QUEUE_KEY = 'advent-sync-queue';
const LOCAL_PROGRESS_KEY = 'advent-opened-days';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface QueuedWindowOpen extends FriendWindowOpenInsert {
  timestamp: number;
}

/**
 * Get the current sync queue from localStorage
 */
function getSyncQueue(): QueuedWindowOpen[] {
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Failed to read sync queue:', error);
    return [];
  }
}

/**
 * Save the sync queue to localStorage
 */
function setSyncQueue(queue: QueuedWindowOpen[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to save sync queue:', error);
  }
}

/**
 * Add a window open to the sync queue
 */
export function queueWindowOpen(windowOpen: FriendWindowOpenInsert): void {
  const queue = getSyncQueue();
  const queuedItem: QueuedWindowOpen = {
    ...windowOpen,
    timestamp: Date.now(),
  };
  queue.push(queuedItem);
  setSyncQueue(queue);
}

/**
 * Get the local progress from localStorage
 */
export function getLocalProgress(): Set<number> {
  try {
    const saved = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (error) {
    console.error('Failed to read local progress:', error);
    return new Set();
  }
}

/**
 * Save progress to localStorage
 */
export function saveLocalProgress(openedDays: Set<number>): void {
  try {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify([...openedDays]));
  } catch (error) {
    console.error('Failed to save local progress:', error);
  }
}

/**
 * Sync the queue with Supabase
 * Returns the number of items successfully synced
 */
export async function syncQueue(): Promise<{ synced: number; failed: number; errors: Error[] }> {
  const queue = getSyncQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, errors: [] };
  }

  const results = {
    synced: 0,
    failed: 0,
    errors: [] as Error[],
  };

  const remainingQueue: QueuedWindowOpen[] = [];
  const originalTimestamps = new Set(queue.map((item) => item.timestamp));

  for (const item of queue) {
    try {
      const { error } = await recordWindowOpen({
        friend_id: item.friend_id,
        window_number: item.window_number,
      });

      if (error) {
        // Check if it's a duplicate error (PGRST116 or unique constraint violation)
        // In this case, we can safely remove it from the queue
        // Use type guard to safely access error.code
        const isDuplicate =
          (isPostgrestError(error) &&
            (error.code === 'PGRST116' || error.code === '23505')) ||
          error.message?.includes('duplicate') ||
          error.message?.includes('unique');

        if (isDuplicate) {
          // Already synced, don't re-queue
          results.synced++;
        } else {
          // Real error, keep in queue
          remainingQueue.push(item);
          results.failed++;
          results.errors.push(error as Error);
        }
      } else {
        results.synced++;
      }
    } catch (error) {
      // Network or other error, keep in queue
      remainingQueue.push(item);
      results.failed++;
      results.errors.push(error as Error);
    }
  }

  // Prevent race condition: Check if new items were added during processing
  // Read current queue from storage and merge any items that weren't in our original snapshot
  const currentQueue = getSyncQueue();
  const newItemsAddedDuringSync = currentQueue.filter(
    (item) => !originalTimestamps.has(item.timestamp)
  );

  // Merge: failed items from our processing + any new items added concurrently
  // Preserve chronological order by sorting by timestamp
  const mergedQueue = [...remainingQueue, ...newItemsAddedDuringSync].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  // Update the queue with the merged result
  setSyncQueue(mergedQueue);

  return results;
}

/**
 * Check if there are pending items in the sync queue
 */
export function hasPendingSync(): boolean {
  return getSyncQueue().length > 0;
}

/**
 * Clear the sync queue (use with caution!)
 */
export function clearSyncQueue(): void {
  setSyncQueue([]);
}

/**
 * Merge local progress with server progress
 * Returns the combined set of opened days
 */
export function mergeProgress(localProgress: Set<number>, serverProgress: number[]): Set<number> {
  const merged = new Set(localProgress);
  serverProgress.forEach((day) => merged.add(day));
  return merged;
}

/**
 * Create a connection monitor that tracks online/offline status
 */
export function createConnectionMonitor(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  const handleOnline = () => {
    onOnline();
  };

  const handleOffline = () => {
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Check if the browser is currently online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}
