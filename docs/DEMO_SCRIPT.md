# Stackly — Demo Script
### Target runtime: 2 minutes 45 seconds

---

## Before you start

**Open two browser windows side by side:**
- Left: https://stackly-web.onrender.com (logged in as Ben, the Builders learner)
- Right: https://stackly-web.onrender.com (logged in as the parent: demo@stackly.app / demo1234)

**Click the Demo button** (bottom-right) and hit "Reset demo" so XP and Practice Dollars are at starting values.

---

## 0:00 — Hook (20 seconds)

**[Screen: Landing page hero]**

> "Two-thirds of adults worldwide are financially illiterate. The habits that shape lifetime wealth are set before age 14 — but most kids have never seen a PayPal receipt, never placed a trade, and have no safe space to learn from mistakes.
>
> This is Stackly. A money school that teaches how PayPal works and how investing works — through real lessons, fake money, and an AI coach that actually knows when to stop."

*Click "Start free" — land on the onboarding fork.*

---

## 0:20 — A learner finishes a lesson (30 seconds)

**[Screen: Ben's Home — Builders band, green theme]**

> "Ben is 13. He's on the Builders track. His home screen shows his XP ring, a 4-day streak, and three missions for this week."

*Click "Learn" in the bottom nav. The lesson path map loads.*

> "Eight lessons on PayPal Basics and Investing Basics. Each one adapts its vocabulary to Ben's reading level."

*Click the first incomplete lesson: "How PayPal moves money".*

> "He reads through it — Grade 6 language, no jargon — and hits Complete."

*Click Complete. The celebration modal fires: confetti, XP badge, streak tick.*

> "25 XP. Streak extended. The parent gets a summary of exactly what he learned."

---

## 0:50 — Paper trade + Replay mode (30 seconds)

**[Screen: Invest tab — portfolio view]**

> "Now let's put the lesson to work. Ben has $100 in Practice Dollars — not real money, and every screen says so."

*Show the holdings table — AG Grid with ticker, shares, value, gain/loss.*

> "He searches for Apple. Buys 2 shares. Done."

*Open the trade modal, type AAPL, qty 2, hit Buy. Toast: "Trade recorded."*

> "Now Replay — this is where the lesson lands."

*Click the Replay tab.*

> "Replay takes his exact portfolio back 90 days and runs it forward, day by day, with real synthetic price moves. He sees what he would have earned if he'd started three months ago — and why patience matters."

*Scrub the timeline slider forward a few weeks.*

---

## 1:20 — PayPal Lab — Mission 3 with Behind the Scenes (40 seconds)

**[Screen: PayPal Lab tab]**

> "The PayPal Lab is where finance stops being abstract."

*Click Mission 3: "Buy a Learning Kit".*

> "Ben wants the $10 Investing Starter Kit. He taps Request — but he can't pay. That's the point."

*Click the kit card. A "Waiting for parent approval" banner appears.*

> "Every purchase goes to his parent's approval queue. Kids never enter card details."

*Switch to the parent window. Approvals tab — the pending request is there with Ben's reason.*

> "Mum approves it. One tap."

*Click Approve.*

*Switch back to Ben's window. Click "Behind the Scenes".*

> "And here's the magic — a live SSE stream showing the actual PayPal API calls: the OAuth token fetch, the order creation, the capture, the webhook event. Decoded, labelled, real."

*The SSE panel shows events appearing in real time.*

> "This is how PayPal works — Ben can see it."

---

## 2:00 — Coach Agent proposes and parent approves (30 seconds)

**[Screen: Coach tab — Agent sub-tab]**

> "Now the AI. Ben types: 'I want to start a lemonade stand — what do I need?'"

*Type the prompt. Hit send.*

> "The Coach Agent reasons in steps — you can watch it think."

*The plan timeline appears, cards expanding: "Understood your goal", "Listed available kits", "Chose Lemonade Stand Starter $5", "Created purchase request — waiting for parent approval".*

> "It proposed a kit, explained why in plain language, and queued it for approval — without executing a single payment."

*Switch to parent window. New request in Approvals: "Lemonade Stand Starter — $5 — proposed by Coach Agent".*

*Click to expand the audit log — shows every tool call, timestamp, and duration.*

> "Full audit trail. The parent approves — or doesn't. The agent has no power to spend money."

---

## 2:30 — Impact and safety (15 seconds)

**[Screen: Family dashboard — Controls tab]**

> "Parents set a weekly spending cap, turn the agent on or off, override reading level, export their child's data as JSON, or delete it entirely — one button, immediate, no email required."

*Show the Controls tab and the Privacy tab briefly.*

> "No child data leaves the device except a nickname, age band, and avatar. No email, no photo, no location."

---

## 2:45 — Call to action (5 seconds)

**[Screen: Landing hero]**

> "Stackly. MIT licensed, open source, running live at stackly-web.onrender.com.
> The link is in the README."

---

## Timing check

| Section | Start | Duration |
|---------|-------|----------|
| Hook | 0:00 | 0:20 |
| Lesson | 0:20 | 0:30 |
| Trade + Replay | 0:50 | 0:30 |
| PayPal Lab | 1:20 | 0:40 |
| Coach Agent | 2:00 | 0:30 |
| Safety | 2:30 | 0:15 |
| CTA | 2:45 | 0:05 |
| **Total** | | **2:50** |

---

## Fallback if the API is cold-starting

If you see "The server is waking up" after logging in, wait 30 seconds and click Sign in again. The UptimeRobot monitor should prevent this during the demo — verify it is running before presenting.
