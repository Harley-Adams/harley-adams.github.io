/*
 * Auth context — holds the current PlayFab session and exposes sign in / sign
 * out. Restores a cached session on load so returning players stay signed in.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearSession,
  deviceCustomId,
  loadSession,
  login as pfLogin,
} from "../net/client";
import { PlayFabSession } from "../net/types";

interface AuthContextValue {
  session: PlayFabSession | null;
  busy: boolean;
  error: string | null;
  signIn: (displayName: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<PlayFabSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  const signIn = useCallback(async (displayName: string) => {
    const name = displayName.trim();
    if (!name) {
      setError("Please enter a display name.");
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      const s = await pfLogin(deviceCustomId(), name);
      setSession(s);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, busy, error, signIn, signOut }),
    [session, busy, error, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
