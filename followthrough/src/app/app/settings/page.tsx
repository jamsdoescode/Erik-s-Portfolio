"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PLAN_PRICE } from "@/lib/commitments";

const inputClass =
  "w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(184,72,31,0.08)]";

function SettingsContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    plan: string;
    trialDaysLeft: number;
    hasAccess: boolean;
    stripeConfigured: boolean;
    hasStripeCustomer: boolean;
    timezone: string;
    digestEnabled: boolean;
    digestHour: number;
  } | null>(null);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestHour, setDigestHour] = useState(8);
  const [saved, setSaved] = useState(false);
  const [digestSaved, setDigestSaved] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [managing, setManaging] = useState(false);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);

  async function loadUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setName(data.user.name);
      setTimezone(data.user.timezone || "America/Los_Angeles");
      setDigestEnabled(data.user.digestEnabled ?? true);
      setDigestHour(data.user.digestHour ?? 8);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (searchParams.get("upgraded") === "1") {
      setBillingMessage("Welcome to Pro! Your subscription is active.");
      loadUser();
    } else if (searchParams.get("upgraded") === "demo") {
      setBillingMessage("Demo upgrade applied — Pro is active.");
      loadUser();
    } else if (searchParams.get("cancelled") === "1") {
      setBillingMessage("Checkout cancelled. No charges were made.");
    }
  }, [searchParams]);

  async function saveProfile() {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function saveDigest() {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone, digestEnabled, digestHour }),
    });
    setDigestSaved(true);
    setTimeout(() => setDigestSaved(false), 2000);
  }

  async function upgrade(demoMode = false) {
    setUpgrading(true);
    setBillingError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoMode }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.demoAvailable) {
          setBillingError(data.error);
        } else {
          setBillingError(data.error || "Checkout failed");
        }
        return;
      }

      if (data.demo) {
        setBillingMessage("Demo upgrade applied — Pro is active.");
        await loadUser();
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setUpgrading(false);
    }
  }

  async function manageSubscription() {
    setManaging(true);
    setBillingError(null);

    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setBillingError(data.error || "Could not open billing portal");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setManaging(false);
    }
  }

  if (!user) return null;

  const showDemoFallback = !user.stripeConfigured;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div>
        <h1 className="font-display text-xl font-bold lowercase tracking-tight">settings</h1>
        <p className="text-sm text-muted mt-1">Account and billing.</p>
      </div>

      <section className="space-y-4 pb-8 border-b border-border">
        <h2 className="text-sm font-medium">Profile</h2>
        <div>
          <label className="block text-xs font-medium mb-1.5">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <p className="text-xs text-muted">Email: {user.email}</p>
        <Button size="sm" variant="secondary" onClick={saveProfile}>
          {saved ? "Saved" : "Save"}
        </Button>
      </section>

      <section className="space-y-4 pb-8 border-b border-border">
        <h2 className="text-sm font-medium">Daily digest email</h2>
        <p className="text-xs text-muted max-w-md">
          Get a morning summary of overdue items, today&apos;s commitments, and what you&apos;re
          waiting on.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={digestEnabled}
            onChange={(e) => setDigestEnabled(e.target.checked)}
            className="rounded border-border"
          />
          Send daily digest
        </label>
        <div>
          <label className="block text-xs font-medium mb-1.5">Delivery hour (local)</label>
          <select
            value={digestHour}
            onChange={(e) => setDigestHour(Number(e.target.value))}
            className={inputClass}
            disabled={!digestEnabled}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Timezone</label>
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={inputClass}
            placeholder="America/Los_Angeles"
          />
        </div>
        <Button size="sm" variant="secondary" onClick={saveDigest}>
          {digestSaved ? "Saved" : "Save digest settings"}
        </Button>
      </section>

      <section className="space-y-4 pb-8 border-b border-border">
        <h2 className="text-sm font-medium">Subscription</h2>

        {billingMessage && <p className="text-sm text-accent">{billingMessage}</p>}
        {billingError && <p className="text-sm text-red-600">{billingError}</p>}

        {user.plan === "pro" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">Pro active · ${PLAN_PRICE}/month</p>
            {user.hasStripeCustomer && (
              <Button variant="secondary" onClick={manageSubscription} disabled={managing}>
                {managing ? "Opening..." : "Manage subscription"}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Trial ·{" "}
              <span className="text-foreground font-medium">{user.trialDaysLeft} days left</span>
            </p>
            <Button onClick={() => upgrade(false)} disabled={upgrading}>
              {upgrading ? "Processing..." : `Upgrade · $${PLAN_PRICE}/mo`}
            </Button>
            {showDemoFallback && (
              <>
                <p className="text-[11px] text-muted">
                  Stripe is not configured. Use demo mode for local testing.
                </p>
                <Button variant="secondary" onClick={() => upgrade(true)} disabled={upgrading}>
                  Demo upgrade (no payment)
                </Button>
              </>
            )}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">AI</h2>
        <p className="text-xs text-muted leading-relaxed max-w-md">
          Set <code className="font-mono text-foreground">OPENAI_API_KEY</code> in{" "}
          <code className="font-mono">.env</code> for GPT extraction and drafts. Heuristic parsing
          works without it.
        </p>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
