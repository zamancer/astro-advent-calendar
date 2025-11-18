"use client";

// Main calendar grid component with state management

import { useState, useEffect } from "react";
import CalendarWindow from "./CalendarWindow";
import ContentModal from "./ContentModal";
import type { CalendarContent } from "../types/calendar";
import { isDemoMode } from "../lib/featureFlags";
import { getCurrentFriend } from "../lib/auth";
import { getFriendWindowOpens, recordWindowOpen } from "../lib/database";

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

  // Load opened days from localStorage or Supabase
  useEffect(() => {
    async function loadProgress() {
      if (isDemoMode()) {
        // Demo mode: use localStorage
        const saved = localStorage.getItem("advent-opened-days");
        if (saved) {
          setOpenedDays(new Set(JSON.parse(saved)));
        }
        setLoading(false);
      } else {
        // Authenticated mode: use Supabase
        try {
          const friend = await getCurrentFriend();
          if (friend) {
            setFriendId(friend.id);
            const { data: windowOpens, error } = await getFriendWindowOpens(friend.id);

            if (error) {
              console.error('Failed to load progress:', error);
            } else {
              const openedWindowNumbers = (windowOpens || []).map((wo) => wo.window_number);
              setOpenedDays(new Set(openedWindowNumbers));
            }
          }
        } catch (error) {
          console.error('Failed to load progress:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadProgress();
  }, []);

  // Save opened days to localStorage in demo mode
  useEffect(() => {
    if (isDemoMode()) {
      localStorage.setItem("advent-opened-days", JSON.stringify([...openedDays]));
    }
  }, [openedDays]);

  const handleOpenWindow = async (day: number) => {
    const content = contents.find((c) => c.day === day);
    if (content) {
      setSelectedContent(content);
      setIsModalOpen(true);

      // Only record if not already opened
      if (!openedDays.has(day)) {
        // Optimistic update: update UI immediately for better UX
        setOpenedDays((prev) => new Set([...prev, day]));

        // Save to Supabase if authenticated
        if (!isDemoMode() && friendId) {
          try {
            const { error } = await recordWindowOpen({
              friend_id: friendId,
              window_number: day,
            });

            // If database write failed, rollback the optimistic update
            if (error) {
              console.error('Failed to record window open:', error);
              setOpenedDays((prev) => {
                const newSet = new Set(prev);
                newSet.delete(day);
                return newSet;
              });
              // Optionally show user-facing error message
              alert('Failed to save your progress. Please try again.');
            }
          } catch (error) {
            console.error('Failed to record window open:', error);
            // Rollback on exception as well
            setOpenedDays((prev) => {
              const newSet = new Set(prev);
              newSet.delete(day);
              return newSet;
            });
            alert('Failed to save your progress. Please try again.');
          }
        }
      }
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
        <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
          Progress
        </p>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((day) => (
            <div
              key={day}
              className={`w-2 h-2 rounded-full transition-colors ${
                openedDays.has(day) ? "bg-accent" : "bg-muted"
              }`}
              aria-label={`Day ${day} ${
                openedDays.has(day) ? "opened" : "not opened"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {openedDays.size} of 12 opened
        </p>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {contents.map((content) => (
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
