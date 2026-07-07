//
//  DoneAgentClient.swift
//  cursor-buddy
//
//  Local HTTP client for the done-agent Node service.
//

import Foundation

enum DoneAgentClient {
    static let defaultPort: Int = 7432

    struct RunTaskResult: Decodable {
        let status: String
        let summary: String?
        let steps: [RunTaskStep]?
        let dryRun: Bool?
        let message: String?
    }

    struct RunTaskStep: Decodable {
        let tool: String?
    }

    struct OrganizeDownloadsResult: Decodable {
        let status: String
        let summary: String?
        let movesApplied: Int?
        let foldersCreated: Int?
        let remainingTopLevelCount: Int?
        let message: String?
        let dryRun: Bool?
    }

    struct HealthResponse: Decodable {
        let ok: Bool
        let service: String?
    }

    static func baseURL(port: Int = defaultPort) -> URL {
        URL(string: "http://127.0.0.1:\(port)")!
    }

    static func isAgentRunning(port: Int = defaultPort) async -> Bool {
        do {
            let health = try await fetchHealth(port: port)
            return health.ok
        } catch {
            return false
        }
    }

    static func fetchHealth(port: Int = defaultPort) async throws -> HealthResponse {
        let url = baseURL(port: port).appendingPathComponent("health")
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = 3

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw DoneAgentError.unreachable
        }
        return try JSONDecoder().decode(HealthResponse.self, from: data)
    }

    static func runTask(
        intent: String,
        screenshots: [[String: String]] = [],
        dryRun: Bool = false,
        outcomeId: String? = nil,
        port: Int = defaultPort
    ) async throws -> RunTaskResult {
        let url = baseURL(port: port).appendingPathComponent("run")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 180

        var body: [String: Any] = ["intent": intent, "dryRun": dryRun]
        if !screenshots.isEmpty {
            body["screenshots"] = screenshots
        }
        if let outcomeId {
            body["outcomeId"] = outcomeId
        }
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw DoneAgentError.unreachable
        }

        if http.statusCode == 200 {
            return try JSONDecoder().decode(RunTaskResult.self, from: data)
        }

        if let errorBody = try? JSONDecoder().decode(RunTaskResult.self, from: data),
           let message = errorBody.message {
            throw DoneAgentError.server(message)
        }

        throw DoneAgentError.server("Agent returned status \(http.statusCode)")
    }

    static func organizeDownloads(dryRun: Bool = false, port: Int = defaultPort) async throws -> OrganizeDownloadsResult {
        let url = baseURL(port: port).appendingPathComponent("run/organize-downloads")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 120
        request.httpBody = try JSONSerialization.data(withJSONObject: ["dryRun": dryRun])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw DoneAgentError.unreachable
        }

        if http.statusCode == 200 {
            return try JSONDecoder().decode(OrganizeDownloadsResult.self, from: data)
        }

        if let errorBody = try? JSONDecoder().decode(OrganizeDownloadsResult.self, from: data),
           let message = errorBody.message {
            throw DoneAgentError.server(message)
        }

        throw DoneAgentError.server("Agent returned status \(http.statusCode)")
    }

    enum DoneAgentError: LocalizedError {
        case unreachable
        case server(String)

        var errorDescription: String? {
            switch self {
            case .unreachable:
                return "Done agent is not running. Start it with: cd agent && npm run dev"
            case .server(let message):
                return message
            }
        }
    }
}
