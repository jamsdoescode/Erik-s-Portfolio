export type ExtractedCommitment = {
  title: string;
  description?: string;
  personName?: string;
  personEmail?: string;
  direction: "i_owe" | "they_owe" | "neutral";
  dueDate?: string;
  priority: number;
  sourceSnippet?: string;
};

export type ExtractionResult = {
  captureTitle: string;
  commitments: ExtractedCommitment[];
  summary: string;
  usedAI: boolean;
};

const SYSTEM_PROMPT = `You extract actionable commitments from unstructured text (meeting notes, emails, Slack, voice transcripts).

Return ONLY valid JSON with this shape:
{
  "captureTitle": "short title for this capture",
  "summary": "1-2 sentence summary of key obligations",
  "commitments": [
    {
      "title": "imperative action item (max 80 chars)",
      "description": "context if needed",
      "personName": "who is involved",
      "personEmail": null or email if found,
      "direction": "i_owe" | "they_owe" | "neutral",
      "dueDate": "ISO date YYYY-MM-DD or null",
      "priority": 1-100 (100 = most urgent),
      "sourceSnippet": "exact quote from text"
    }
  ]
}

Rules:
- Extract ONLY explicit or strongly implied commitments, deadlines, and follow-ups
- "I will / I'll / I need to" = i_owe. "They will / waiting on" = they_owe
- Infer due dates from phrases like "by Friday", "EOD", "next week"
- Skip vague discussion with no action
- Max 12 commitments per capture`;

export async function extractCommitments(text: string): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text.slice(0, 12000) },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            captureTitle: parsed.captureTitle || "New capture",
            summary: parsed.summary || "",
            commitments: (parsed.commitments || []).map(normalizeCommitment),
            usedAI: true,
          };
        }
      }
    } catch {
      // fall through to heuristic
    }
  }

  return heuristicExtract(text);
}

function normalizeCommitment(raw: Record<string, unknown>): ExtractedCommitment {
  return {
    title: String(raw.title || "Follow up").slice(0, 120),
    description: raw.description ? String(raw.description) : undefined,
    personName: raw.personName ? String(raw.personName) : undefined,
    personEmail: raw.personEmail ? String(raw.personEmail) : undefined,
    direction: ["i_owe", "they_owe", "neutral"].includes(String(raw.direction))
      ? (raw.direction as ExtractedCommitment["direction"])
      : "i_owe",
    dueDate: raw.dueDate ? String(raw.dueDate) : undefined,
    priority: Math.min(100, Math.max(1, Number(raw.priority) || 50)),
    sourceSnippet: raw.sourceSnippet ? String(raw.sourceSnippet) : undefined,
  };
}

