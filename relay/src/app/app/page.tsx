"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { formatDuration, timeSince } from "@/lib/relay";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  updatedAt: string;
  _count: { relayLogs: number };
  relayLogs: Array<{ startedAt: string; endedAt: string | null; nextStep: string | null }>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [activeLog, setActiveLog] = useState<{
    id: string;
    title: string;
    startedAt: string;
    project: { name: string; id: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/projects"), fetch("/api/auth/me")]).then(async ([pRes, uRes]) => {
      const pData = await pRes.json();
      const uData = await uRes.json();
      setProjects(pData.projects || []);
      setActiveLog(uData.user?.activeLog || null);
      setLoading(false);
    });
  }, []);

  async function resumeActive() {
    if (!activeLog?.project) return;
    router.push(`/app/project/${activeLog.project.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted mt-1">Your work contexts. Relay picks up where you left off.</p>
        </div>
        <Link href="/app/new" className="hidden md:block">
          <Button size="sm">
            <Plus size={14} className="mr-1" weight="bold" />
            New project
          </Button>
        </Link>
      </div>

      {activeLog && (
        <div className="rounded-xl border border-accent/30 bg-accent-soft/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-accent">Active session</p>
            <p className="text-sm font-medium mt-1">
              {activeLog.project?.name || "Unknown"} · {activeLog.title}
            </p>
            <p className="text-xs text-muted mt-0.5">Started {timeSince(new Date(activeLog.startedAt))}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/app/stop">
              <Button variant="secondary" size="sm">
                Stop & relay
              </Button>
            </Link>
            {activeLog.project && (
              <Button size="sm" onClick={resumeActive}>
                Open
                <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted">Loading...</p>}

      {!loading && projects.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3">
          <p className="text-sm text-muted">No projects yet. Create one for each context you switch between.</p>
          <Link href="/app/new">
            <Button size="sm">Create first project</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {projects.map((p) => {
          const last = p.relayLogs[0];
          return (
            <Link
              key={p.id}
              href={`/app/project/${p.id}`}
              className="group rounded-xl border border-border bg-surface p-4 hover:border-accent/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium group-hover:text-accent transition-colors">{p.name}</p>
                  {p.description && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{p.description}</p>
                  )}
                  <p className="text-[11px] font-mono text-muted mt-2">
                    {p._count.relayLogs} sessions
                    {last?.endedAt
                      ? ` · last ${timeSince(new Date(last.endedAt))}`
                      : last
                        ? " · session open"
                        : ""}
                  </p>
                  {last?.nextStep && (
                    <p className="text-xs text-muted mt-2 line-clamp-1">
                      Next: {last.nextStep}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
