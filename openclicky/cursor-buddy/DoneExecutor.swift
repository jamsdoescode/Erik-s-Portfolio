//
//  DoneExecutor.swift
//  cursor-buddy
//
//  Say intent → screen capture (self excluded) → Done agent → notification.
//

import Foundation

@MainActor
enum DoneExecutor {
    static func submitIntent(
        _ intent: String,
        companionManager: CompanionManager,
        source: String = "done_say_intent",
        dryRun: Bool = false
    ) {
        let trimmed = intent.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        Task {
            await run(intent: trimmed, companionManager: companionManager, source: source, dryRun: dryRun)
        }
    }

    private static func run(
        intent: String,
        companionManager: CompanionManager,
        source: String,
        dryRun: Bool
    ) async {
        var screenshots: [[String: String]] = []

        do {
            let captures = try await CompanionScreenCaptureUtility.captureCursorScreenAsJPEG()
            screenshots = captures.map { capture in
                [
                    "base64": capture.imageData.base64EncodedString(),
                    "mimeType": "image/jpeg",
                    "label": capture.label
                ]
            }
        } catch {
            OpenClickyMessageLogStore.shared.append(
                lane: "done",
                direction: "internal",
                event: "done.capture.failed",
                fields: ["source": source, "error": error.localizedDescription]
            )
        }

        do {
            let result = try await DoneAgentClient.runTask(
                intent: intent,
                screenshots: screenshots,
                dryRun: dryRun
            )

            let summary = result.summary ?? "Task completed."
            _ = OpenClickyDesktopNotificationCenter.shared.post(
                title: result.status == "done" ? "Done." : "Done agent",
                body: summary,
                threadID: "done.outcome",
                userInfo: ["source": source, "status": result.status]
            )

            OpenClickyMessageLogStore.shared.append(
                lane: "done",
                direction: "outgoing",
                event: "done.outcome.\(result.status)",
                fields: [
                    "source": source,
                    "summary": summary,
                    "stepCount": result.steps?.count ?? 0
                ]
            )
        } catch {
            _ = OpenClickyDesktopNotificationCenter.shared.post(
                title: "Done agent error",
                body: error.localizedDescription,
                threadID: "done.error",
                userInfo: ["source": source]
            )
        }
    }
}
