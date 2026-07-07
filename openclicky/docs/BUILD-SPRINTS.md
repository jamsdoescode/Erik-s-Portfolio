# Build Sprints — Done

## Sprint 1 — Capture infra + one outcome (complete)

- [x] OpenClicky screen capture with self-exclusion (`CompanionScreenCaptureUtility`)
- [x] Node agent v0: organize Downloads
- [x] **Done.** notification path

## Sprint 2 — Agent executor + tool belt (complete)

- [x] `agent/src/agentLoop.js` — plan → tools → verify loop
- [x] Tool belt: files, screen, browser, shell, pause, notify
- [x] `POST /run` with intent + screenshots
- [x] Say intent: double-tap Shift → `DoneExecutor`

## Sprint 3 — Show + Watch (complete)

- [x] Show: `POST /playbooks`, `npm run show -- "intent"`
- [x] Watch: `POST /watch/detect`, accept offer → playbook
- [x] Pause for 2FA via `pause_for_user` tool

## Sprint 4 — Schedule + billing stub (complete)

- [x] `POST /schedules` + `node-cron` reload
- [x] `GET /billing` Stripe config stub
- [x] Target path: 345 × $29 = $10k MRR

## Sprint 5 — Beta launch prep (complete)

- [x] `docs/GTM-BETA.md` + `landing/index.html`
- [x] Concierge validation playbook (`docs/VALIDATION.md`)

## Next (post-MVP)

- Stripe Checkout integration
- Supabase auth + run history
- OpenClickyComputerUseRuntime as primary screen executor (vs cliclick)
- Watch mode passive detection (Accessibility / activity heuristics)
