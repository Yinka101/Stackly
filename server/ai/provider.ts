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
    yield { delta: offlineAnswer(messages), done: false };
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
    yield { delta: offlineAnswer(messages), done: false };
    yield { delta: '', done: true };
    return;
  }

  if (!res.ok || !res.body) {
    yield { delta: offlineAnswer(messages), done: false };
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
 * Also used by the agent loop — accepts optional tools for function calling.
 */
export async function complete(
  messages: unknown[],
  tools?: unknown[],
): Promise<AgentResponse> {
  const cfg = getConfig();
  if (!cfg) {
    const offline = offlineAnswer(messages as ChatMessage[]);
    return { choices: [{ finish_reason: 'stop', message: { content: offline, tool_calls: [] } }] };
  }

  try {
    const body: Record<string, unknown> = {
      model: cfg.model,
      messages,
      max_tokens: tools ? 1000 : cfg.maxTokens,
      temperature: cfg.temperature,
      stream: false,
    };
    if (tools?.length) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { choices: [{ finish_reason: 'stop', message: { content: OFFLINE_FALLBACK, tool_calls: [] } }] };
    }
    return (await res.json()) as AgentResponse;
  } catch {
    return { choices: [{ finish_reason: 'stop', message: { content: OFFLINE_FALLBACK, tool_calls: [] } }] };
  }
}

/** Typed response shape for both plain completions and function-calling */
export interface AgentResponse {
  choices: Array<{
    finish_reason: string;
    message: {
      content: string | null;
      tool_calls?: Array<{
        id: string;
        function: { name: string; arguments: string };
      }>;
    };
  }>;
}

/** Legacy helper for plain-text completions (quiz, review, explain) */
export async function completeText(messages: ChatMessage[]): Promise<string> {
  const result = await complete(messages);
  return result.choices[0]?.message?.content ?? OFFLINE_FALLBACK;
}

export function isConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

// ── Offline responder ─────────────────────────────────────────────────────────
// Used when OPENAI_API_KEY is not set. Gives real educational answers by
// matching keywords in the user's last message.

const OFFLINE_QA: Array<{ keys: RegExp; answer: string }> = [
  {
    keys: /compound|compounding/i,
    answer: "Compound growth means your money earns returns, and then those returns earn more returns too. Imagine you plant $100 and it grows 10% in a year - you now have $110. Next year that $110 grows 10%, giving you $121. The longer you wait, the faster the snowball gets. That's why starting early is so powerful!",
  },
  {
    keys: /interest|savings account/i,
    answer: "Interest is the extra money a bank pays you for keeping your savings with them - or the extra you pay when you borrow. A savings account with 5% interest on $200 pays you $10 a year just for leaving it there. It's one of the easiest ways to make your money grow while you sleep.",
  },
  {
    keys: /invest|stock|share|portfolio/i,
    answer: "Investing means putting your money into something - like a share of a company - hoping it grows over time. When you buy a share of a company you own a tiny piece of it. If the company does well, your share is worth more. On Stackly we use Practice Dollars so you can try this safely with no real risk.",
  },
  {
    keys: /paypal|payment|checkout|pay/i,
    answer: "PayPal is a way to send and receive money online without sharing your card details with every shop. When you check out, PayPal acts as the middleman - the shop never sees your bank info. On Stackly's PayPal Lab you can try a real sandbox checkout to see exactly how it works.",
  },
  {
    keys: /budget|spend|saving|save money/i,
    answer: "A budget is a plan for where your money goes. A simple one to try: split whatever you receive into three jars - Save (40%), Spend (40%), Give (20%). Every time money comes in, split it up first before spending anything. Over time your Save jar grows and you have money for bigger things you want.",
  },
  {
    keys: /diversif|spread|risk/i,
    answer: "Diversification means spreading your money across different investments so one bad day doesn't wipe you out. If you put all your practice dollars in one company and that company struggles, you lose a lot. But if you split them across 10 different companies, one struggling doesn't hurt much. 'Don't put all your eggs in one basket!'",
  },
  {
    keys: /inflation/i,
    answer: "Inflation is when prices rise over time - so the same $10 buys less than it used to. If inflation is 3% a year, something that costs $100 today will cost $103 next year. This is why keeping all your money as cash can actually mean losing value over time - your savings need to grow faster than inflation.",
  },
  {
    keys: /lemonade|business|entrepreneur/i,
    answer: "Running a lemonade stand is a great first business! Your revenue is all the money you collect. Your costs are lemons, sugar, cups and a sign. Profit is revenue minus costs. If you sell 20 cups at $1 each that's $20 revenue. If ingredients cost $8, your profit is $12. Reinvest some profit to make more lemonade and grow!",
  },
  {
    keys: /credit|debit|card/i,
    answer: "A debit card spends money you already have - it takes directly from your bank account. A credit card lets you borrow money from the bank to spend now and pay back later. The catch: if you don't pay back on time, you owe interest on top. Using a debit card is safer when you're learning - you can only spend what you have.",
  },
  {
    keys: /tax|taxes/i,
    answer: "Taxes are money collected by the government to pay for roads, schools, hospitals and public services. In most countries, when you earn money from a job or investments, a percentage goes to taxes. Understanding taxes matters because the amount you keep after tax (your 'net' income) is what you can actually spend or save.",
  },
  {
    keys: /hello|hi|hey|hola|start/i,
    answer: "Hi! I'm Penny, your money coach. I can explain things like compound growth, budgeting, investing, PayPal, inflation, and more. What would you like to learn about today?",
  },
];

const OFFLINE_FALLBACK_DEFAULT =
  "Great question! That's a topic I want to help you with. For the best answer, make sure the app has its AI connection set up. In the meantime, try asking me about: compound growth, budgeting, investing, PayPal, inflation, or savings accounts.";

function offlineAnswer(messages: ChatMessage[]): string {
  // Find the last user message
  const last = [...messages].reverse().find((m) => m.role === 'user');
  if (!last) return OFFLINE_FALLBACK_DEFAULT;

  const text = last.content;
  for (const { keys, answer } of OFFLINE_QA) {
    if (keys.test(text)) return answer;
  }
  return OFFLINE_FALLBACK_DEFAULT;
}

const OFFLINE_FALLBACK = OFFLINE_FALLBACK_DEFAULT;
