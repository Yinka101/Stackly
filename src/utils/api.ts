/** Thin fetch wrapper. All calls go through the Vite proxy at /api → :3001 */

const BASE = '/api';

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!resp.ok) {
    const err: unknown = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error((err as { error?: string }).error ?? `HTTP ${resp.status}`);
  }
  return resp.json() as Promise<T>;
}

export const api = {
  // Profiles
  createProfile: (body: { nickname: string; band: string; avatar: string }) =>
    request<Profile>('/profiles', { method: 'POST', body: JSON.stringify(body) }),

  getProfile: (id: string) => request<Profile>(`/profiles/${id}`),

  // Lessons
  getLessons: (band: string) => request<LessonMeta[]>(`/lessons?band=${band}`),
  getLesson: (id: string) => request<Lesson>(`/lessons/${id}`),

  // Portfolio
  getPortfolio: (profileId: string) => request<Portfolio>(`/portfolio/${profileId}`),
  trade: (profileId: string, body: { ticker: string; side: 'buy' | 'sell'; shares: number }) =>
    request<{ ok: boolean; practiceDollars: number }>(`/portfolio/${profileId}/trade`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // AI
  askCoach: (body: {
    profileId: string;
    band: string;
    message: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }) => request<{ reply: string }>('/ai/ask', { method: 'POST', body: JSON.stringify(body) }),

  // PayPal
  createOrder: (body: { profileId: string; packageIndex: number }) =>
    request<{ orderId: string; approveUrl: string; package: PayPalPackage }>(
      '/paypal/create-order',
      { method: 'POST', body: JSON.stringify(body) }
    ),
  captureOrder: (orderId: string) =>
    request<{ ok: boolean; practiceDollarsAwarded: number; practiceDollars: number }>(
      '/paypal/capture-order',
      { method: 'POST', body: JSON.stringify({ orderId }) }
    ),
};

// ── Shared types ────────────────────────────────────────────────────────────

export type Band = 'sprouts' | 'builders' | 'investors';

export interface Profile {
  id: string;
  nickname: string;
  band: Band;
  avatar: string;
  practiceDollars: number;
  createdAt: number;
}

export interface LessonMeta {
  id: string;
  title: string;
  band: Band;
  topic: 'paypal' | 'investing' | 'money-basics';
  durationMins: number;
  summary: string;
}

export interface LessonStep {
  heading: string;
  body: string;
  quiz?: { question: string; options: string[]; answer: number };
}

export interface Lesson extends LessonMeta {
  steps: LessonStep[];
}

export interface Position {
  ticker: string;
  name: string;
  shares: number;
  avgCostCents: number;
  currentPriceCents: number;
  marketValueCents: number;
  gainLossCents: number;
  change1d: number;
}

export interface Portfolio {
  profileId: string;
  practiceDollars: number;
  totalMarketValueCents: number;
  positions: Position[];
  prices: Record<string, { name: string; priceCents: number; change1d: number }>;
}

export interface PayPalPackage {
  usd: number;
  practiceDollars: number;
  label: string;
}
