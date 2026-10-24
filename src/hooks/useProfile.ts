import { useState, useEffect, useCallback } from 'react';
import { api, type Profile } from '@/utils/api';

const STORAGE_KEY = 'stackly_profile_id';

function getSavedId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function useProfile() {
  const savedId = getSavedId();
  const [profile, setProfile] = useState<Profile | null>(null);
  // If there is no saved id we can skip the loading state entirely
  const [loading, setLoading] = useState(savedId !== null);

  useEffect(() => {
    const id = getSavedId();
    if (!id) return;
    let cancelled = false;
    api
      .getProfile(id)
      .then((p) => { if (!cancelled) setProfile(p); })
      .catch(() => { if (!cancelled) localStorage.removeItem(STORAGE_KEY); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const createProfile = useCallback(
    async (data: { nickname: string; band: string; avatar: string }) => {
      const p = await api.createProfile(data);
      localStorage.setItem(STORAGE_KEY, p.id);
      setProfile(p);
      return p;
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (!profile) return;
    const updated = await api.getProfile(profile.id);
    setProfile(updated);
    return updated;
  }, [profile]);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }, []);

  return { profile, loading, createProfile, refreshProfile, clearProfile };
}
