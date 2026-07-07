"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CommitmentCard, type CommitmentData } from "@/components/commitment-card";
import { Sparkle, ClipboardText } from "@phosphor-icons/react";

const SAMPLE = `Weekly sync with Marcus (Acme Corp) — March 12

- I'll send the revised pricing deck by EOD Thursday
- Marcus will loop in their CFO for budget approval
- Need to schedule demo with their eng team next week
- Follow up with Sarah on contract redlines ASAP
- Waiting on legal to review our MSA (they said by Friday)

Action items from Slack:
@me please share the case study draft with the team by Monday
I'll intro you to our partner lead — expect email tomorrow`;

export default function CapturePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState("notes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    summary: string;
    usedAI: boolean;
    commitments: CommitmentData[];
  } | null>(null);

  async function capture() {
    setError("");
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, sourceType }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Capture failed");
      return;
    }

    setResult({
      summary: data.summary,
      usedAI: data.usedAI,
      commitments: data.commitments,
    });
    setText("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold lowercase tracking-tight">capture</h1>
        <p className="text-sm text-muted mt-1">
          Paste meeting notes, emails, or Slack threads.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "notes", label: "Notes" },
          { id: "email", label: "Email" },
          { id: "slack", label: "Slack" },
          { id: "transcript", label: "Transcript" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSourceType(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs border transition-colors duration-150 ${
              sourceType === t.id
                ? "border-accent bg-accent text-background"
                : "border-border text-muted hover:text-foreground hover:border-border-strong"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your notes here..."
        rows={12}
        className="w-full rounded-md border border-border bg-background p-4 text-sm leading-relaxed outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(184,72,31,0.08)] resize-y font-mono min-h-[240px]"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={capture} disabled={loading || text.length < 20}>
          <Sparkle className="h-4 w-4" weight="fill" />
          {loading ? "Extracting..." : "Extract commitments"}
        </Button>
        <button
          onClick={() => setText(SAMPLE)}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <ClipboardText className="h-3.5 w-3.5" />
          Load sample
        </button>
        <span className="text-xs text-muted">{text.length} chars (min 20)</span>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm">{result.summary}</p>
            <p className="text-xs text-muted mt-2">
              {result.usedAI ? "Extracted with AI" : "Parsed locally · add OPENAI_API_KEY for GPT extraction"}
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-medium">
              {result.commitments.length} commitment{result.commitments.length !== 1 ? "s" : ""} added
            </h2>
            {result.commitments.map((c) => (
              <CommitmentCard key={c.id} commitment={c} onUpdate={() => router.refresh()} />
            ))}
          </div>
          <Button href="/app" variant="secondary">
            Go to dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
