"use client";

// Modal component to display calendar content

import { useEffect } from "react";
import type { CalendarContent } from "../types/calendar";
import PhotoContent from "./content/PhotoContent";
import SpotifyContent from "./content/SpotifyContent";
import TextContent from "./content/TextContent";
import MessageContent from "./content/MessageContent";

interface ContentModalProps {
  content: CalendarContent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContentModal({
  content,
  isOpen,
  onClose,
}: ContentModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal content */}
      <div
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
        <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-accent rounded-full">
          <span className="text-sm font-bold text-background">
            Day {content.day}
          </span>
        </div>

        {/* Content based on type */}
        <div className="p-8 pt-16">
          {content.type === "photo" && <PhotoContent content={content} />}
          {content.type === "spotify" && <SpotifyContent content={content} />}
          {content.type === "text" && <TextContent content={content} />}
          {content.type === "message" && <MessageContent content={content} />}
        </div>
      </div>
    </div>
  );
}
