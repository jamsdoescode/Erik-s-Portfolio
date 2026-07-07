"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatDueLabel, directionLabel, computePriorityScore } from "@/lib/commitments";
import { Check, Copy, DotsThree, PaperPlaneTilt } from "@phosphor-icons/react";

export type CommitmentData = {
  id: string;
  title: string;
  description?: string | null;
  personName?: string | null;
  direction: string;
  dueDate?: string | null;
  priority: number;
  status: string;
  followUpDraft?: string | null;
};

export function CommitmentCard({
  commitment,
  onUpdate,
}: {
  commitment: CommitmentData;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showDraft, setShowDraft] = useState(false);
  const [draft, setDraft] = useState(commitment.followUpDraft || "");
  const [menuOpen, setMenuOpen] = useState(false);

  const dueDate = commitment.dueDate ? new Date(commitment.dueDate) : null;
  const score = computePriorityScore({ ...commitment, dueDate, createdAt: new Date() });

  async function patch(data: Record<string, unknown>) {
    setLoading("patch");
    await fetch(`/api/commitments/${commitment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(null);
    onUpdate();
  }

  async function generateDraft() {
    setLoading("draft");
    const res = await fetch(`/api/commitments/${commitment.id}`, { method: "POST" });
    const data = await res.json();
    setDraft(data.draft || "");
    setShowDraft(true);
    setLoading(null);
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft);
  }

  if (commitment.status === "done") {
    return (
      <div className="border-b border-dashed border-border py-3 opacity-50">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 text-success shrink-0" weight="bold" />
          <p className="text-sm line-through text-muted">{commitment.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group border-b border-border py-3 last:border-b-0 transition-colors duration-150",
        score >= 80 && "bg-accent/5 -mx-4 px-4 rounded-md"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => patch({ status: "done" })}
          disabled={!!loading}
          className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border border-border-strong hover:border-accent hover:bg-accent/10 transition-colors duration-150 active:scale-95"
          aria-label="Mark complete"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug">{commitment.title}</p>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded p-1 text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                <DotsThree weight="bold" className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-6 z-10 w-36 rounded-md border border-border bg-background py-1 shadow-[0_4px_16px_rgba(28,25,23,0.1)]">
                  <button
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-surface"
                    onClick={() => {
                      patch({ snoozedUntil: new Date(Date.now() + 86400000).toISOString() });
                      setMenuOpen(false);
                    }}
                  >
                    Snooze 1 day
                  </button>
                  <button
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-surface text-accent"
                    onClick={() => {
                      patch({ status: "archived" });
                      setMenuOpen(false);
                    }}
                  >
                    Archive
                  </button>
                </div>
              )}
            </div>
          </div>

          {commitment.description && (
            <p className="text-xs text-muted leading-relaxed">{commitment.description}</p>
          )}

          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {formatDueLabel(dueDate).toUpperCase()}
            {" · "}
            {directionLabel(commitment.direction).toUpperCase()}
            {commitment.personName && ` · ${commitment.personName.toUpperCase()}`}
          </p>

          <button
            onClick={generateDraft}
            disabled={loading === "draft"}
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-150"
          >
            <PaperPlaneTilt className="h-3 w-3" />
            {loading === "draft" ? "Drafting..." : "Draft follow-up"}
          </button>

          {showDraft && draft && (
            <div className="rounded-md border border-dashed border-border bg-surface p-3">
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{draft}</p>
              <button
                onClick={copyDraft}
                className="mt-2 inline-flex items-center gap-1 text-xs text-accent underline underline-offset-2"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
