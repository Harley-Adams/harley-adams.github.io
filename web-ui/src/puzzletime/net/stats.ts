/*
 * Statistic + leaderboard catalog. These classic PlayFab statistics are created
 * on first write (the title allows client stat posting). We push absolute totals
 * from local play; the statistics use "last value" aggregation so the leaderboard
 * always reflects each player's current best.
 */
import { getLeaderboard, updateStatistics } from "./client";
import { LeaderboardEntry, PlayFabSession } from "./types";
import { WordleStats } from "../lib/storage";

export const STAT_WINS = "WordleWins";
export const STAT_STREAK = "WordleStreak";
export const STAT_PLAYED = "WordleGamesPlayed";
export const STAT_VERSUS_WINS = "WordleVersusWins";

export interface LeaderboardDef {
  statistic: string;
  label: string;
  unit: string;
}

export const LEADERBOARDS: LeaderboardDef[] = [
  { statistic: STAT_WINS, label: "Most wins", unit: "wins" },
  { statistic: STAT_STREAK, label: "Best streak", unit: "streak" },
  { statistic: STAT_VERSUS_WINS, label: "Versus wins", unit: "wins" },
];

/** Push the player's lifetime solo/daily stats to their online profile. */
export async function syncWordleStats(
  session: PlayFabSession,
  stats: WordleStats
): Promise<void> {
  await updateStatistics(session, [
    { StatisticName: STAT_WINS, Value: stats.wins },
    { StatisticName: STAT_STREAK, Value: stats.maxStreak },
    { StatisticName: STAT_PLAYED, Value: stats.played },
  ]);
}

/** Record a multiplayer win by bumping the versus-wins statistic. */
export async function recordVersusWin(
  session: PlayFabSession,
  totalVersusWins: number
): Promise<void> {
  await updateStatistics(session, [
    { StatisticName: STAT_VERSUS_WINS, Value: totalVersusWins },
  ]);
}

export function fetchLeaderboard(
  session: PlayFabSession,
  statistic: string
): Promise<LeaderboardEntry[]> {
  return getLeaderboard(session, statistic);
}
