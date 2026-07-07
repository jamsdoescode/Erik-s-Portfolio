# Concierge Validation — Smoke Test

Run **before** scaling build. Goal: 5+ people pay $29 after you manually prove 3 outcomes.

## Three dogfood outcomes

| # | Outcome ID | User says | Done means |
|---|------------|-----------|------------|
| 1 | `downloads_sorted` | "Organize my Downloads" | No loose top-level files; folders by type |
| 2 | `screenshots_archived` | "Move screenshots to Pictures/Screenshots" | `.png`/`.jpg` screen captures moved |
| 3 | `invoices_folder` | "Put PDF invoices in Documents/Invoices" | PDFs with invoice-like names filed |

## Concierge script (15 min call)

1. "What do you repeat every week on your Mac that you hate?"
2. Pick one outcome from their list (or table above).
3. **You act as the agent live** — share screen, do it manually, narrate steps.
4. "If this happened automatically every Monday with a Done notification — would you pay $29/mo?"
5. If yes → send Stripe payment link (manual) or waitlist with paid intent checkbox.

## Pass/fail

| Signal | Action |
|--------|--------|
| 5+ paid or strong paid intent | Commit to agent loop + beta |
| 2–4 interested, 0 paid | Iterate outcome selection, retry |
| 0 interest | Kill or pivot ICP |

## Charge $29

Use Stripe Payment Link or manual invoice for concierge cohort. Track in spreadsheet until billing ships.