function heuristicExtract(text: string): ExtractionResult {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const commitments: ExtractedCommitment[] = [];
  const actionPatterns = [
    /(?:^|\s)(?:action|todo|follow[- ]?up|task)[:\s-]+(.+)/i,
    /(?:^|\s)(?:i(?:'ll| will)|need to|must|should|going to)\s+(.+)/i,
    /(?:^|\s)(?:send|share|email|call|schedule|review|prepare|finish|complete|deliver|submit|update|ping|check in with)\s+(.+)/i,
    /(?:^|\s)(?:waiting on|blocked on|pending)\s+(.+)/i,
    /(?:^|\s)(?:-|\*|\d+\.)\s*(.+(?:by|before|until|EOD|ASAP).+)/i,
  ];

  const namePattern = /(?:with|from|to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;

  for (const line of lines) {
    for (const pattern of actionPatterns) {
      const match = line.match(pattern);
      if (!match) continue;

      const action = match[1]?.replace(/\.$/, "").trim();
      if (!action || action.length < 8) continue;

      const lower = line.toLowerCase();
      let direction: ExtractedCommitment["direction"] = "i_owe";
      if (/waiting on|blocked on|they will|they'll|pending from/i.test(lower)) {
        direction = "they_owe";
      }

      const nameMatch = line.match(namePattern);
      const dueDate = parseRelativeDate(line);

      commitments.push({
        title: action.slice(0, 100),
        personName: nameMatch?.[1],
        direction,
        dueDate,
        priority: scorePriority(line, dueDate),
        sourceSnippet: line.slice(0, 200),
      });
      break;
    }
  }

  if (commitments.length === 0 && text.length > 40) {
    commitments.push({
      title: "Review captured notes and identify follow-ups",
      description: "No explicit action items detected — review manually",
      direction: "neutral",
      priority: 30,
    });
  }

  const unique = dedupeCommitments(commitments).slice(0, 10);

  return {
    captureTitle: inferTitle(text),
    summary: unique.length
      ? `Found ${unique.length} potential commitment${unique.length > 1 ? "s" : ""} using smart parsing. Add OPENAI_API_KEY for deeper extraction.`
      : "No commitments detected.",
    commitments: unique,
    usedAI: false,
  };
}

function dedupeCommitments(items: ExtractedCommitment[]): ExtractedCommitment[] {
  const seen = new Set<string>();
  return items.filter((c) => {
    const key = c.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferTitle(text: string): string {
  const first = text.split("\n")[0]?.trim() || "";
  if (first.length > 10 && first.length < 60) return first;
  return `Capture ${new Date().toLocaleDateString()}`;
}

function parseRelativeDate(line: string): string | undefined {
  const lower = line.toLowerCase();
  const today = new Date();

  if (/today|eod|end of day|tonight/.test(lower)) {
    return formatDate(today);
  }
  if (/tomorrow/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return formatDate(d);
  }
  if (/next week/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return formatDate(d);
  }
  if (/friday/.test(lower)) return formatDate(nextWeekday(today, 5));
  if (/monday/.test(lower)) return formatDate(nextWeekday(today, 1));

  const iso = line.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const slash = line.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
  if (slash) {
    const parsed = new Date(slash[1]);
    if (!isNaN(parsed.getTime())) return formatDate(parsed);
  }

  return undefined;
}

function nextWeekday(from: Date, target: number): Date {
  const d = new Date(from);
  const diff = (target + 7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function scorePriority(line: string, dueDate?: string): number {
  let score = 40;
  if (/asap|urgent|critical|immediately|today|eod/.test(line.toLowerCase())) score += 40;
  if (/important|priority|deadline/.test(line.toLowerCase())) score += 20;
  if (dueDate) {
    const days = (new Date(dueDate).getTime() - Date.now()) / 86400000;
    if (days <= 0) score += 30;
    else if (days <= 2) score += 20;
    else if (days <= 7) score += 10;
  }
  return Math.min(100, score);
}

export async function generateFollowUpDraft(
  commitment: {
    title: string;
    personName?: string | null;
    direction: string;
    dueDate?: Date | null;
  }
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const person = commitment.personName || "there";
  const due = commitment.dueDate
    ? commitment.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "soon";

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "Write a short, warm, professional follow-up message (email or Slack). 2-4 sentences. No subject line. No placeholders.",
            },
            {
              role: "user",
              content: `Write a follow-up to ${person} about: "${commitment.title}". Due: ${due}. Direction: ${commitment.direction}.`,
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const draft = data.choices?.[0]?.message?.content?.trim();
        if (draft) return draft;
      }
    } catch {
      // fallback
    }
  }

  return `Hi ${person},\n\nQuick follow-up on "${commitment.title}" — wanted to check in and see if you had everything you need from my side. Happy to jump on a quick call if helpful.\n\nBest`;
}

export async function answerQuery(
  query: string,
  commitments: Array<{
    title: string;
    personName?: string | null;
    status: string;
    dueDate?: Date | null;
    direction: string;
    description?: string | null;
  }>
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const context = commitments
    .slice(0, 50)
    .map(
      (c, i) =>
        `[${i + 1}] ${c.title} | person: ${c.personName || "unknown"} | status: ${c.status} | due: ${c.dueDate?.toISOString().slice(0, 10) || "none"} | direction: ${c.direction}`
    )
    .join("\n");

  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content:
                "You are FollowThrough, a personal commitment assistant. Answer based ONLY on the user's commitment list. Be concise, actionable, cite specific items. If nothing matches, say so and suggest what to capture.",
            },
            { role: "user", content: `Commitments:\n${context}\n\nQuestion: ${query}` },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const answer = data.choices?.[0]?.message?.content?.trim();
        if (answer) return answer;
      }
    } catch {
      // fallback
    }
  }

  const q = query.toLowerCase();
  const matches = commitments.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.personName?.toLowerCase().includes(q) ||
      q.split(" ").some((w) => w.length > 3 && c.title.toLowerCase().includes(w))
  );

  if (matches.length === 0) {
    return `I couldn't find commitments matching "${query}". Try capturing meeting notes or emails first, or search by a person's name.`;
  }

  return matches
    .slice(0, 5)
    .map(
      (c) =>
        `• ${c.title}${c.personName ? ` (with ${c.personName})` : ""}${c.dueDate ? ` — due ${c.dueDate.toLocaleDateString()}` : ""} [${c.status}]`
    )
    .join("\n");
}
