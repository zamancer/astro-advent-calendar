"use client";

// Modal component to display calendar content

import { useEffect, useState, useCallback, useRef } from "react";
import type { CalendarContent } from "../types/calendar";
import PhotoContent from "./content/PhotoContent";
import SpotifyContent from "./content/SpotifyContent";
import TextContent from "./content/TextContent";
import MessageContent from "./content/MessageContent";
import YouTubeContent from "./content/YouTubeContent";

interface ContentModalProps {
  content: CalendarContent | null;
  isOpen: boolean;
  onClose: () => void;
  unlockedDays?: number[];
  onNavigate?: (day: number) => void;
}

// Minimum swipe distance (in pixels) to trigger navigation
const SWIPE_THRESHOLD = 50;

export default function ContentModal({
  content,
  isOpen,
  onClose,
  unlockedDays = [],
  onNavigate,
}: ContentModalProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"up" | "down" | null>(
    null
  );
  const modalRef = useRef<HTMLDivElement>(null);

  // Get sorted unlocked days for navigation
  const sortedUnlockedDays = [...unlockedDays].sort((a, b) => a - b);

  // Find adjacent unlocked days
  const getAdjacentDays = useCallback(() => {
    if (!content) return { prev: null, next: null };

    const currentIndex = sortedUnlockedDays.indexOf(content.day);
    if (currentIndex === -1) return { prev: null, next: null };

    const prevDay =
      currentIndex > 0 ? sortedUnlockedDays[currentIndex - 1] : null;
    const nextDay =
      currentIndex < sortedUnlockedDays.length - 1
        ? sortedUnlockedDays[currentIndex + 1]
        : null;

    return { prev: prevDay, next: nextDay };
  }, [content, sortedUnlockedDays]);

  const { prev: prevDay, next: nextDay } = getAdjacentDays();

  // Navigate to adjacent window
  const navigateTo = useCallback(
    (day: number | null) => {
      if (day !== null && onNavigate) {
        onNavigate(day);
      }
    },
    [onNavigate]
  );

  // Handle keyboard navigation and escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && prevDay !== null) {
        e.preventDefault();
        navigateTo(prevDay);
      } else if (e.key === "ArrowRight" && nextDay !== null) {
        e.preventDefault();
        navigateTo(nextDay);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, prevDay, nextDay, navigateTo]);

  // Check if an element or its ancestors are scrollable
  const isInsideScrollableElement = (element: EventTarget | null): boolean => {
    if (!(element instanceof HTMLElement)) return false;

    let current: HTMLElement | null = element;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY;
      const isScrollable =
        (overflowY === "auto" || overflowY === "scroll") &&
        current.scrollHeight > current.clientHeight;

      if (isScrollable) return true;
      current = current.parentElement;
    }
    return false;
  };

  // Track if touch started in a scrollable area
  const touchStartedInScrollable = useRef(false);

  // Touch handlers for swipe navigation (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Check if touch originated from a scrollable element
    touchStartedInScrollable.current = isInsideScrollableElement(e.target);

    // If inside scrollable content, don't track for navigation
    if (touchStartedInScrollable.current) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Skip if touch started in scrollable area
    if (touchStartedInScrollable.current || touchStart === null) return;

    const currentTouch = e.targetTouches[0].clientY;
    setTouchEnd(currentTouch);

    // Show visual feedback during swipe
    const diff = touchStart - currentTouch;
    if (diff > 20 && nextDay !== null) {
      setSwipeDirection("up");
    } else if (diff < -20 && prevDay !== null) {
      setSwipeDirection("down");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    // Skip if touch started in scrollable area
    if (touchStartedInScrollable.current) {
      touchStartedInScrollable.current = false;
      return;
    }

    if (!touchStart || !touchEnd) {
      setSwipeDirection(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > SWIPE_THRESHOLD;
    const isSwipeDown = distance < -SWIPE_THRESHOLD;

    // Swipe up = go to next day, Swipe down = go to previous day
    if (isSwipeUp && nextDay !== null) {
      navigateTo(nextDay);
    } else if (isSwipeDown && prevDay !== null) {
      navigateTo(prevDay);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setSwipeDirection(null);
    touchStartedInScrollable.current = false;
  };

  if (!isOpen || !content) return null;

  const hasNavigation = onNavigate && unlockedDays.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      onTouchStart={hasNavigation ? handleTouchStart : undefined}
      onTouchMove={hasNavigation ? handleTouchMove : undefined}
      onTouchEnd={hasNavigation ? handleTouchEnd : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Swipe indicator (mobile) - shows during active swipe */}
      {hasNavigation && swipeDirection && (
        <div
          className={`absolute z-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-accent/90 rounded-full text-background text-sm font-medium transition-all ${
            swipeDirection === "up" ? "bottom-8" : "top-8"
          }`}
        >
          {swipeDirection === "up" ? `Day ${nextDay}` : `Day ${prevDay}`}
        </div>
      )}

      {/* Desktop navigation buttons */}
      {hasNavigation && prevDay !== null && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateTo(prevDay);
          }}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={`Go to day ${prevDay}`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {hasNavigation && nextDay !== null && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateTo(nextDay);
          }}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={`Go to day ${nextDay}`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Modal content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Day badge */}
        <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/90 dark:bg-white/95 rounded-full shadow-lg">
          <span className="text-sm font-bold text-gray-900">
            Day {content.day}
          </span>
        </div>

        {/* Content based on type */}
        <div className="p-8 pt-16">
          {content.type === "photo" && <PhotoContent content={content} />}
          {content.type === "spotify" && <SpotifyContent content={content} />}
          {content.type === "text" && <TextContent content={content} />}
          {content.type === "message" && <MessageContent content={content} />}
          {content.type === "youtube" && <YouTubeContent content={content} />}
        </div>
      </div>
    </div>
  );
}
