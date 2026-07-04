/*
 * PlayFab Matchmaking (Quick Match). Creates a ticket on the shared
 * `versus_wordle` queue, polls until matched, and returns the matchId + the
 * signed arrangement string used to join the arranged lobby. This is the same
 * queue and flow the iOS app uses, so a web player and an iOS player dropped
 * into the queue at the same time are matched together.
 *
 * All calls use the entity token (X-EntityToken).
 */
import { PLAYFAB_BASE_API } from "./config";
import { EntityKey, EntityTokenResponse } from "./types";

async function entityPost<T>(
  endpoint: string,
  token: EntityTokenResponse,
  body: object
): Promise<T> {
  const res = await fetch(PLAYFAB_BASE_API + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-EntityToken": token.EntityToken,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.errorMessage || `PlayFab ${endpoint} failed (${res.status})`);
  }
  return json.data as T;
}

/** One queue per game mode, matching iOS `versus_<puzzleId>`. */
export const WORDLE_QUEUE = "versus_wordle";

export async function cancelAllTickets(
  token: EntityTokenResponse,
  entity: EntityKey,
  queue = WORDLE_QUEUE
): Promise<void> {
  try {
    await entityPost("Match/CancelAllMatchmakingTicketsForPlayer", token, {
      QueueName: queue,
      Entity: entity,
    });
  } catch {
    /* best effort — a missing ticket is fine */
  }
}

export async function createTicket(
  token: EntityTokenResponse,
  entity: EntityKey,
  giveUpAfterSeconds: number,
  queue = WORDLE_QUEUE
): Promise<string> {
  const data = await entityPost<{ TicketId: string }>(
    "Match/CreateMatchmakingTicket",
    token,
    {
      QueueName: queue,
      GiveUpAfterSeconds: Math.max(5, Math.floor(giveUpAfterSeconds)),
      Creator: { Entity: entity, Attributes: { DataObject: {} } },
    }
  );
  return data.TicketId;
}

export interface TicketStatus {
  status: string;
  matchId: string | null;
  players: string[];
}

export async function pollTicket(
  token: EntityTokenResponse,
  ticketId: string,
  queue = WORDLE_QUEUE
): Promise<TicketStatus> {
  const data = await entityPost<{
    Status: string;
    MatchId?: string;
    Members?: { Entity?: { Id: string } }[];
  }>("Match/GetMatchmakingTicket", token, {
    TicketId: ticketId,
    QueueName: queue,
    EscapeObject: false,
  });
  return {
    status: data.Status,
    matchId: data.MatchId ?? null,
    players: (data.Members ?? [])
      .map((m) => m.Entity?.Id)
      .filter((x): x is string => !!x),
  };
}

/** The caller's signed arrangement string for a match — feeds JoinArrangedLobby. */
export async function getArrangementString(
  token: EntityTokenResponse,
  matchId: string,
  queue = WORDLE_QUEUE
): Promise<string> {
  const data = await entityPost<{ ArrangementString: string }>(
    "Match/GetMatch",
    token,
    { MatchId: matchId, QueueName: queue }
  );
  return data.ArrangementString;
}
