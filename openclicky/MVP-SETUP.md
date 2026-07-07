# Done MVP — setup

**Automate anything on your screen. It actually does it.**

## Quick start

```bash
cd agent
cp .env.example .env   # add OPENAI_API_KEY
npm install
npm run dev            # http://127.0.0.1:7432
```

## Say intent (primary UX)

1. Start agent: `npm run dev`
2. Open OpenClicky in Xcode (Cmd+R)
3. **Double-tap Shift** → type what you want → Enter
4. Agent captures screen (OpenClicky UI excluded) → executes → **Done.**

CLI without OpenClicky:

```bash
npm run task -- "organize my Downloads folder"
npm run task:dry -- "move screenshots to Pictures"
```

## Show intent

```bash
npm run show -- "Every Monday export Stripe CSV to Drive/Reports"
curl -X POST http://127.0.0.1:7432/playbooks -H 'content-type: application/json' \
  -d '{"title":"Stripe export","intent":"Export Stripe CSV to ~/Drive/Reports"}'
```

## Watch intent

```bash
curl -X POST http://127.0.0.1:7432/watch/detect -H 'content-type: application/json' \
  -d '{"pattern":"manual_downloads_sort","suggestion":"Organize Downloads weekly","appName":"Finder"}'
```

## Schedule

```bash
curl -X POST http://127.0.0.1:7432/schedules -H 'content-type: application/json' \
  -d '{"playbookId":"pb_...","cron":"0 9 * * 1","enabled":true}'
```

## Tool belt

Files · screen click/type (cliclick) · browser open · allowlisted shell · pause · notify

Install cliclick for screen tools: `brew install cliclick`

## Docs

- `PRODUCT.md` — product definition
- `docs/PRD.md` — MVP scope
- `docs/VALIDATION.md` — concierge smoke test
- `docs/BUILD-SPRINTS.md` — sprint checklist
- `docs/GTM-BETA.md` — launch plan
- `landing/index.html` — beta waitlist page
