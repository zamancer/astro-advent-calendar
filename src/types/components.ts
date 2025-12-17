import type { ContestLeaderboardEntry } from "../types/database";

export interface WinnerAnnouncementProps {
  /** Optional: show even during active contest (for testing) */
  forceShow?: boolean;
  /** Optional: show link to full leaderboard (for main page) */
  showLeaderboardLink?: boolean;
}

export interface WinnerCardProps {
  entry: ContestLeaderboardEntry;
}
