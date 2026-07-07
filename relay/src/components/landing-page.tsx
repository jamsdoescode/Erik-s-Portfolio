"use client";

import Link from "next/link";
import { ArrowRight, Clock, Brain, Lightning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
        <span className="font-semibold text-lg tracking-tight">relay</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-foreground">
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm">Start free trial</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">
              Context reload for deep work
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-[1.05]">
              Pick up exactly where you left off.
            </h1>
            <p className="text-base text-muted leading-relaxed max-w-[55ch]">
              Context switching costs 23 minutes per jump. Relay logs your stopping point and
              generates a 30-second briefing when you return — so you stop re-reading old notes
              and start doing the work.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button>
                  Try Relay free
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary">Sign in</Button>
              </Link>
            </div>
            <p className="text-xs text-muted">14-day trial · $14.99/mo after · No credit card</p>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-stone-900/5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-muted">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Relay brief · Auth refactor
              </div>
              <p className="text-sm font-medium">Last touched 2 days ago</p>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex gap-2">
                  <span className="text-accent">→</span>
                  OAuth callback is wired; refresh token rotation still broken in staging
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">→</span>
                  Next: fix token expiry edge case in middleware
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">→</span>
                  Blocker: waiting on infra for new secrets store
                </li>
              </ul>
              <Button className="w-full" size="sm">
                Resume session
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightning,
                title: "Stop & relay",
                body: "When you switch tasks, log what you did, what's next, and what's blocking you. Takes 15 seconds.",
              },
              {
                icon: Brain,
                title: "AI context brief",
                body: "Return to any project and get a synthesized briefing from your last sessions — not a wall of notes.",
              },
              {
                icon: Clock,
                title: "Track focus time",
                body: "See how long you actually spent in each context. Know where your weeks go.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
                  <Icon size={22} weight="duotone" />
                </div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 text-center space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Built for people who juggle 5 things at once</h2>
          <p className="text-muted text-sm max-w-lg mx-auto">
            Engineers, founders, designers, PMs — anyone who drops a thread for three days and
            dreads reopening it.
          </p>
          <Link href="/signup">
            <Button>Start your trial</Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted">
        Relay · $14.99/mo · Made for context switchers
      </footer>
    </div>
  );
}
