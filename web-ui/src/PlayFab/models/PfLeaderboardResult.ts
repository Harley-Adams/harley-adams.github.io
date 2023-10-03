import PlayerLeaderboardEntry from "./PlayerLeaderboardEntry";

export default interface PfLeaderboardResult {
    Leaderboard: PlayerLeaderboardEntry[];
    NextReset: string;
    Version: string;
}