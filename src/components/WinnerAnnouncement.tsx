import { useState, useEffect, useCallback } from "react";
import { isContestEnded } from "../lib/contest";
import { getContestLeaderboard } from "../lib/database";
import { isDemoMode } from "../lib/featureFlags";
import { getDemoLeaderboardWidgetData } from "../lib/placeholders";
import { supabase } from "../lib/supabase";
import type {
  WinnerAnnouncementProps,
  WinnerCardProps,
} from "../types/components";
import type { ContestLeaderboardEntry } from "../types/database";

/** Medal styling based on rank */
function getMedalStyle(rank: number): {
  emoji: string;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (rank) {
    case 1:
      return {
        emoji: "🥇",
        label: "1er Lugar",
        bgClass:
          "bg-gradient-to-br from-yellow-100 to-amber-200 dark:from-yellow-900/40 dark:to-amber-900/40",
        textClass: "text-yellow-800 dark:text-yellow-300",
        borderClass: "border-yellow-400 dark:border-yellow-600",
      };
    case 2:
      return {
        emoji: "🥈",
        label: "2do Lugar",
        bgClass:
          "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40",
        textClass: "text-gray-700 dark:text-gray-300",
        borderClass: "border-gray-400 dark:border-gray-500",
      };
    case 3:
      return {
        emoji: "🥉",
        label: "3er Lugar",
        bgClass:
          "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/30",
        textClass: "text-orange-800 dark:text-orange-300",
        borderClass: "border-orange-400 dark:border-orange-600",
      };
    default:
      return {
        emoji: "🏅",
        label: `${rank}to Lugar`,
        bgClass: "bg-gray-50 dark:bg-gray-800",
        textClass: "text-gray-600 dark:text-gray-400",
        borderClass: "border-gray-300 dark:border-gray-600",
      };
  }
}

/** Individual winner card */
function WinnerCard({ entry }: WinnerCardProps) {
  const style = getMedalStyle(entry.rank);

  return (
    <div
      className={`flex flex-col items-center p-2 sm:p-4 rounded-lg sm:rounded-xl border-2 ${style.bgClass} ${style.borderClass} transition-transform hover:scale-105`}
    >
      <span
        className="text-2xl sm:text-4xl mb-1 sm:mb-2"
        role="img"
        aria-label={style.label}
      >
        {style.emoji}
      </span>
      <span
        className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${style.textClass} mb-0.5 sm:mb-1`}
      >
        {style.label}
      </span>
      <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg truncate max-w-full px-1">
        {entry.name}
      </span>
      <span className="text-amber-600 dark:text-amber-400 font-bold mt-0.5 sm:mt-1 text-sm sm:text-base">
        {entry.total_points} pts
      </span>
    </div>
  );
}

export default function WinnerAnnouncement({
  forceShow = false,
  showLeaderboardLink = false,
}: WinnerAnnouncementProps) {
  const [winners, setWinners] = useState<ContestLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const contestEnded = isContestEnded();

  const fetchWinners = useCallback(async () => {
    if (isDemoMode()) {
      // Demo mode: show sample data
      setWinners(getDemoLeaderboardWidgetData());
      setLoading(false);
      return;
    }

    try {
      const { data, error: dbError } = await getContestLeaderboard();

      if (dbError) {
        console.error("Error fetching winners:", dbError);
        setLoading(false);
        return;
      }

      // Only show top 3 winners
      setWinners((data || []).slice(0, 3));
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if contest has ended (or forceShow is true)
    if (!contestEnded && !forceShow) {
      setLoading(false);
      return;
    }

    fetchWinners();

    // Set up real-time subscription for updates
    if (!supabase || isDemoMode()) return;

    const client = supabase;
    const channel = supabase
      .channel("winner-announcement-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_window_opens",
        },
        () => {
          fetchWinners();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [contestEnded, forceShow, fetchWinners]);

  // Don't show if contest hasn't ended (unless forced)
  if (!contestEnded && !forceShow) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-8 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // No winners found
  if (winners.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <div className="bg-linear-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-xl shadow-lg overflow-hidden border border-green-200 dark:border-green-800">
        {/* Header */}
        <div className="text-center pt-4 sm:pt-6 pb-3 sm:pb-4 px-4">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
            <span
              className="text-xl sm:text-3xl"
              role="img"
              aria-label="Celebration"
            >
              🎉
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              ¡Concurso Cerrado!
            </h2>
            <span
              className="text-xl sm:text-3xl"
              role="img"
              aria-label="Celebration"
            >
              🎉
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            ¡Felicidades a nuestros ganadores!
          </p>
        </div>

        {/* Winners podium */}
        <div className="px-2 sm:px-4 pb-4 sm:pb-6">
          {/* Reorder winners for podium display: 2nd, 1st, 3rd */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4 max-w-lg mx-auto">
            {/* 2nd place (left) */}
            {winners.length >= 2 && (
              <div className="pt-2 sm:pt-4">
                <WinnerCard entry={winners[1]} />
              </div>
            )}

            {/* 1st place (center, elevated) */}
            {winners.length >= 1 && (
              <div className="transform scale-[1.02] sm:scale-105 md:scale-110 z-10">
                <WinnerCard entry={winners[0]} />
              </div>
            )}

            {/* 3rd place (right) */}
            {winners.length >= 3 && (
              <div className="pt-2 sm:pt-4">
                <WinnerCard entry={winners[2]} />
              </div>
            )}
          </div>
        </div>

        {/* Prize notification */}
        <div className="bg-white/60 dark:bg-gray-800/60 border-t border-green-200 dark:border-green-800 px-3 sm:px-4 py-3 sm:py-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-green-700 dark:text-green-400">
            <span className="text-lg sm:text-xl" role="img" aria-label="Gift">
              🎁
            </span>
            <p className="font-medium text-sm sm:text-base">
              Ganadores: ¡Revisen su correo el 25 de diciembre para su premio!
            </p>
          </div>

          {/* Link to full leaderboard (only on main page) */}
          {showLeaderboardLink && (
            <a
              href="/leaderboard"
              className="inline-flex items-center gap-1 mt-3 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-amber-400 rounded font-medium transition-colors"
            >
              Ver todas las posiciones
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
          )}
        </div>
      </div>
    </div>
  );
}
