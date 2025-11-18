"use client";

// Reusable calendar window/door component with animations

import { useState } from "react";
import type { CalendarContent } from "../types/calendar";

interface CalendarWindowProps {
  day: number;
  content: CalendarContent;
  isOpened: boolean;
  onOpen: (day: number) => void;
}

export default function CalendarWindow({
  day,
  content: _content,
  isOpened,
  onOpen,
}: CalendarWindowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onOpen(day);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative aspect-square rounded-lg overflow-hidden
        transition-all duration-300 ease-out
        ${isHovered ? "scale-105 shadow-2xl" : "shadow-lg"}
        ${isOpened ? "ring-2 ring-accent" : ""}
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
      `}
      aria-label={`Open day ${day}`}
    >
      {/* Background with gradient */}
      <div
        className={`
        absolute inset-0 bg-gradient-to-br from-card to-card-dark
        transition-opacity duration-300
        ${isOpened ? "opacity-70" : "opacity-100"}
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

      {/* Day number */}
      <div className="relative h-full flex flex-col items-center justify-center p-4">
        <span className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-2">
          {day}
        </span>

        {isOpened && (
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Opened
          </span>
        )}

        {!isOpened && isHovered && (
          <span className="text-xs uppercase tracking-wider text-accent font-medium animate-pulse">
            Click to open
          </span>
        )}
      </div>

      {/* Shine effect on hover */}
      {isHovered && !isOpened && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </button>
  );
}
