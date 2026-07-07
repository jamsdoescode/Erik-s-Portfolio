# Extracted Infrastructure (OpenClicky / Clicky OSS)

Patterns borrowed for **Done** execution shell — not the buddy Q&A product.

## Taken from OpenClicky (openclicky-main)

| Component | File(s) | Used for |
|-----------|---------|----------|
| Screen capture (self-excluded) | `CompanionScreenCaptureUtility.swift` | Vision context without our UI |
| Menu bar + command input | `OpenClickyNotchCaptureWindowManager.swift`, `CompanionManager.swift` | Double-tap Shift → type intent |
| Computer use runtime | `OpenClickyComputerUseRuntime.swift` | Native click/type (fallback to Node cliclick) |
| Overlay / status | `OverlayWindow.swift` | Running / Done feedback |
| Desktop notifications | `OpenClickyDesktopNotificationCenter.swift` | **Done.** notification |
| Automation scheduling | `OpenClickyAutomationStore.swift` | Scheduled outcome runs |
| Hotkey monitor | `GlobalPushToTalkShortcutMonitor.swift` | Shift double-tap, Control+Option voice |

## Self-exclusion (Cluely-like)

`CompanionScreenCaptureUtility` filters out all windows owned by `com.jkneen.openclicky` before capture. The command box never appears in agent vision.

## NOT taken

- Blue triangle buddy UX
- Claude voice tutor pipeline as primary path
- Cloudflare worker dependency for MVP
- "Hey Clicky" wake word as core loop

## Node agent layer (`agent/`)

Runs locally on `:7432`. OpenClicky captures screen → POST intent + screenshot → agent plans and executes via tool belt.
