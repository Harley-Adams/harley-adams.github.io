import { EntityKey } from "../models/PfLoginResult";

export interface StatisticUpdate {
  Name: string;
  Metadata?: string;
  Scores: string[];
}

export interface UpdateStatisticsPayload {
  Statistics: StatisticUpdate[];
  Entity: EntityKey;
}

export interface GetStatisticsPayload {
  Entity?: EntityKey;
}

export interface Statistic {
  name: string;
  Version: number;
  Scores: string[];
  Metadata?: string;
}

export interface GetStatisticsResponse {
  Entity: EntityKey;
  Statistics: Statistic[];
}

export interface GetLeaderboardRequest {
  LeaderboardName: string;
  Version?: number;
  StartingPosition: number;
  PageSize: number;
}

export interface EntityLeaderboardEntry {
  DisplayName: string;
  Entity: EntityKey;
  Rank: number;
  Scores: string[];
  Metadata?: string;
}

// Interface for the response object that contains the leaderboard information
export interface GetEntityLeaderboardResponse {
  Version: number;
  Rankings: EntityLeaderboardEntry[];
}

export interface GetLeaderboardAroundEntityRequest {
  LeaderboardName: string;
  Version?: number;
  MaxSurroundingEntries: number;
}
