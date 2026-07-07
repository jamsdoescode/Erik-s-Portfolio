# FollowThrough

**Never miss a promise you made.**

FollowThrough is an AI-powered B2C SaaS ($14.99/month) that extracts commitments from unstructured text — meeting notes, emails, Slack dumps — and turns them into an actionable follow-up system.

## The Problem

Professionals make dozens of implicit promises every week: "I'll send that deck by Friday," "Let me intro you to Sarah," "Waiting on legal." These live buried in meeting notes, email threads, and chat logs. Generic todo apps require manual entry. Missing a follow-up costs reputation, deals, and trust.

## The Solution

FollowThrough uses AI to:

1. **Capture** — Paste any text; AI extracts who owes what, to whom, and by when
2. **Prioritize** — Overdue, due today, upcoming, and waiting-on buckets
3. **Digest** — Daily morning briefing of what needs attention
4. **Ask** — Natural language queries ("What did I promise Marcus?")
5. **Draft** — One-click follow-up message generation
6. **People** — Relationship view of who you owe vs. who owes you

## Pricing

- **14-day free trial** (no credit card)
- **$14.99/month Pro** — unlimited captures, digest, Ask, drafts

## Quick Start

```bash
cd followthrough
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Account

- Email: `demo@followthrough.app`
- Password: `demo1234`

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite path (dev) or Postgres URL (prod) |
| `JWT_SECRET` | Session signing secret |
| `OPENAI_API_KEY` | Optional — GPT extraction, Ask, drafts |
| `STRIPE_*` | Billing checkout + webhooks |
| `RESEND_*` | Password reset + digest emails |
| `CRON_SECRET` | Protects `/api/cron/*` routes |
| `NEXT_PUBLIC_APP_URL` | App URL for Stripe redirects + emails |

## Cron Jobs

Two hourly cron routes (configured in `vercel.json`):

- `/api/cron/snooze` — wakes expired snoozes
- `/api/cron/digest` — sends daily digest emails

Local test:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/snooze
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/digest
```
## AI Configuration

Smart heuristic parsing works out of the box. For GPT-powered extraction, Ask answers, and follow-up drafts:

```bash
# .env
OPENAI_API_KEY=sk-...
```

## Tech Stack

- Next.js 16 (App Router)
- Prisma 7 + SQLite
- JWT auth (httpOnly cookies)
- Tailwind CSS 4
- OpenAI GPT-4o-mini (optional)

## Production Checklist

- [ ] Set `JWT_SECRET` to a secure random value
- [ ] Configure Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`)
- [ ] Configure Resend for password reset + daily digest emails
- [ ] Set `CRON_SECRET` and deploy cron jobs (see `vercel.json`)
- [ ] Deploy with Postgres (swap SQLite adapter for `@prisma/adapter-pg`)

## Why $14.99/month?

| Alternative | Price | Gap |
|---|---|---|
| Todoist Premium | $5/mo | Manual entry only |
| Motion | $34/mo | Calendar-focused, not commitment extraction |
| Superhuman | $30/mo | Email-only |

FollowThrough sits in the sweet spot: specialized AI for a daily pain point, priced below premium productivity tools but above generic todo apps.

## Project Structure

```
src/
├── app/           # Pages + API routes
├── components/    # UI components
├── lib/           # Auth, AI, commitment logic
└── generated/     # Prisma client
prisma/
├── schema.prisma
└── seed.ts
```

Built as a complete product — landing page, auth, onboarding, dashboard, capture, digest, ask, people, settings, and billing UI.
