"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PLAN_PRICE } from "@/lib/relay";

const inputClass =
  "w-full max-w-sm rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent/50";

export default function SettingsPage() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    plan: string;
    trialDaysLeft: number;
    timezone: string;
  } | null>(null);
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setName(d.user.name);
        }
      });
  }, []);

  async function save() {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-1">Account and billing.</p>
      </div>

      <section className="space-y-4 pb-8 border-b border-border">
        <h2 className="text-sm font-medium">Profile</h2>
        <div>
          <label className="block text-xs font-medium mb-1.5">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <p className="text-xs text-muted">Email: {user.email}</p>
        <Button size="sm" variant="secondary" onClick={save}>
          {saved ? "Saved" : "Save"}
        </Button>
      </section>

      <section className="space-y-3 pb-8 border-b border-border">
        <h2 className="text-sm font-medium">Subscription</h2>
        {user.plan === "pro" ? (
          <p className="text-sm text-muted">Pro active · ${PLAN_PRICE}/month</p>
        ) : (
          <>
            <p className="text-sm text-muted">
              Trial · <span className="text-foreground font-medium">{user.trialDaysLeft} days left</span>
            </p>
            <p className="text-xs text-muted">
              Pro is ${PLAN_PRICE}/mo — unlimited projects, AI briefs, session history.
            </p>
          </>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">AI</h2>
        <p className="text-xs text-muted max-w-md">
          Set <code className="font-mono">OPENAI_API_KEY</code> in <code className="font-mono">.env</code>{" "}
          for smarter briefs and stop-note parsing. Heuristic mode works without it.
        </p>
      </section>
    </div>
  );
}
