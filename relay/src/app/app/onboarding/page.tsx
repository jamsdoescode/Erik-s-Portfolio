"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const PRESETS = [
  { name: "Main product", color: "#059669" },
  { name: "Side project", color: "#0284c7" },
  { name: "Client work", color: "#d97706" },
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

    for (const preset of PRESETS.slice(0, 2)) {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
    }

    setLoading(false);
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 space-y-8">
      {step === 0 && (
        <>
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Welcome</p>
            <h1 className="text-2xl font-semibold tracking-tight">Stop losing context between tasks</h1>
            <p className="text-sm text-muted leading-relaxed">
              Relay is for people who juggle multiple projects. When you switch away, log a 15-second
              stop note. When you return, get a briefing that reloads your brain.
            </p>
          </div>
          <Button onClick={() => setStep(1)}>Continue</Button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="space-y-3">
            <h2 className="text-lg font-medium">How it works</h2>
            <ol className="space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="font-mono text-accent">1</span>
                Create a project for each context you switch between
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">2</span>
                Resume a session when you start working
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">3</span>
                Stop & relay when you context-switch — what you did, what&apos;s next
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-accent">4</span>
                Return anytime for an AI context brief
              </li>
            </ol>
          </div>
          <Button onClick={finish} disabled={loading}>
            {loading ? "Setting up..." : "Create starter projects"}
          </Button>
        </>
      )}
    </div>
  );
}
