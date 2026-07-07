"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)] min-h-[140px] resize-y";

export default function StopPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [activeLog, setActiveLog] = useState<{
    id: string;
    title: string;
    project: { name: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setActiveLog(d.user?.activeLog || null);
        setLoading(false);
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/relay/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, logId: activeLog?.id }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to save relay");
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Stop & relay</h1>
        <p className="text-sm text-muted mt-1">
          Log where you left off so future-you can reload context in seconds.
        </p>
      </div>

      {loading && <p className="text-sm text-muted">Loading...</p>}

      {!loading && !activeLog && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted">No active session. Open a project and resume first.</p>
          <Button variant="secondary" size="sm" onClick={() => router.push("/app")}>
            Back to projects
          </Button>
        </div>
      )}

      {activeLog && (
        <div className="rounded-lg bg-accent-soft/50 border border-accent/20 px-3 py-2 text-sm">
          Ending session on <strong>{activeLog.project?.name || "project"}</strong>
        </div>
      )}

      {activeLog && (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5">
              What did you do? What&apos;s next? Any blockers?
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              minLength={3}
              className={inputClass}
              placeholder="Fixed OAuth callback bug. Next: handle token expiry in middleware. Blocked on infra for secrets store."
            />
            <p className="text-[11px] text-muted mt-1.5">
              AI will structure this into accomplished / next / blockers. Works without OpenAI too.
            </p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving relay..." : "Save & switch context"}
          </Button>
        </form>
      )}
    </div>
  );
}
