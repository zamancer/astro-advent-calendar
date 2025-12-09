"use client";

// Main calendar grid component with state management

import { useState, useEffect } from "react";
import CalendarWindow from "./CalendarWindow";
import ContentModal from "./ContentModal";
import type { CalendarContent } from "../types/calendar";
import { isDemoMode } from "../lib/featureFlags";
import { getCurrentFriend } from "../lib/auth";
import {
  getFriendWindowOpens,
  recordWindowOpen,
  isPostgrestError,
} from "../lib/database";
import {
  getLocalProgress,
  saveLocalProgress,
  queueWindowOpen,
  syncQueue,
  hasPendingSync,
  mergeProgress,
  createConnectionMonitor,
  isOnline,
  type SyncStatus,
} from "../lib/offlineSync";
import { getFriendConfig } from "../config/friends";

interface CalendarGridProps {
  contents: CalendarContent[];
}

export default function CalendarGrid({ contents }: CalendarGridProps) {
  const [openedDays, setOpenedDays] = useState<Set<number>>(new Set());
  const [selectedContent, setSelectedContent] =
    useState<CalendarContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendId, setFriendId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [isOnlineState, setIsOnlineState] = useState(true);
  // Active contents - either friend-specific or default
  const [activeContents, setActiveContents] =
    useState<CalendarContent[]>(contents);

  // Load opened days from localStorage and Supabase
  useEffect(() => {
    async function loadProgress() {
      // Always load from localStorage first for immediate UI
      const localProgress = getLocalProgress();
      setOpenedDays(localProgress);

      if (isDemoMode()) {
        // Demo mode: only use localStorage
        setLoading(false);
      } else {
        // Authenticated mode: sync with Supabase
        try {
          const friend = await getCurrentFriend();
          if (friend) {
            setFriendId(friend.id);

            // Check for friend-specific calendar configuration
            const friendConfig = getFriendConfig(friend.id);
            if (
              friendConfig &&
              friendConfig.contents &&
              friendConfig.contents.length > 0
            ) {
              setActiveContents(friendConfig.contents);
            } else if (friendConfig) {
              console.warn(
                `Friend config for ${friend.id} has invalid contents, using defaults`
              );
            }

            // Load server progress
            const { data: windowOpens, error } = await getFriendWindowOpens(
              friend.id
            );

            if (error) {
              console.error("Failed to load server progress:", error);
              setSyncStatus("error");
            } else {
              const serverProgress = (windowOpens || []).map(
                (wo) => wo.window_number
              );

              // Merge local and server progress
              const mergedProgress = mergeProgress(
                localProgress,
                serverProgress
              );
              setOpenedDays(mergedProgress);

              // Save merged progress locally
              saveLocalProgress(mergedProgress);

              // Check if we have pending syncs and trigger sync
              if (hasPendingSync()) {
                setSyncStatus("syncing");
                const result = await syncQueue();
                if (result.failed > 0) {
                  console.error("Some items failed to sync:", result.errors);
                  setSyncStatus("offline");
                } else {
                  setSyncStatus("synced");
                }
              } else {
                setSyncStatus("synced");
              }
            }
          }
        } catch (error) {
          console.error("Failed to load progress:", error);
          setSyncStatus("error");
        } finally {
          setLoading(false);
        }
      }
    }

    loadProgress();
  }, []);

  // Monitor connection status and auto-sync when online
  useEffect(() => {
    if (isDemoMode()) {
      // No need to monitor connection in demo mode
      return;
    }

    setIsOnlineState(isOnline());

    const cleanup = createConnectionMonitor(
      async () => {
        // Connection restored
        setIsOnlineState(true);

        // Auto-sync pending items
        if (hasPendingSync() && friendId) {
          setSyncStatus("syncing");
          try {
            const result = await syncQueue();
            if (result.synced > 0) {
              // Successfully synced items
            }
            setSyncStatus(result.failed > 0 ? "offline" : "synced");
          } catch (error) {
            console.error("Auto-sync failed:", error);
            setSyncStatus("error");
          }
        }
      },
      () => {
        // Connection lost
        setIsOnlineState(false);
        setSyncStatus("offline");
      }
    );

    return cleanup;
  }, [friendId]);

  const handleOpenWindow = (day: number) => {
    const content = activeContents.find((c) => c.day === day);
    if (content) {
      // Update progress BEFORE opening modal for better sync
      // Only record if not already opened
      if (!openedDays.has(day)) {
        // Use functional update to avoid race conditions with rapid clicks
        setOpenedDays((prev) => {
          if (prev.has(day)) {
            return prev; // Already opened, no update needed
          }
          const newOpenedDays = new Set(prev);
          newOpenedDays.add(day);

          // Always save to localStorage immediately (works offline)
          saveLocalProgress(newOpenedDays);

          return newOpenedDays;
        });

        // Snapshot friendId before async operation to avoid issues if state changes
        const currentFriendId = friendId;

        // Save to Supabase if authenticated (non-blocking for instant modal)
        if (!isDemoMode() && currentFriendId) {
          setSyncStatus("syncing");

          // Fire and forget - don't block modal opening
          recordWindowOpen({
            friend_id: currentFriendId,
            window_number: day,
          })
            .then(({ error }) => {
              if (error) {
                console.error("Failed to record window open:", error);

                // Check if it's a duplicate error (already saved)
                // Use type guard to safely access error.code
                const isDuplicate =
                  (isPostgrestError(error) &&
                    (error.code === "PGRST116" || error.code === "23505")) ||
                  error.message?.includes("duplicate") ||
                  error.message?.includes("unique");

                if (!isDuplicate) {
                  // Queue for later sync
                  queueWindowOpen({
                    friend_id: currentFriendId,
                    window_number: day,
                  });
                  setSyncStatus("offline");
                } else {
                  // Already saved, all good
                  setSyncStatus("synced");
                }
              } else {
                // Successfully saved to cloud
                setSyncStatus("synced");
              }
            })
            .catch((error) => {
              console.error("Failed to record window open:", error);

              // Queue for later sync
              queueWindowOpen({
                friend_id: currentFriendId,
                window_number: day,
              });
              setSyncStatus("offline");
            });
        }
      }

      // Open modal immediately after progress update (don't wait for DB)
      setSelectedContent(content);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedContent(null), 300);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Progress indicator */}
      <div className="mb-8 text-center">
        <p className="text-muted-foreground text-sm uppercase tracking-wider mb-3">
          Progress
        </p>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mb-3">
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(
                  100,
                  (openedDays.size / (activeContents.length || 1)) * 100
                )}%`,
              }}
              aria-label={`${openedDays.size} of ${activeContents.length} windows opened`}
            />
          </div>
        </div>

        {/* Progress text */}
        <p className="text-sm font-medium">
          <span className="text-green-600 dark:text-green-500">
            {openedDays.size}
          </span>
          <span className="text-muted-foreground">
            {" "}
            of {activeContents.length} opened
          </span>
        </p>

        {/* Sync status indicator (only in authenticated mode) */}
        {!isDemoMode() && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                syncStatus === "synced"
                  ? "bg-green-500"
                  : syncStatus === "syncing"
                  ? "bg-blue-500 animate-pulse"
                  : syncStatus === "offline"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              aria-label={`Sync status: ${syncStatus}`}
            />
            <p className="text-xs text-muted-foreground">
              {syncStatus === "synced"
                ? "All changes saved"
                : syncStatus === "syncing"
                ? "Syncing..."
                : syncStatus === "offline"
                ? isOnlineState
                  ? "Pending sync"
                  : "Offline - will sync when online"
                : "Sync error"}
            </p>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {activeContents.map((content) => (
          <CalendarWindow
            key={content.day}
            day={content.day}
            content={content}
            isOpened={openedDays.has(content.day)}
            onOpen={handleOpenWindow}
          />
        ))}
      </div>

      {/* Content modal */}
      <ContentModal
        content={selectedContent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
