import { useState, useEffect } from "react";
import {
  BASE_POINTS,
  SPEED_BONUS,
  STREAK_BONUS,
  TOTAL_CONTEST_WINDOWS,
} from "../lib/contest";

const STORAGE_KEY = "contest-instructions-expanded";

export default function ContestInstructions() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Load saved preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setIsExpanded(saved === "true");
    }
  }, []);

  function handleToggle() {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    localStorage.setItem(STORAGE_KEY, String(newValue));
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  }

  return (
    <div className="w-full mb-8">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-amber-200 dark:border-amber-900/50">
        {/* Collapsed header - always visible */}
        <button
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isExpanded}
          aria-controls="contest-instructions-content"
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset"
        >
          <div className="flex items-center gap-3">
            {/* Trophy icon */}
            <span className="text-2xl" role="img" aria-label="Trophy">
              🏆
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              Advent Calendar Contest
            </span>
            <span className="hidden sm:inline text-sm text-amber-600 dark:text-amber-400 font-medium">
              Win a Prize!
            </span>
          </div>

          {/* Chevron indicator */}
          <svg
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div
            id="contest-instructions-content"
            className="px-4 pb-4 pt-2 border-t border-amber-100 dark:border-amber-900/30"
          >
            {/* Prize announcement */}
            <div className="mb-4 text-center">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                WIN A SPECIAL PRIZE!
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                1st Place, 2nd Place, and 3rd Place will get a gift!
              </p>
            </div>

            {/* How to earn points */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                How to Earn Points:
              </h3>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>
                    Open a window:{" "}
                    <span className="font-medium">{BASE_POINTS} points</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>
                    First to open:{" "}
                    <span className="font-medium">
                      +{SPEED_BONUS.FIRST} bonus
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>
                    Second to open:{" "}
                    <span className="font-medium">
                      +{SPEED_BONUS.SECOND} bonus
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-700 dark:text-orange-500 mt-0.5">
                    •
                  </span>
                  <span>
                    Third to open:{" "}
                    <span className="font-medium">
                      +{SPEED_BONUS.THIRD} bonus
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>
                    Open all {TOTAL_CONTEST_WINDOWS} windows:{" "}
                    <span className="font-medium">+{STREAK_BONUS} bonus</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Tips:
              </h3>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <span>Windows unlock at midnight (your local time)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">⚡</span>
                  <span>Be quick to earn speed bonuses!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">📅</span>
                  <span>
                    Consistency matters - the streak bonus is significant
                  </span>
                </li>
              </ul>
            </div>

            {/* Contest deadline */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Contest closes{" "}
                <span className="font-medium">Dec 24 at 11:59 PM</span> (Mexico
                City time).
              </p>
              <p>Prizes delivered via email Dec 25.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
