# Stackly — Devpost Submission

---

## Prize categories targeted

| Category | Why Stackly qualifies |
|----------|----------------------|
| **Best Use of PayPal** | PayPal Orders v2 is the transaction layer for every kit purchase. The PayPal Lab teaches the API itself through 4 missions. Behind-the-Scenes SSE shows live PayPal API calls decoded for learners. Every payment is parent-approved through an OAuth-protected approval flow. |
| **Best Use of AI / Agentic Commerce** | The Coach Agent uses OpenAI function calling to propose purchases, select products, and queue payment requests — without ever executing a payment autonomously. The agent's reasoning is shown step-by-step and every tool call is logged. This is agentic commerce with a safety layer. |
| **Best Use of AI for Social Good** | Financial literacy is a measurable global gap. Stackly targets ages 7–24 with age-adapted AI responses, hard guardrails against financial advice, and child-safe data minimalism. The AI coach can't recommend specific securities and never asks for personal information. |

---

## Inspiration

I kept coming across statistics about financial literacy — or the lack of it. In the UK, only 37% of adults could correctly answer three basic money questions. In the US, the average person carries credit card debt they don't understand how to pay off efficiently. And in every case, the pattern was the same: the habits were formed (or not) by age 14.

The problem isn't intelligence. It's exposure. Kids who grow up watching parents confidently use PayPal, talk about saving, and understand a stock chart develop intuition that others spend decades trying to acquire.

Stackly is the platform I wished existed when I was 12. A place that explains how PayPal actually works — the OAuth token, the order creation, the webhook — in language a kid can understand. A place where you can buy 10 shares of Apple with pretend money and watch what happens. A place where an AI coach explains compound interest at exactly your reading level.

---

## What it does

Stackly is a financial literacy platform for ages 7–24, structured around three age bands:

- **Sprouts (7–10):** Grade 3 language, earning and saving, how PayPal moves money
- **Builders (11–14):** Grade 6 language, income vs expense, paper trading, requesting money
- **Investors (15–24):** Grade 9 language, portfolio theory, compound growth, market mechanics

**Core features:**

**Lessons engine.** 14 lessons across PayPal Basics and Investing Basics, each with vocabulary adapted to the active age band. Completing a lesson awards XP and extends a learning streak. A parent summary is generated after every session.

**Paper trading.** Practice buy and sell orders against a portfolio of 20+ tickers using CC0 synthetic price data. A Replay mode rewinds the portfolio and plays it forward day-by-day so learners experience the emotional arc of a real investment without any financial risk.

**PayPal Lab.** Four missions that teach how PayPal works from the inside: sending money, receiving money, requesting money, and buying a learning kit. Mission 3 ("Buy a Learning Kit") involves a real PayPal sandbox checkout — but only after a parent approves it. The Behind-the-Scenes panel shows the live SSE event stream of every PayPal API call, decoded and labelled.

**AI Coach.** A band-adapted chat assistant, quiz generator, concept explainer, and portfolio reviewer. The coach is built on GPT-4o-mini with a system prompt that prohibits financial advice about specific securities and constrains vocabulary to the learner's reading level. An input moderator strips PII and blocks adversarial prompts; an output moderator checks every response before delivery.

**Coach Agent (agentic commerce).** The learner types a goal — "I want to start a lemonade stand" — and the agent reasons in steps using OpenAI function calling: it calls `list_kits`, selects the best matching kit, calls `create_purchase_request`, and shows a step-by-step "Coach's plan" timeline. No payment is executed. The request lands in the parent's approval queue. The agent cannot spend money; it can only propose.

