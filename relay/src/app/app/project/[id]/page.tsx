"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, Stop, ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { formatDuration, timeSince } from "@/lib/relay";

type Brief = {
  headline: string;
  body: string;
  bullets: string[];
  usedAI: boolean;
};

type Log = {
  id: string;
  title: string;
  accomplished: string | null;
  nextStep: string | null;
  blockers: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSec: number | null;
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#059669");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    const [pRes, bRes, uRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/relay/brief?projectId=${id}`),
      fetch("/api/auth/me"),
    ]);
    const pData = await pRes.json();
    const bData = await bRes.json();
    const uData = await uRes.json();

    if (pData.project) {
      setName(pData.project.name);
      setColor(pData.project.color);
      setLogs(pData.project.relayLogs || []);
    }
    setBrief(bData.brief || null);
    setActiveLogId(uData.user?.activeLog?.id || null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function startSession() {
    setStarting(true);
    const res = await fetch("/api/relay/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id }),
    });
    const data = await res.json();
    setStarting(false);
    if (res.ok) {
      setActiveLogId(data.log.id);
    }
  }

  const isActiveHere = logs.some((l) => l.id === activeLogId && !l.endedAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/app" className="text-muted hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <h1 className="text-xl font-semibold tracking-tight">{name || "Project"}</h1>
      </div>

      {loading && <p className="text-sm text-muted">Loading brief...</p>}

      {brief && (
        <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-mono uppercase tracking-wider text-accent">Relay brief</p>
            {brief.usedAI && (
              <span className="text-[10px] font-mono text-muted">AI synthesized</span>
            )}
          </div>
          <h2 className="text-lg font-medium">{brief.headline}</h2>
          <ul className="space-y-2">
            {brief.bullets.map((b, i) => (
              <li key={i} className="text-sm text-muted flex gap-2">
                <span className="text-accent shrink-0">→</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            {isActiveHere ? (
              <Link href="/app/stop">
                <Button variant="secondary">
                  <Stop size={16} className="mr-1.5" weight="fill" />
                  Stop & relay
                </Button>
              </Link>
            ) : (
              <Button onClick={startSession} disabled={starting}>
                <Play size={16} className="mr-1.5" weight="fill" />
                {starting ? "Starting..." : "Resume session"}
              </Button>
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted">Session history</h3>
        {logs.length === 0 && (
          <p className="text-sm text-muted">No sessions yet. Start one to build your context trail.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="border-b border-border py-4 space-y-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{log.title}</p>
              <span className="text-[11px] font-mono text-muted shrink-0">
                {log.endedAt
                  ? formatDuration(log.durationSec)
                  : "active"}
              </span>
            </div>
            <p className="text-xs text-muted">
              {timeSince(new Date(log.endedAt || log.startedAt))}
            </p>
            {log.accomplished && (
              <p className="text-sm text-muted">
                <span className="text-foreground">Did:</span> {log.accomplished}
              </p>
            )}
            {log.nextStep && (
              <p className="text-sm text-muted">
                <span className="text-foreground">Next:</span> {log.nextStep}
              </p>
            )}
            {log.blockers && (
              <p className="text-sm text-muted">
                <span className="text-foreground">Blockers:</span> {log.blockers}
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
