// See EntityKey.cs and StatisticController.cs

import { EntityKey } from "./PfLoginResult";

export interface StatisticUpdate {
    Name: string,
    Value: number,
}

export default interface UpdateStatisticsRequest {
    Statistics: StatisticUpdate[],
    Entity: EntityKey,
}