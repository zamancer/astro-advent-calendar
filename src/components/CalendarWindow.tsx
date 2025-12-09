"use client";

// Reusable calendar window/door component with animations

import { useState } from "react";
import type { CalendarContent } from "../types/calendar";

interface CalendarWindowProps {
  day: number;
  content: CalendarContent;
  isOpened: boolean;
  isUnlocked: boolean;
  onOpen: (day: number) => void;
}

export default function CalendarWindow({
  day,
  content,
  isOpened,
  isUnlocked,
  onOpen,
}: CalendarWindowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isUnlocked) {
      onOpen(day);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={!isUnlocked}
      className={`
        relative aspect-square rounded-lg overflow-hidden
        transition-all duration-300 ease-out
        ${!isUnlocked ? "opacity-50 cursor-not-allowed" : ""}
        ${isUnlocked && isHovered ? "scale-105 shadow-2xl" : "shadow-lg"}
        ${isOpened ? "ring-2 ring-accent" : ""}
        ${isUnlocked && !isOpened ? "ring-2 ring-blue-500" : ""}
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
      `}
      aria-label={`Day ${day}${!isUnlocked ? " (locked)" : ""}${isOpened ? " (opened)" : ""}`}
    >
      {/* Background with gradient */}
      <div
        className={`
        absolute inset-0 bg-gradient-to-br from-card to-card-dark
        transition-opacity duration-300
        ${isOpened ? "opacity-70" : "opacity-100"}
        ${!isUnlocked ? "grayscale" : ""}
      `}
      />

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern
            id={`pattern-${day}`}
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="1"
              fill="currentColor"
              className="text-accent"
            />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#pattern-${day})`} />
        </svg>
      </div>

      {/* Lock icon for locked windows */}
      {!isUnlocked && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <svg
            className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3z"/>
          </svg>
        </div>
      )}

      {/* Unlock date for locked windows */}
      {!isUnlocked && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
          <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            {content.unlockDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      )}

      {/* Day number */}
      <div className="relative h-full flex flex-col items-center justify-center p-4">
        <span className={`text-5xl md:text-6xl font-serif font-bold mb-2 ${!isUnlocked ? "text-muted-foreground" : "text-foreground"}`}>
          {day}
        </span>

        {isOpened && (
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Opened
          </span>
        )}

        {!isOpened && isUnlocked && isHovered && (
          <span className="text-xs uppercase tracking-wider text-accent font-medium animate-pulse">
            Click to open
          </span>
        )}
      </div>

      {/* Shine effect on hover (only for unlocked windows) */}
      {isHovered && !isOpened && isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </button>
  );
}
