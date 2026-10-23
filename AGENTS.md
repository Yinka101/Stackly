# Stackly — Agent Memory

> Built with [Arc Studio](https://studio.arc.io)

---

## Product Brief (source of truth)

**Stackly** is a money school for kids and young adults. It teaches how PayPal works and how investing works through short lessons, a paper-trading portfolio, and an AI coach. The goal: make investing a normal skill from early childhood.

### Audience / Age Bands

| Band | Ages | Reading level |
|------|------|--------------|
| Sprouts | 7–10 | Grade 3 |
| Builders | 11–14 | Grade 6 |
| Investors | 15–24 | Grade 9 |

Every lesson, label, and AI answer must adapt to the active band.

### Hard Rules

1. **Hackathon constraint** — PayPal and AI must both be central. The demo must work end to end. Public repo, MIT license, README with sandbox test details.
2. **No real trades** — Practice Dollars only. Label every investing screen with an educational disclaimer.
3. **AI never recommends** buying/selling a specific security and never gives personal financial advice.
4. **PayPal = adult accounts** — every payment approved by a parent, runs in PayPal sandbox, kids never enter payment details.
5. **Minimum data from kids** — collect only: nickname, age band, avatar. No email, photos, location, or free-text sharing between users.
6. **Secrets in server env vars only** — never in client code, logs, or git.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node (Hono) |
| Database | SQLite + Drizzle ORM |
| Payments | PayPal REST API (sandbox) |
| AI | Single LLM provider behind a thin wrapper (provider TBD) |
| Deploy | Render |

---

## Project Structure

```
/
├── src/                    # Vite + React frontend
│   ├── App.tsx             # Thin composition root
│   ├── components/         # Feature components (one file per view)
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Shared helpers
├── server/                 # Hono API server
│   ├── index.ts            # Entry point, port 3001
│   ├── db/                 # Drizzle schema + migrations
│   └── routes/             # Route handlers
├── scripts/                # Build / deploy helpers
└── AGENTS.md               # This file
```

## API Routes (planned)

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/health | Liveness check |
| POST | /api/auth/onboard | Create/return kid profile (nickname, band, avatar) |
| GET | /api/lessons | List lessons for a band |
| GET | /api/lessons/:id | Lesson content |
| GET | /api/portfolio | Paper portfolio for session |
| POST | /api/portfolio/trade | Paper buy/sell |
| POST | /api/ai/ask | Ask the AI coach |
| POST | /api/paypal/create-order | Create PayPal sandbox order (parent) |
| POST | /api/paypal/capture-order | Capture approved PayPal order (parent) |

---

## Deployed Contracts

None — this app does not use onchain contracts.

---

## Environment Variables

### Frontend (VITE_ prefix, public values only)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE` | Base URL of the Hono server (default `/api` via proxy) |

### Backend (server-side only, never exposed to browser)

| Variable | Purpose |
|----------|---------|
| `PAYPAL_CLIENT_ID` | PayPal sandbox app client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal sandbox app client secret |
| `PAYPAL_BASE_URL` | `https://api-m.sandbox.paypal.com` for sandbox |
| `OPENAI_API_KEY` | LLM provider key (or swap for another provider) |
| `DATABASE_URL` | Path to SQLite file (`./stackly.db` locally) |
| `PORT` | Hono server port (default `3001`) |

---

## Working Style

- Small commits. After each task: typecheck → lint → tests → tell the human what changed and how to verify by hand.
- Never invent PayPal API behavior — read current PayPal docs first.
- If a requirement is unclear, ask one question and propose a default.
- Hackathon pace: working demo over polish, but never broken on main.

---

## Decisions & Notes

- Age-band is stored client-side for the MVP demo; the server trusts what the client sends (no auth tokens needed for a hackathon demo, but the schema has a `sessionId` column ready for proper auth).
- PayPal REST v2 Orders API is the integration target (`/v2/checkout/orders`).
- AI coach uses a system-prompt prefix that locks in the current band's reading level and prohibits financial advice.
- "Practice Dollars" are integers stored in SQLite; no fractional cents, no real currency symbol.
