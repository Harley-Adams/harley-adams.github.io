export default interface PfV2LeaderboardResult {
  Rankings: LBV2Ranking[];
  StatisticVersion: number;
}

export interface LBV2Ranking {
  Entity: EntityData;
  Scores: number[];
  Rank: number;
  EntityLineage: string;
}

export interface EntityData {
  Id: string;
  Type: string;
}

export interface EntityLineage {
  NamespaceId: string;
  TitleId: string;
  MasterPlayerAccountId: string;
  TitlePlayerAccountId: string;
}
