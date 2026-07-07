"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  House,
  PlusCircle,
  Sun,
  MagnifyingGlass,
  Users,
  Gear,
  SignOut,
  Archive,
} from "@phosphor-icons/react";

const nav = [
  { href: "/app", label: "Dashboard", icon: House, mobile: true },
  { href: "/app/capture", label: "Capture", icon: PlusCircle, mobile: true },
  { href: "/app/digest", label: "Digest", icon: Sun, mobile: true },
  { href: "/app/ask", label: "Ask", icon: MagnifyingGlass, mobile: true },
  { href: "/app/people", label: "People", icon: Users, mobile: false },
  { href: "/app/archive", label: "Archive", icon: Archive, mobile: false },
  { href: "/app/settings", label: "Settings", icon: Gear, mobile: true },
];

export function AppShell({
  children,
  userName,
  trialDaysLeft,
  hasAccess,
  plan,
}: {
  children: React.ReactNode;
  userName: string;
  trialDaysLeft: number;
  hasAccess: boolean;
  plan: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const mobileNav = nav.filter((n) => n.mobile);

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-14 items-center px-5 border-b border-border">
          <Logo />
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/app" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors duration-150",
                  active
                    ? "bg-surface-2 text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface-2/60"
                )}
              >
                <Icon className="h-4 w-4" weight={active ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4 space-y-2">
          {!hasAccess && plan !== "pro" && (
            <Link
              href="/app/settings"
              className="block font-mono text-[10px] uppercase tracking-wider text-danger"
            >
              trial expired · upgrade
            </Link>
          )}
          {hasAccess && trialDaysLeft > 0 && plan !== "pro" && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
              trial ·{" "}
              <span className="text-accent font-medium">{trialDaysLeft}d left</span>
            </p>
          )}
          <p className="text-[11px] text-muted truncate">{userName}</p>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[11px] text-muted hover:text-foreground transition-colors duration-150"
          >
            <SignOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
          <Logo />
          <Button href="/app/capture" size="sm">
            Capture
          </Button>
        </header>
        {!hasAccess && plan !== "pro" && (
          <div className="bg-accent/10 border-b border-accent/20 px-4 py-2 text-center text-xs text-accent">
            Trial expired.{" "}
            <Link href="/app/settings" className="underline underline-offset-2 font-medium">
              Upgrade to Pro
            </Link>{" "}
            to capture new commitments.
          </div>
        )}
        <main className="flex-1 overflow-auto bg-background">{children}</main>
        <nav className="flex border-t border-border bg-surface lg:hidden">
          {mobileNav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/app" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors duration-150",
                  active ? "text-accent font-medium" : "text-muted"
                )}
              >
                <Icon className="h-5 w-5" weight={active ? "fill" : "regular"} />
                {label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
