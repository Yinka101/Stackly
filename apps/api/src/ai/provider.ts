/**
 * AI provider wrapper — swap the model by changing COACH_PROVIDER and COACH_MODEL env vars.
 * Default: OpenAI gpt-4o-mini. Alt: any OpenAI-compatible endpoint (Anthropic, local, etc.)
 *
 * Server-side only. Keys live in env, never sent to the client.
 */

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface StreamChunk {
  delta: string;
  done: boolean;
}

export interface ProviderConfig {
  model: string;
  apiKey: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
}

function getConfig(): ProviderConfig | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return {
    model: process.env.COACH_MODEL ?? 'gpt-4o-mini',
    apiKey,
    baseUrl: process.env.COACH_BASE_URL ?? 'https://api.openai.com/v1',
    maxTokens: 400,
    temperature: 0.6,
  };
}

/**
 * Stream a chat completion. Yields delta chunks until done.
 * Returns an AsyncGenerator so the caller can pipe to SSE.
 */
export async function* streamCompletion(
  messages: ChatMessage[],
): AsyncGenerator<StreamChunk> {
  const cfg = getConfig();
  if (!cfg) {
    yield { delta: OFFLINE_FALLBACK, done: false };
    yield { delta: '', done: true };
    return;
  }

  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        max_tokens: cfg.maxTokens,
        temperature: cfg.temperature,
        stream: true,
      }),
    });
  } catch {
    yield { delta: OFFLINE_FALLBACK, done: false };
    yield { delta: '', done: true };
    return;
  }

  if (!res.ok || !res.body) {
    yield { delta: OFFLINE_FALLBACK, done: false };
    yield { delta: '', done: true };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const json = trimmed.slice(5).trim();
      if (json === '[DONE]') {
        yield { delta: '', done: true };
        return;
      }
      try {
        type SSEChunk = { choices: { delta: { content?: string } }[] };
        const parsed = JSON.parse(json) as SSEChunk;
        const delta = parsed.choices[0]?.delta?.content ?? '';
        if (delta) yield { delta, done: false };
      } catch {
        // malformed chunk — skip
      }
    }
  }

  yield { delta: '', done: true };
}

/**
 * Non-streaming completion for structured outputs (quiz, review).
 */
export async function complete(messages: ChatMessage[]): Promise<string> {
  const cfg = getConfig();
  if (!cfg) return OFFLINE_FALLBACK;

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        max_tokens: cfg.maxTokens,
        temperature: cfg.temperature,
        stream: false,
      }),
    });
    if (!res.ok) return OFFLINE_FALLBACK;
    type OAI = { choices: { message: { content: string } }[] };
    const data = (await res.json()) as OAI;
    return data.choices[0]?.message?.content ?? OFFLINE_FALLBACK;
  } catch {
    return OFFLINE_FALLBACK;
  }
}

export function isConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

const OFFLINE_FALLBACK =
  "I'm having a little trouble connecting right now. " +
  'Try again in a moment! In the meantime, check out the lesson on this topic — it has great examples.';
