import { Logo } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-lg items-center px-5">
          <Logo />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold lowercase tracking-tight">
              create account
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted mt-2">
              14 days free · no card
            </p>
          </div>
          <AuthForm mode="register" />
          <p className="text-center text-xs text-muted leading-relaxed">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-accent underline underline-offset-2">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-accent underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
          <p className="text-center text-xs text-muted">
            <Link href="/" className="text-foreground underline underline-offset-2">
              back home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
