"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "capture after meetings",
    desc: "Paste notes while context is fresh. We extract the commitments.",
  },
  {
    title: "check your digest",
    desc: "See what is overdue, due today, and who you are waiting on.",
  },
  {
    title: "draft and send",
    desc: "Copy a follow-up into email or Slack. Mark it done.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboarded: true }),
    });
    router.push("/app/capture");
  }

  if (step < STEPS.length) {
    const current = STEPS[step];
    return (
      <div className="mx-auto max-w-md px-4 py-16 space-y-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {step + 1} / {STEPS.length}
        </p>
        <h1 className="font-display text-xl font-bold lowercase tracking-tight">{current.title}</h1>
        <p className="text-sm text-muted leading-relaxed">{current.desc}</p>
        <Button onClick={() => setStep(step + 1)}>Continue</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 space-y-6">
      <h1 className="font-display text-xl font-bold lowercase tracking-tight">ready</h1>
      <p className="text-sm text-muted">Paste your first notes to get started.</p>
      <Button onClick={finish} disabled={loading}>
        {loading ? "Setting up..." : "Open capture"}
      </Button>
    </div>
  );
}
