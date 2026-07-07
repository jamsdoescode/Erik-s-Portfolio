# PRD — Done MVP

## One-liner

Ambient Mac agent: Say / Show / Watch → screen context → plan → tools → verify → **Done.**

## In scope (MVP)

- Say intent: double-tap Shift text box + HTTP `/run`
- Show intent: save outcome playbook (intent + verification criteria)
- Watch intent: detect repeat manual patterns, offer automation
- v1 tool belt: files, screen (click/type), browser open, allowlisted shell, pause, notify
- Outcome verification before marking Done
- Dry-run mode
- Schedule saved outcomes (cron)
- Organize Downloads (v0 dogfood outcome)

## Out of scope (MVP)

- Team shared library (Team tier v2)
- Gmail/Slack API connectors (v2)
- Full billing UI (Stripe stub only; manual concierge $29 first)
- Windows/Linux

## Activation metric

First **Done.** within 24h of install (any outcome completed end-to-end).

## Tech stack

| Layer | Choice |
|-------|--------|
| Mac shell | OpenClicky (Swift, ScreenCaptureKit) |
| Agent runner | Node 20+ local service |
| Planning + vision | OpenAI (`gpt-4o` default) |
| Screen tools (no Xcode path) | `screencapture`, `cliclick`, `open` |
| Auth/billing (later) | Supabase + Stripe |
| Data | Local JSON (`agent/data/`) for playbooks + schedules |

## Pricing tiers

| Tier | Price | Includes |
|------|------:|----------|
| Pro | $29/mo | Unlimited agent runs, schedules, playbooks |
| Team | $49/mo | Shared outcome library (v2) |

## Kill criteria

Agent cannot reliably finish **one** outcome on dogfood machine after 2 weeks.
