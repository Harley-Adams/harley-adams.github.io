export default interface PfLoginResult {
    EntityToken: EntityTokenResponse;
    PlayFabId: string;
    SessionTicket: string;
}

export interface EntityTokenResponse {
    Entity: EntityKey,
    EntityToken: string,
    TokenExpiration: string,
}

export interface EntityKey {
    Id: string,
    Type: string,
}