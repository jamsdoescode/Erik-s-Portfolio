import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/lib/content";
import { SiteHeader } from "@/components/site-header";

type SiteShellProps = {
  site: SiteConfig;
  currentPath?: string;
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
};

export function SiteShell({
  site,
  currentPath = "/",
  children,
  className,
  narrow = false,
}: SiteShellProps) {
  return (
    <div className="site-frame">
      <SiteHeader currentPath={currentPath} nav={site.pageCopy.nav} />
      <main className={cn("site-main", narrow && "site-main-narrow", className)}>{children}</main>
      <SiteFooter copyrightName={site.pageCopy.footer.copyrightName} adminLabel={site.pageCopy.footer.adminLink} />
    </div>
  );
}

function SiteFooter({ copyrightName, adminLabel }: { copyrightName: string; adminLabel: string }) {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer-inner">
        <p className="site-footer-copy">
          {copyrightName} · {new Date().getFullYear()}
        </p>
        <Link href="/admin/login" className="site-footer-link">
          {adminLabel}
        </Link>
      </div>
    </footer>
  );
}
