/*
 * PlayFab client API — the classic Client/* endpoints authenticated with a
 * session ticket (X-Authorization). Covers anonymous login, display name, and
 * player statistics / leaderboards. The title has "allow client to post player
 * statistics" enabled, so statistics are created on first write.
 */
import { PLAYFAB_BASE_API, PLAYFAB_TITLE_ID } from "./config";
import {
  LeaderboardEntry,
  PlayFabSession,
  StatisticValue,
} from "./types";

const LOGIN_KEY = "pt:pf:session";

async function post<T>(
  endpoint: string,
  body: object,
  auth?: { header: string; token: string }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) headers[auth.header] = auth.token;

  const res = await fetch(PLAYFAB_BASE_API + endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.errorMessage || `PlayFab ${endpoint} failed (${res.status})`);
  }
  return json.data as T;
}

/** Sign in anonymously with a stable custom id and set the display name. */
export async function login(
  customId: string,
  displayName: string
): Promise<PlayFabSession> {
  const data = await post<{
    PlayFabId: string;
    SessionTicket: string;
    EntityToken: PlayFabSession["entityToken"];
  }>("Client/LoginWithCustomID", {
    TitleId: PLAYFAB_TITLE_ID,
    CreateAccount: true,
    CustomId: customId,
  });

  const session: PlayFabSession = {
    playFabId: data.PlayFabId,
    sessionTicket: data.SessionTicket,
    entityToken: data.EntityToken,
    displayName,
  };

  await updateDisplayName(session, displayName);
  saveSession(session);
  return session;
}

export async function updateDisplayName(
  session: PlayFabSession,
  displayName: string
): Promise<void> {
  await post(
    "Client/UpdateUserTitleDisplayName",
    { DisplayName: displayName },
    { header: "X-Authorization", token: session.sessionTicket }
  );
  session.displayName = displayName;
  saveSession(session);
}

export async function updateStatistics(
  session: PlayFabSession,
  stats: { StatisticName: string; Value: number }[]
): Promise<void> {
  await post(
    "Client/UpdatePlayerStatistics",
    { Statistics: stats },
    { header: "X-Authorization", token: session.sessionTicket }
  );
}

export async function getStatistics(
  session: PlayFabSession,
  names: string[]
): Promise<StatisticValue[]> {
  const data = await post<{ Statistics: StatisticValue[] }>(
    "Client/GetPlayerStatistics",
    { StatisticNames: names },
    { header: "X-Authorization", token: session.sessionTicket }
  );
  return data.Statistics ?? [];
}

export async function getLeaderboard(
  session: PlayFabSession,
  statisticName: string,
  maxResults = 25
): Promise<LeaderboardEntry[]> {
  const data = await post<{ Leaderboard: LeaderboardEntry[] }>(
    "Client/GetLeaderboard",
    { StatisticName: statisticName, StartPosition: 0, MaxResultsCount: maxResults },
    { header: "X-Authorization", token: session.sessionTicket }
  );
  return data.Leaderboard ?? [];
}

/* ---- Session persistence ------------------------------------------------ */

export function saveSession(session: PlayFabSession): void {
  try {
    localStorage.setItem(LOGIN_KEY, JSON.stringify(session));
  } catch {
    /* private mode — degrade to in-memory only */
  }
}

export function loadSession(): PlayFabSession | null {
  try {
    const raw = localStorage.getItem(LOGIN_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PlayFabSession;
    const exp = Date.parse(session.entityToken.TokenExpiration);
    // Keep a margin so we don't hand out a token about to expire.
    if (Number.isFinite(exp) && exp > Date.now() + 5 * 60 * 1000) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(LOGIN_KEY);
  } catch {
    /* ignore */
  }
}

/** A stable per-device custom id so returning players keep their identity. */
export function deviceCustomId(): string {
  const key = "pt:pf:customId";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = `web-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `web-${Date.now()}`;
  }
}
