"use client";

// Reusable calendar window/door component with animations

import { useState } from "react";
import type { CalendarContent } from "../types/calendar";
import { formatUnlockDate } from "../lib/calendar";

interface CalendarWindowProps {
  day: number;
  content: CalendarContent;
  isOpened: boolean;
  isUnlocked: boolean;
  onOpen: (day: number) => void;
}

export default function CalendarWindow({
  day,
  content: _content,
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
      onMouseEnter={() => isUnlocked && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={!isUnlocked}
      className={`
        relative aspect-square rounded-lg overflow-hidden
        transition-all duration-300 ease-out
        ${isUnlocked && isHovered ? "scale-105 shadow-2xl" : "shadow-lg"}
        ${isOpened ? "ring-2 ring-accent" : ""}
        ${!isUnlocked ? "opacity-60 cursor-not-allowed grayscale-30" : ""}
        ${isUnlocked && !isOpened ? "ring-1 ring-accent/30" : ""}
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
        disabled:cursor-not-allowed
      `}
      aria-label={`Window ${day}${
        !isUnlocked ? " (locked until " + formatUnlockDate(day) + ")" : ""
      }${isOpened ? " (opened)" : ""}`}
    >
      {/* Background with gradient */}
      <div
        className={`
        absolute inset-0 bg-linear-to-br from-card to-card-dark
        transition-opacity duration-300
        ${isOpened ? "opacity-70" : "opacity-100"}
        ${!isUnlocked ? "opacity-80" : ""}
      `}
      />

      {/* Decorative pattern overlay */}
      <div
        className={`absolute inset-0 ${
          !isUnlocked ? "opacity-5" : "opacity-10"
        }`}
      >
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

      {/* Day number */}
      <div className="relative h-full flex flex-col items-center justify-center p-4">
        <span
          className={`text-5xl md:text-6xl font-serif font-bold mb-2 ${
            !isUnlocked ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {day}
        </span>

        {/* Opened state */}
        {isOpened && (
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Opened
          </span>
        )}

        {/* Locked state - show lock icon and unlock date */}
        {!isUnlocked && (
          <div className="flex flex-col items-center gap-1">
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              {formatUnlockDate(day)}
            </span>
          </div>
        )}

        {/* Unlocked but not opened - hover prompt */}
        {isUnlocked && !isOpened && isHovered && (
          <span className="text-xs uppercase tracking-wider text-accent font-medium animate-pulse">
            Click to open
          </span>
        )}
      </div>

      {/* Shine effect on hover (only for unlocked, unopened windows) */}
      {isUnlocked && isHovered && !isOpened && (
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </button>
  );
}
