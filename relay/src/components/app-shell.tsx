"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Lightning,
  Gear,
  SignOut,
  Plus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/app", label: "Projects", icon: SquaresFour },
  { href: "/app/stop", label: "Stop", icon: Lightning },
  { href: "/app/settings", label: "Settings", icon: Gear },
];

export function AppShell({
  children,
  userName,
  hasAccess,
  trialDaysLeft,
}: {
  children: React.ReactNode;
  userName: string;
  hasAccess: boolean;
  trialDaysLeft: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {!hasAccess && (
        <div className="bg-stone-900 text-stone-100 text-center text-xs py-2 px-4">
          Trial expired.{" "}
          <Link href="/app/settings" className="underline underline-offset-2 text-emerald-300">
            Upgrade to Pro
          </Link>{" "}
          to keep relaying context.
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/app" className="font-semibold tracking-tight text-foreground">
            relay
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  pathname === href || (href !== "/app" && pathname.startsWith(href))
                    ? "bg-accent-soft text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-stone-50"
                )}
              >
                <Icon size={16} weight="duotone" />
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!hasAccess ? null : trialDaysLeft > 0 && trialDaysLeft <= 14 ? (
              <span className="hidden sm:inline text-[11px] text-muted font-mono">
                trial · {trialDaysLeft}d
              </span>
            ) : null}
            <span className="hidden sm:inline text-xs text-muted">{userName}</span>
            <Button variant="ghost" size="sm" onClick={logout} aria-label="Sign out">
              <SignOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-border bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 h-14">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px]",
                pathname === href || (href !== "/app" && pathname.startsWith(href))
                  ? "text-accent"
                  : "text-muted"
              )}
            >
              <Icon size={18} weight="duotone" />
              {label}
            </Link>
          ))}
          <Link
            href="/app/new"
            className="flex flex-col items-center justify-center gap-0.5 text-[10px] text-accent"
          >
            <Plus size={18} weight="bold" />
            New
          </Link>
        </div>
      </nav>
      <div className="h-14 md:hidden" />
    </div>
  );
}
