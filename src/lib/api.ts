/**
 * Thin fetch wrapper — sends session token from localStorage as Bearer header.
 *
 * API_BASE resolution (runtime, not build-time):
 *   1. /config.json served by the static host (update this file to change the
 *      API URL without rebuilding — Render copies public/ into dist/ as-is).
 *   2. import.meta.env.VITE_API_URL baked in at Vite build time.
 *   3. /api — Vite dev-proxy rewrites to http://localhost:3001.
 */

// Baked-in fallback (used while config.json hasn't loaded yet, or in dev)
const BAKED_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';

let _resolvedBase: string = BAKED_BASE;

// Load config.json once and cache it — subsequent calls use the cached value.
let _configLoaded = false;
async function loadConfig(): Promise<void> {
  if (_configLoaded) return;
  _configLoaded = true;
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (res.ok) {
      const cfg = await res.json() as { apiUrl?: string };
      if (cfg.apiUrl) _resolvedBase = cfg.apiUrl.replace(/\/$/, '');
    }
  } catch {
    // keep BAKED_BASE
  }
}

// Kick off config load immediately on module init
void loadConfig();

export function getApiBase(): string { return _resolvedBase; }

const TOKEN_KEY = 'stackly_token';
export const tokenStore = {
  get:   () => localStorage.getItem(TOKEN_KEY),
  set:   (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  // Ensure config is loaded before first real request
  await loadConfig();
  const base = _resolvedBase;

  const token = tokenStore.get();
  const headers: Record<string, string> = {};
  if (body)  headers['Content-Type']  = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'include',
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string, signal?: AbortSignal) => req<T>('GET',    path, undefined, signal),
  post:   <T>(path: string, body: unknown)        => req<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown)        => req<T>('PUT',    path, body),
  patch:  <T>(path: string, body: unknown)        => req<T>('PATCH',  path, body),
  delete: <T>(path: string)                       => req<T>('DELETE', path),
};
