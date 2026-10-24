/** Thin fetch wrapper — sends session token from localStorage as Bearer header. */
// In production (Render static site), VITE_API_URL points directly to the API service.
// In dev the Vite proxy rewrites /api → http://localhost:3001.
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '/api';

const TOKEN_KEY = 'stackly_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  get: <T>(path: string) => req<T>('GET', path),
  post: <T>(path: string, body: unknown) => req<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => req<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => req<T>('PATCH', path, body),
  del: <T>(path: string) => req<T>('DELETE', path),
};

/** Raw fetch — for SSE and non-JSON responses */
export async function request(path: string, init?: RequestInit): Promise<Response> {
  const token = tokenStore.get();
  return fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}
