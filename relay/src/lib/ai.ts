import OpenAI from "openai";
import type { RelayLogView } from "./relay";
import { buildHeuristicBrief, timeSince } from "./relay";

function getClient() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function generateRelayBrief(
  projectName: string,
  logs: RelayLogView[]
): Promise<{ headline: string; body: string; bullets: string[]; usedAI: boolean }> {
  const fallback = buildHeuristicBrief(projectName, logs);
  const client = getClient();
  if (!client || logs.length === 0) {
    return { ...fallback, bullets: fallback.body.split("\n\n").filter(Boolean) };
  }

  const context = logs
    .slice(0, 8)
    .map((l) => {
      const when = timeSince(l.endedAt ?? l.startedAt);
      return [
        `[${when}] ${l.title}`,
        l.accomplished ? `Did: ${l.accomplished}` : null,
        l.nextStep ? `Next: ${l.nextStep}` : null,
        l.blockers ? `Blockers: ${l.blockers}` : null,
        l.body ? `Notes: ${l.body}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n---\n");

  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You help knowledge workers reload context when returning to a project. Be concise, actionable, second-person. Return JSON: { headline, body, bullets: string[] }",
        },
        {
          role: "user",
          content: `Project: ${projectName}\n\nRecent session logs:\n${context}\n\nWrite a 30-second context reload briefing.`,
        },
      ],
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) throw new Error("empty");

    const parsed = JSON.parse(raw) as {
      headline?: string;
      body?: string;
      bullets?: string[];
    };

    return {
      headline: parsed.headline || fallback.headline,
      body: parsed.body || fallback.body,
      bullets: parsed.bullets?.length ? parsed.bullets : fallback.body.split("\n\n"),
      usedAI: true,
    };
  } catch {
    return { ...fallback, bullets: fallback.body.split("\n\n").filter(Boolean) };
  }
}

export async function parseStopNote(raw: string): Promise<{
  accomplished: string;
  nextStep: string;
  blockers: string;
  title: string;
}> {
  const trimmed = raw.trim();
  const client = getClient();

  if (!client) {
    const lines = trimmed.split("\n").filter(Boolean);
    return {
      title: lines[0]?.slice(0, 80) || "Session stop",
      accomplished: lines[0] || trimmed.slice(0, 200),
      nextStep: lines[1] || "",
      blockers: lines[2] || "",
    };
  }

  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Parse a context-switch note into JSON: { title (short), accomplished, nextStep, blockers }. Use empty string if unknown.',
        },
        { role: "user", content: trimmed },
      ],
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content || "{}") as {
      title?: string;
      accomplished?: string;
      nextStep?: string;
      blockers?: string;
    };

    return {
      title: parsed.title || "Session stop",
      accomplished: parsed.accomplished || trimmed,
      nextStep: parsed.nextStep || "",
      blockers: parsed.blockers || "",
    };
  } catch {
    return {
      title: "Session stop",
      accomplished: trimmed,
      nextStep: "",
      blockers: "",
    };
  }
}
