"use client";

import { useEffect, useState, useCallback } from "react";
import { CommitmentCard, type CommitmentData } from "@/components/commitment-card";

export default function ArchivePage() {
  const [done, setDone] = useState<CommitmentData[]>([]);
  const [archived, setArchived] = useState<CommitmentData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [doneRes, archRes] = await Promise.all([
      fetch("/api/commitments?status=done"),
      fetch("/api/commitments?status=archived"),
    ]);
    const doneData = await doneRes.json();
    const archData = await archRes.json();
    setDone(doneData.commitments || []);
    setArchived(archData.commitments || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function restore(id: string) {
    await fetch(`/api/commitments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div>
        <h1 className="font-display text-xl font-bold lowercase tracking-tight">archive</h1>
        <p className="text-sm text-muted mt-1">Completed and archived commitments.</p>
      </div>

      {loading && <p className="text-sm text-muted">Loading...</p>}

      {!loading && done.length === 0 && archived.length === 0 && (
        <p className="text-sm text-muted">Nothing archived yet.</p>
      )}

      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">Completed ({done.length})</h2>
          {done.map((c) => (
            <CommitmentCard key={c.id} commitment={c} onUpdate={load} />
          ))}
        </section>
      )}

      {archived.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">Archived ({archived.length})</h2>
          {archived.map((c) => (
            <div key={c.id} className="border-b border-border py-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">{c.title}</p>
                {c.personName && (
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted mt-1">
                    {c.personName}
                  </p>
                )}
              </div>
              <button
                onClick={() => restore(c.id)}
                className="text-xs text-accent underline underline-offset-2 shrink-0"
              >
                Restore
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