**Family dashboard.** A parent-facing area with: weekly learner summaries (lessons, streak, balance change, Coach's note), an approvals queue with approve/decline and history, per-learner controls (weekly spending cap, Coach toggle, reading level override), AI-generated conversation starters based on what the child learned, and GDPR-style data export and delete.

---

## How we built it

**Frontend:** React 18 + Vite + TypeScript + Tailwind CSS. Three age-band themes with CSS custom properties. Full keyboard navigation, ARIA roles, skip-to-content link, and reduced-motion support throughout. AG Grid for the portfolio table. Recharts for performance charts with table fallbacks for screen readers.

**Backend:** Hono on Bun, running as a Node service on Render. SQLite + Drizzle ORM for the database. Zod for input validation on every mutable endpoint. Rate limiting (sliding window, in-memory), CSP and HSTS headers, HMAC-SHA256 webhook verification.

**AI layer:** A thin provider wrapper around the OpenAI Chat Completions API. The `ai/provider.ts` module is swappable — set `COACH_PROVIDER`, `COACH_MODEL`, and `COACH_BASE_URL` to point at any OpenAI-compatible endpoint. The agent loop in `server/ai/agentLoop.ts` implements multi-round function calling with a 6-round cap, full result persistence, and an offline fallback.

**Agent tools (server-side, least privilege):**
- `list_kits` — returns the available practice kits
- `create_purchase_request` — creates a pending row in the DB; no PayPal call
- `get_order_status` — reads the status of a prior request
- `list_recent_activity` — returns recent approved/declined requests for the learner

**PayPal integration:** Orders v2 REST API. OAuth 2.0 client credentials token fetch with a 5-minute cache. Idempotency keys on every order creation. Webhook HMAC verification. SSE endpoint that pushes PayPal events to the learner's Behind-the-Scenes panel in real time.

**Security:** Pre-commit hook that blocks commits containing API key patterns. Zod schemas for all 18 mutable endpoints. Input moderator and output moderator on all AI paths. The demo family is seeded with stable IDs using `INSERT OR IGNORE` on every server startup, so it survives redeployment.

**Testing:** 17 unit tests for the PayPal client. 6 Playwright smoke test files covering the full demo path: landing, auth, lesson, trade, PayPal mission 3, and the Coach agent flow.

---

## Challenges

**PayPal webhook timing.** The Behind-the-Scenes SSE feature required wiring PayPal webhooks through an SSE connection kept open by the browser. On Render free tier, the service sleeps — and a sleeping service can't receive webhooks. We solved this by having the SSE endpoint poll the database for new webhook events rather than holding a live socket, so the connection is stateless and survives a container sleep/wake cycle.

**Age-adaptive AI.** Getting GPT-4o-mini to consistently produce Grade 3 language for Sprouts without losing accuracy took several prompt iterations. The final system prompt uses explicit word-count constraints, a banned-jargon list, and a Flesch-Kincaid reading level target. We run 20 adversarial eval prompts on every CI run.

**Child safety and agentic commerce.** The hardest design question was: how much autonomy should the agent have? The answer was zero financial autonomy. The agent's `create_purchase_request` tool writes a pending row — it never calls PayPal. The PayPal call only happens after a separate authenticated parent action. This is a deliberate architectural choice, not a limitation.

**Render free tier cold starts.** A 30–60 second cold start turns a login into a spinner. We addressed this with an UptimeRobot monitor at `/health` every 5 minutes, an 8-second session-check timeout (so a cold API doesn't block the landing page), and a clear "server is waking up" message with retry guidance.

---

## Accomplishments

- Built a fully working agentic commerce loop where the agent proposes, the parent approves, and PayPal executes — with a complete audit trail at every step
- Shipped 14 lessons × 3 reading levels with genuine vocabulary adaptation, not just font-size changes
- Implemented a Behind-the-Scenes feature that turns a real PayPal sandbox checkout into a live API tutorial
- Zero TypeScript errors across 8,000+ lines of code; 17/17 unit tests passing; 6 Playwright smoke tests covering the full demo path
- Designed every screen with full keyboard navigation, ARIA roles, and reduced-motion support

---

## What we learned

- **Agentic commerce needs a human in the loop by design.** The most interesting engineering decision was not how to make the agent more autonomous but how to make its limits visible and trustworthy. The plan timeline — showing every tool call in plain language — is what makes parents comfortable approving.
- **Reading level is the hardest UX problem in edtech.** The difference between Grade 3 and Grade 9 language is not vocabulary size — it's sentence structure, assumed context, and metaphor choice. Getting this right in an AI response takes a lot of prompt engineering and adversarial testing.
- **PayPal's API surface is richer than most developers realise.** The Orders v2 API, combined with webhooks and idempotency, supports genuinely sophisticated commerce patterns. The Behind-the-Scenes feature exists because we learned this ourselves and wanted to pass it on.

---

## What's next

1. **Persistent storage** — Turso (SQLite edge) to survive Render redeployments
2. **Real-time parent alerts** — push notifications via web push when an agent request arrives
3. **Curriculum expansion** — budgeting, taxes, credit, compound interest, goal-setting
4. **Live price data** — opt-in delayed feed with explicit licensing
5. **School edition** — class codes, teacher progress dashboards, lesson assignment
6. **Mobile app** — React Native with the same backend
7. **Multi-language** — Spanish, French, Portuguese for global reach
8. **PayPal mainnet** — upgrade from sandbox to live with KYB and parental consent flows

---

## Repository and live demo

- **GitHub:** https://github.com/Yinka101/Stackly (public, MIT)
- **Live site:** https://stackly-web.onrender.com
- **API health:** https://stackly-api.onrender.com/health
- **Demo credentials:** see README or click the Demo button on the live site
