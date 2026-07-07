"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "What did I promise Sarah?",
  "What's overdue?",
  "Who am I waiting on?",
];

export default function AskPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      ask(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function ask(q?: string) {
    const text = q || query;
    if (text.length < 3) return;
    setLoading(true);
    setAnswer("");

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text }),
    });
    const data = await res.json();
    setAnswer(data.answer || data.error || "No answer");
    setLoading(false);
    if (q) setQuery(q);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold lowercase tracking-tight">ask</h1>
        <p className="text-sm text-muted mt-1">Search your commitments in plain language.</p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="What did I promise Marcus?"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(184,72,31,0.08)]"
          />
          <Button onClick={() => ask()} disabled={loading || query.length < 3}>
            Ask
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-lg border border-border px-3 py-1 text-xs text-muted hover:text-foreground hover:border-border-strong transition-colors duration-150"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {(loading || answer) && (
        <div className="rounded-lg border border-border bg-surface p-4">
          {loading ? (
            <p className="text-sm text-muted">Searching...</p>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
          )}
        </div>
      )}
    </div>
  );
}
