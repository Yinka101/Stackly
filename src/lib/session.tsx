import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api, tokenStore } from './api';

export type AgeBand = 'sprouts' | 'builders' | 'investors';

export interface SessionUser {
  role: 'parent' | 'learner';
  familyId: string;
  id: string;
  nickname?: string;
  band?: AgeBand;
  avatar?: string;
  xp?: number;
  streakDays?: number;
  practiceDollars?: number;
  email?: string;
}

interface SessionCtx {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  /** Set user immediately from a login response — no second network call. */
  setUserFromLogin: (data: { role: 'parent' | 'learner'; familyId: string; token: string }) => void;
}

const Ctx = createContext<SessionCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout:  async () => {},
  setUserFromLogin: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // If no token is stored at all, skip the network call immediately.
    if (!tokenStore.get()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // 30 s timeout — Render free tier cold-starts can take ~25 s.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000);

      const data = await api.get<{
        session: { role: 'parent' | 'learner'; familyId: string };
        actor: Record<string, unknown>;
      }>('/auth/me', controller.signal).finally(() => clearTimeout(timeoutId));

      const actor = data.actor ?? {};
      setUser({
        role:            data.session.role,
        familyId:        data.session.familyId,
        id:              String(actor.id ?? ''),
        nickname:        actor.nickname         as string | undefined,
        band:            actor.band             as AgeBand | undefined,
        avatar:          actor.avatar           as string | undefined,
        xp:              actor.xp               as number | undefined,
        streakDays:      actor.streak_days      as number | undefined,
        practiceDollars: actor.practice_dollars as number | undefined,
        email:           actor.email            as string | undefined,
      });
    } catch (err) {
      // Only clear the token on a definitive 401 — NOT on a timeout or network
      // error. A slow cold-start should not log the user out.
      const isUnauthorized =
        err instanceof Error &&
        (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized'));

      if (isUnauthorized) {
        tokenStore.clear();
        setUser(null);
      }
      // On timeout / network error: leave whatever user state we had.
      // If user was null (fresh load), they stay on the page they're on.
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Called immediately after a successful login response.
   * Sets a minimal user object from the login payload so the app can
   * navigate without waiting for a second /auth/me round-trip.
   */
  const setUserFromLogin = useCallback(
    (data: { role: 'parent' | 'learner'; familyId: string; token: string }) => {
      setUser({
        role:     data.role,
        familyId: data.familyId,
        id:       '', // filled in lazily by the next refresh()
      });
      setLoading(false);
    },
    [],
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {}).catch(() => {});
    tokenStore.clear();
    setUser(null);
  }, []);

  // On mount: attempt to restore session from stored token.
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <Ctx.Provider value={{ user, loading, refresh, logout, setUserFromLogin }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  return useContext(Ctx);
}
