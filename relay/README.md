# Relay

**Pick up exactly where you left off.**

Relay is a context-reload productivity tool for people who juggle multiple projects. When you context-switch, log a 15-second stop note. When you return, get an AI briefing that reloads your brain — so you stop re-reading old notes and start doing the work.

## The problem

Context switching costs ~23 minutes per jump. You open a project you haven't touched in three days and spend twenty minutes re-reading Slack, Notion, and git history just to remember where you were.

## The solution

1. **Projects** — one context per codebase, client, or initiative
2. **Resume session** — start the clock when you begin working
3. **Stop & relay** — log what you did, what's next, and blockers when you switch away
4. **Relay brief** — AI synthesizes your last sessions into a 30-second context reload

## Pricing

- **14-day free trial** (no credit card)
- **$14.99/month Pro** — unlimited projects, AI briefs, session history

## Quick start

```bash
cd relay
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo account

- Email: `demo@relay.app`
- Password: `demo1234`

## Environment

Copy `.env.example` to `.env`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite path (dev) |
| `JWT_SECRET` | Session signing secret |
| `OPENAI_API_KEY` | Optional — smarter briefs and stop parsing |

## Tech stack

- Next.js 16 (App Router)
- Prisma 7 + SQLite
- JWT auth (httpOnly cookies)
- Tailwind CSS 4
- OpenAI GPT-4o-mini (optional)

## vs. todo apps

Todo apps tell you *what* to do. Relay tells you *where you left off* when you return to work you already started. It's built for context switchers, not task collectors.
