import Link from "next/link";
import { Logo } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Logo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
        <h1 className="font-display text-2xl font-bold lowercase tracking-tight">
          terms of service
        </h1>
        <p className="text-xs text-muted mt-2">Last updated: July 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">the basics</h2>
            <p className="text-muted">
              FollowThrough helps you track commitments from meetings and notes. By creating an
              account, you agree to use the service responsibly and in compliance with applicable
              laws.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">your account</h2>
            <p className="text-muted">
              You are responsible for keeping your login credentials secure and for activity under
              your account. Notify us if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">your content</h2>
            <p className="text-muted">
              You retain ownership of the text and data you submit. You grant FollowThrough a
              limited license to process that content solely to provide the service — including AI
              extraction of commitments when enabled.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">
              trials and billing
            </h2>
            <p className="text-muted">
              Free trials may convert to paid plans according to pricing shown at signup. We may
              change pricing with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">disclaimer</h2>
            <p className="text-muted">
              FollowThrough is provided &quot;as is&quot; without warranties. We are not liable for
              indirect or consequential damages arising from use of the service.
            </p>
          </section>
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          <Link href="/signup" className="text-accent underline underline-offset-2">
            back to signup
          </Link>
        </p>
      </main>
    </div>
  );
}
