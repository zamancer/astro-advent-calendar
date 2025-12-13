import { useState, useEffect, useCallback } from "react";
import { isContestEnded } from "../lib/contest";
import { getContestLeaderboard } from "../lib/database";
import { isDemoMode } from "../lib/featureFlags";
import { getDemoLeaderboardWidgetData } from "../lib/placeholders";
import { supabase } from "../lib/supabase";
import type { ContestLeaderboardEntry } from "../types/database";
import type { LeaderboardProps } from "../types/leaderboard";

/** Compact rank display */
function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span role="img" aria-label="1st place">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span role="img" aria-label="2nd place">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span role="img" aria-label="3rd place">
        🥉
      </span>
    );
  }
  return <span className="text-gray-400 dark:text-gray-500">{rank}</span>;
}

export default function LeaderboardWidget({
  highlightFriendId,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<ContestLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contestEnded = isContestEnded();

  const fetchLeaderboard = useCallback(async (isInitialLoad = false) => {
    if (isDemoMode()) {
      // Demo mode: show sample data
      setLeaderboard(getDemoLeaderboardWidgetData());
      setError(null);
      if (isInitialLoad) {
        setLoading(false);
      }
      return;
    }

    try {
      const { data, error: dbError } = await getContestLeaderboard();

      if (dbError) {
        console.error("Error fetching leaderboard:", dbError);
        if (isInitialLoad) {
          setError("Failed to load");
        }
        return;
      }

      // Only show top 3 for widget
      setLeaderboard((data || []).slice(0, 3));
      setError(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      if (isInitialLoad) {
        setError("Error");
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchLeaderboard(true);

    // Set up real-time subscription for live updates
    if (!supabase || isDemoMode()) return;

    const client = supabase;
    const channel = client
      .channel("leaderboard-widget-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_window_opens",
        },
        () => {
          // Refetch leaderboard when window opens change
          fetchLeaderboard(false);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="text-center text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-amber-200 dark:border-amber-900/50">
      {/* Header */}
      <div className="px-4 py-3 bg-linear-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 border-b border-amber-200 dark:border-amber-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              Leaderboard
            </span>
          </div>
          {contestEnded && (
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">
              Final
            </span>
          )}
        </div>
      </div>

      {/* Top 3 list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {leaderboard.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No participants yet
          </div>
        ) : (
          leaderboard.map((entry) => {
            const isHighlighted = entry.friend_id === highlightFriendId;

            return (
              <div
                key={entry.friend_id}
                className={`flex items-center justify-between px-4 py-2.5 ${
                  isHighlighted
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">
                    <RankIcon rank={entry.rank} />
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {entry.name}
                    {isHighlighted && (
                      <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">
                        (You)
                      </span>
                    )}
                  </span>
                </div>
                <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                  {entry.total_points}
                  <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">
                    pts
                  </span>
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* View full leaderboard link */}
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
        <a
          href="/leaderboard"
          className="flex items-center justify-center gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
        >
          View full leaderboard
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
