"use client";

// Main calendar grid component with state management

import { useState, useEffect } from "react";
import CalendarWindow from "./CalendarWindow";
import ContentModal from "./ContentModal";
import type { CalendarContent } from "../types/calendar";

interface CalendarGridProps {
  contents: CalendarContent[];
}

export default function CalendarGrid({ contents }: CalendarGridProps) {
  const [openedDays, setOpenedDays] = useState<Set<number>>(new Set());
  const [selectedContent, setSelectedContent] =
    useState<CalendarContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load opened days from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("advent-opened-days");
    if (saved) {
      setOpenedDays(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save opened days to localStorage
  useEffect(() => {
    localStorage.setItem("advent-opened-days", JSON.stringify([...openedDays]));
  }, [openedDays]);

  const handleOpenWindow = (day: number) => {
    const content = contents.find((c) => c.day === day);
    if (content) {
      setSelectedContent(content);
      setIsModalOpen(true);
      setOpenedDays((prev) => new Set([...prev, day]));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedContent(null), 300);
  };

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
