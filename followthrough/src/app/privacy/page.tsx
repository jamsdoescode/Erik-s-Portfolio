import Link from "next/link";
import { Logo } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Logo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
        <h1 className="font-display text-2xl font-bold lowercase tracking-tight">
          privacy policy
        </h1>
        <p className="text-xs text-muted mt-2">Last updated: July 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">what we collect</h2>
            <p className="text-muted">
              We collect account information (name, email, password hash), the notes and captures
              you submit, and basic usage data needed to operate the product.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">how we use it</h2>
            <p className="text-muted">
              Your data powers commitment tracking, digests, and optional AI features. We do not
              sell personal information. We may use subprocessors (e.g. hosting, email delivery)
              under contractual safeguards.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">retention</h2>
            <p className="text-muted">
              We retain account data while your account is active. You may request deletion by
              contacting support; we will remove or anonymize data within a reasonable period.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">security</h2>
            <p className="text-muted">
              Passwords are hashed. Sessions use secure cookies. No system is perfectly secure —
              please use a strong, unique password.
            </p>
          </section>

          <section>
            <h2 className="font-display text-base font-semibold lowercase mb-2">contact</h2>
            <p className="text-muted">
              Questions about privacy? Email{" "}
              <a href="mailto:privacy@followthrough.app" className="text-accent underline">
                privacy@followthrough.app
              </a>
              .
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
