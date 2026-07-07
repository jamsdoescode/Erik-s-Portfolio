import Link from "next/link";
import { Button, Logo, StampCheck } from "@/components/ui/button";
import { PLAN_PRICE } from "@/lib/commitments";
import { AppPreview } from "@/components/landing/app-preview";

const STEPS = [
  {
    n: "01",
    title: "capture",
    body: "Drop meeting notes, threads, or transcripts. No manual entry.",
  },
  {
    n: "02",
    title: "prioritize",
    body: "Overdue, due today, waiting on — sorted by what costs you.",
  },
  {
    n: "03",
    title: "follow up",
    body: "Draft a reply, copy to email or Slack, mark it done.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Logo />
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-[13px] text-muted hover:text-foreground transition-colors duration-150"
            >
              sign in
            </Link>
            <Button href="/signup" size="sm">
              try free
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:pt-14">
          <div className="max-w-lg">
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.03em] lowercase">
              track every promise you make at work
            </h1>
            <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-muted">
              Paste notes from a meeting or email. We pull out who owes what, when
              it&apos;s due, and what to send next.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/signup" size="lg">
                start free trial
              </Button>
              <Button href="/login" variant="secondary" size="lg">
                view demo
              </Button>
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted">
              14 days free · ${PLAN_PRICE}/mo after
            </p>
          </div>

          <div className="w-full max-w-md lg:justify-self-end">
            <AppPreview />
          </div>
        </section>

        <section className="border-t border-dashed border-border-strong">
          <div className="mx-auto max-w-6xl divide-y divide-border px-5">
            {STEPS.map((step) => (
              <div key={step.n} className="flex gap-5 py-7 sm:gap-8 sm:py-8">
                <StampCheck className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                      {step.n}
                    </span>
                    <h2 className="font-display text-lg font-bold lowercase tracking-tight">
                      {step.title}
                    </h2>
                  </div>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted">
              cancel anytime
            </p>
          </div>
          <Button href="/signup">get started</Button>
        </div>
      </footer>
    </div>
  );
}
