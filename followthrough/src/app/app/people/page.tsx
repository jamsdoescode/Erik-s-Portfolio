"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { groupByPerson } from "@/lib/commitments";
import type { CommitmentData } from "@/components/commitment-card";

export default function PeoplePage() {
  const [people, setPeople] = useState<
    Array<{ name: string; count: number; iOwe: number; theyOwe: number; topPriority: number }>
  >([]);

  useEffect(() => {
    fetch("/api/commitments?status=active")
      .then((r) => r.json())
      .then((d) => {
        const grouped = groupByPerson(
          (d.commitments || []).map((c: CommitmentData) => ({
            ...c,
            dueDate: c.dueDate ? new Date(c.dueDate) : null,
            createdAt: new Date(),
          }))
        );
        setPeople(grouped);
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold lowercase tracking-tight">people</h1>
        <p className="text-sm text-muted mt-1">Commitments grouped by person.</p>
      </div>

      {people.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          Capture notes with names to see relationships here.
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {people.map((p) => (
            <Link
              key={p.name}
              href={`/app/ask?q=${encodeURIComponent(p.name)}`}
              className="flex items-center justify-between px-4 py-3 bg-background hover:bg-surface transition-colors duration-150"
            >
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {p.count} active · {p.iOwe} you owe · {p.theyOwe} waiting
                </p>
              </div>
              <span className="text-xs text-muted">View</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
