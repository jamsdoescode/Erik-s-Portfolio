import { Logo } from "@/components/ui/button";
import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function LoginPage() {
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
            <h1 className="font-display text-2xl font-bold lowercase tracking-tight">sign in</h1>
            <p className="text-sm text-muted mt-1">Access your commitments</p>
          </div>
          <AuthForm mode="login" />
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
