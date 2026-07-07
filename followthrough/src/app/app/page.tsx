"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CommitmentCard, type CommitmentData } from "@/components/commitment-card";
import { Button } from "@/components/ui/button";
import { computePriorityScore, bucketCommitment } from "@/lib/commitments";
import { PlusCircle } from "@phosphor-icons/react";

export default function DashboardPage() {
  const [commitments, setCommitments] = useState<CommitmentData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/commitments?status=active");
    const data = await res.json();
    setCommitments(data.commitments || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = [...commitments]
    .map((c) => ({
      ...c,
      score: computePriorityScore({
        ...c,
        dueDate: c.dueDate ? new Date(c.dueDate) : null,
        createdAt: new Date(),
      }),
      bucket: bucketCommitment({
        ...c,
        dueDate: c.dueDate ? new Date(c.dueDate) : null,
        createdAt: new Date(),
      }),
    }))
    .sort((a, b) => b.score - a.score);

  const overdue = sorted.filter((c) => c.bucket === "overdue");
  const today = sorted.filter((c) => c.bucket === "today");
  const upcoming = sorted.filter((c) => c.bucket === "upcoming");
  const waiting = sorted.filter((c) => c.bucket === "waiting");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold lowercase tracking-tight">dashboard</h1>
          <p className="text-sm text-muted mt-1">
            {loading ? "Loading..." : `${commitments.length} active commitments`}
          </p>
        </div>
        <Button href="/app/capture" size="sm">
          <PlusCircle className="h-4 w-4" weight="bold" />
          Capture
        </Button>
      </div>

      {!loading && commitments.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-muted text-sm mb-4">No commitments yet. Paste your first meeting notes.</p>
          <Button href="/app/capture">Capture notes</Button>
        </div>
      )}

      {overdue.length > 0 && (
        <Section title="Overdue" count={overdue.length} urgent>
          {overdue.map((c) => (
            <CommitmentCard key={c.id} commitment={c} onUpdate={load} />
          ))}
        </Section>
      )}

      {today.length > 0 && (
        <Section title="Due today" count={today.length}>
          {today.map((c) => (
            <CommitmentCard key={c.id} commitment={c} onUpdate={load} />
          ))}
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section title="Upcoming" count={upcoming.length}>
          {upcoming.map((c) => (
            <CommitmentCard key={c.id} commitment={c} onUpdate={load} />
          ))}
        </Section>
      )}

      {waiting.length > 0 && (
        <Section title="Waiting on others" count={waiting.length}>
          {waiting.map((c) => (
            <CommitmentCard key={c.id} commitment={c} onUpdate={load} />
          ))}
        </Section>
      )}

      <div className="border-t border-border pt-6 text-sm text-muted">
        <p>
          Capture notes right after meetings.{" "}
          <Link href="/app/digest" className="text-foreground underline underline-offset-2">
            Open daily digest
          </Link>
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  urgent,
  children,
}: {
  title: string;
  count: number;
  urgent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className={`text-sm font-medium flex items-center gap-2 ${urgent ? "text-danger" : "text-muted"}`}>
        {title}
        <span className="text-xs tabular-nums text-muted">({count})</span>
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
