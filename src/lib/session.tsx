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
}

const Ctx = createContext<SessionCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get<{
        session: { role: 'parent' | 'learner'; familyId: string };
        actor: Record<string, unknown>;
      }>('/auth/me');
      const actor = data.actor ?? {};
      setUser({
        role: data.session.role,
        familyId: data.session.familyId,
        id: String(actor.id ?? ''),
        nickname: actor.nickname as string | undefined,
        band: actor.band as AgeBand | undefined,
        avatar: actor.avatar as string | undefined,
        xp: actor.xp as number | undefined,
        streakDays: actor.streak_days as number | undefined,
        practiceDollars: actor.practice_dollars as number | undefined,
        email: actor.email as string | undefined,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {}).catch(() => {});
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <Ctx.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  return useContext(Ctx);
}
