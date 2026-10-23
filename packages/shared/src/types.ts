import type { AgeBand } from './constants';

// ── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  nickname: string;
  band: AgeBand;
  avatar: string;
  practiceDollars: number;
  createdAt: number;
}

// ── Lessons ───────────────────────────────────────────────────────────────────
export interface LessonStep {
  heading: string;
  body: string;
  quiz?: {
    question: string;
    options: string[];
    answer: number; // index of correct option
  };
}

export interface Lesson {
  id: string;
  band: AgeBand;
  topic: 'paypal' | 'investing' | 'money-basics';
  title: string;
  durationMins: number;
  summary: string;
  steps: LessonStep[];
}

export type LessonMeta = Omit<Lesson, 'steps'>;

// ── Portfolio ─────────────────────────────────────────────────────────────────
export interface StockPrice {
  ticker: string;
  name: string;
  priceCents: number; // Practice Dollar cents
  change1d: number;   // percent
}

export interface Position {
  ticker: string;
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
  prices: Record<string, StockPrice>;
}

// ── AI Coach ──────────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskCoachRequest {
  profileId: string;
  band: AgeBand;
  message: string;
  history?: ChatMessage[];
}

export interface AskCoachResponse {
  reply: string;
}

// ── PayPal ────────────────────────────────────────────────────────────────────
export interface CreateOrderRequest {
  profileId: string;
  packageIndex: number;
}

export interface CreateOrderResponse {
  orderId: string;
  approveUrl: string;
  package: { usd: number; practiceDollars: number; label: string };
}

export interface CaptureOrderResponse {
  ok: boolean;
  practiceDollarsAwarded: number;
  practiceDollars: number;
}

// ── API error ─────────────────────────────────────────────────────────────────
export interface ApiError {
  error: string;
}
