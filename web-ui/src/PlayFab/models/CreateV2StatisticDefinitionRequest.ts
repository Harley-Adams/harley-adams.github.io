export default interface CreateV2StatisticDefinitionRequest {
    AggregationMethod: StatisticAggregationMethod,
    Name: string,
    LeaderboardDefinition: LeaderboardDefinitionType
}

export interface LeaderboardDefinitionType {
    ProvisionLeaderboard: boolean,
    SortDirection: LeaderboardSortDirection
}

export enum StatisticAggregationMethod {
    Last,
    Min,
    Max,
    Sum,
}

export enum LeaderboardSortDirection {
    Descending,
    Ascending
}