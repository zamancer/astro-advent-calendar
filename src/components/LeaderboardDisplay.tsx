import { useState, useEffect } from "react";
import { getContestLeaderboard } from "../lib/database";
import { isContestEnded, TOTAL_CONTEST_WINDOWS } from "../lib/contest";
import { isDemoMode } from "../lib/featureFlags";
import type { ContestLeaderboardEntry } from "../types/database";

interface LeaderboardDisplayProps {
  /** Optional: highlight a specific friend by ID */
  highlightFriendId?: string;
}

/** Medal/rank display for top 3 positions */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="text-2xl" role="img" aria-label="1st place">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="text-2xl" role="img" aria-label="2nd place">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="text-2xl" role="img" aria-label="3rd place">
        🥉
      </span>
    );
  }
  return (
    <span className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
      {rank}
    </span>
  );
}

/** Points breakdown tooltip/detail */
function PointsBreakdown({ entry }: { entry: ContestLeaderboardEntry }) {
  const speedBonus =
    entry.total_points - entry.base_points - entry.streak_bonus;

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      <span>{entry.base_points} base</span>
      {speedBonus > 0 && <span> + {speedBonus} speed</span>}
      {entry.streak_bonus > 0 && <span> + {entry.streak_bonus} streak</span>}
    </div>
  );
}

export default function LeaderboardDisplay({
  highlightFriendId,
}: LeaderboardDisplayProps) {
  const [leaderboard, setLeaderboard] = useState<ContestLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contestEnded = isContestEnded();

  useEffect(() => {
    async function fetchLeaderboard() {
      if (isDemoMode()) {
        // Demo mode: show sample data
        setLeaderboard([
          {
            friend_id: "demo-1",
            name: "Demo Player 1",
            windows_opened: 5,
            base_points: 50,
            streak_bonus: 0,
            total_points: 65,
            total_reaction_time: 1200,
            first_place_count: 3,
            completed_at: null,
            last_window_opened_at: new Date().toISOString(),
            rank: 1,
          },
          {
            friend_id: "demo-2",
            name: "Demo Player 2",
            windows_opened: 4,
            base_points: 40,
            streak_bonus: 0,
            total_points: 48,
            total_reaction_time: 2400,
            first_place_count: 1,
            completed_at: null,
            last_window_opened_at: new Date().toISOString(),
            rank: 2,
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        const { data, error: dbError } = await getContestLeaderboard();

        if (dbError) {
          console.error("Error fetching leaderboard:", dbError);
          setError("Failed to load leaderboard");
          return;
        }

        setLeaderboard(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No participants yet. Be the first to open a window!
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Contest status header */}
      <div className="mb-6 text-center">
        {contestEnded ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
            <span className="text-lg">🎉</span>
            <span className="font-semibold">Contest Complete!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full">
            <span className="text-lg">🏆</span>
            <span className="font-semibold">Contest in Progress</span>
          </div>
        )}
      </div>

      {/* Leaderboard table */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4 sm:col-span-3">Player</div>
          <div className="col-span-3 sm:col-span-2 text-center">Points</div>
          <div className="col-span-4 sm:col-span-3 text-center hidden sm:block">
            Windows
          </div>
          <div className="col-span-4 sm:col-span-3 text-center hidden sm:block">
            1st Places
          </div>
        </div>

        {/* Rows */}
        {leaderboard.map((entry) => {
          const isHighlighted = entry.friend_id === highlightFriendId;
          const isPrizePosition = entry.rank <= 3;

          return (
            <div
              key={entry.friend_id}
              className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                isHighlighted
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : isPrizePosition
                  ? "bg-amber-50/50 dark:bg-amber-900/10"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
              }`}
            >
              {/* Rank */}
              <div className="col-span-1 flex justify-center">
                <RankBadge rank={entry.rank} />
              </div>

              {/* Name */}
              <div className="col-span-4 sm:col-span-3">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {entry.name}
                  {isHighlighted && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                      (You)
                    </span>
                  )}
                </div>
                {/* Mobile: show points breakdown */}
                <div className="sm:hidden">
                  <PointsBreakdown entry={entry} />
                </div>
              </div>

              {/* Points */}
              <div className="col-span-3 sm:col-span-2 text-center">
                <div className="font-bold text-lg text-amber-600 dark:text-amber-400">
                  {entry.total_points}
                </div>
                {/* Desktop: show points breakdown */}
                <div className="hidden sm:block">
                  <PointsBreakdown entry={entry} />
                </div>
              </div>

              {/* Windows opened - hidden on mobile */}
              <div className="col-span-3 text-center hidden sm:block">
                <span className="text-gray-700 dark:text-gray-300">
                  {entry.windows_opened}
                </span>
                <span className="text-gray-400 dark:text-gray-500">
                  /{TOTAL_CONTEST_WINDOWS}
                </span>
                {entry.windows_opened === TOTAL_CONTEST_WINDOWS && (
                  <span
                    className="ml-1 text-green-500"
                    title="Perfect attendance!"
                  >
                    ✓
                  </span>
                )}
              </div>

              {/* 1st place count - hidden on mobile */}
              <div className="col-span-3 text-center hidden sm:block">
                {entry.first_place_count > 0 ? (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <span className="text-sm">🥇</span>
                    <span className="font-medium">
                      ×{entry.first_place_count}
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Points = Base (
          {leaderboard[0]?.base_points ? "10 per window" : "10/window"}) + Speed
          Bonuses + Streak Bonus
        </p>
      </div>
    </div>
  );
}
