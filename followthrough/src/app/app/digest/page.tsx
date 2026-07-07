"use client";

import { useEffect, useState } from "react";
import { CommitmentCard, type CommitmentData } from "@/components/commitment-card";

type Digest = {
  headline: string;
  overdue: CommitmentData[];
  today: CommitmentData[];
  upcoming: CommitmentData[];
  waiting: CommitmentData[];
  totalActive: number;
};

export default function DigestPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/digest")
      .then((r) => r.json())
      .then((d) => {
        setDigest(d.digest);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div>
        <p className="text-sm text-muted">{date}</p>
        <h1 className="font-display text-xl font-bold lowercase tracking-tight mt-1">daily digest</h1>
        <p className="text-sm text-muted mt-1">
          {loading ? "Loading..." : digest?.headline}
        </p>
      </div>

      {digest && digest.totalActive === 0 && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted">
          Nothing due. Capture notes from today&apos;s meetings to stay ahead.
        </div>
      )}

      {digest && digest.overdue.length > 0 && (
        <DigestSection title="Overdue" items={digest.overdue} onUpdate={load} urgent />
      )}
      {digest && digest.today.length > 0 && (
        <DigestSection title="Due today" items={digest.today} onUpdate={load} />
      )}
      {digest && digest.upcoming.length > 0 && (
        <DigestSection title="Coming up" items={digest.upcoming} onUpdate={load} />
      )}
      {digest && digest.waiting.length > 0 && (
        <DigestSection title="Waiting on others" items={digest.waiting} onUpdate={load} />
      )}
    </div>
  );
}

function DigestSection({
  title,
  items,
  onUpdate,
  urgent,
}: {
  title: string;
  items: CommitmentData[];
  onUpdate: () => void;
  urgent?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h2 className={`text-sm font-medium ${urgent ? "text-danger" : "text-muted"}`}>{title}</h2>
      <div className="space-y-2">
        {items.map((c) => (
          <CommitmentCard key={c.id} commitment={c} onUpdate={onUpdate} />
        ))}
      </div>
    </section>
  );
}
