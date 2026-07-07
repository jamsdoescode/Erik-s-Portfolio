import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SiteConfig } from "@/lib/content";
import { GalleryFooter } from "@/components/gallery-footer";
import { EventStrip } from "@/components/event-strip";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/reading", label: "Reading" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

type GalleryShellProps = {
  site: SiteConfig;
  currentPath?: string;
  narrow?: boolean;
  showEventStrip?: boolean;
  children: React.ReactNode;
};

export function GalleryShell({
  site,
  currentPath = "/",
  narrow = false,
  showEventStrip = true,
  children,
}: GalleryShellProps) {
  return (
    <div className="gallery-shell bg-wall">
      <aside className="gallery-sidebar">
        <Link href="/" className="font-display text-[1.75rem] leading-none font-semibold tracking-tight text-ink">
          {site.name.toLowerCase()}
        </Link>
        <nav className="mt-8 flex lg:flex-col gap-4 lg:gap-3 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors duration-150",
                currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                  ? "text-ink font-medium"
                  : "text-muted hover:text-accent",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block mt-auto pt-10">
          <Link href="/admin/login" className="text-xs text-muted hover:text-accent transition-colors duration-150">
            Admin
          </Link>
        </div>
      </aside>

      <div className="gallery-main">
        {showEventStrip && <EventStrip items={site.now} />}
        <div className={cn("gallery-content", narrow && "gallery-content-narrow")}>{children}</div>
        <GalleryFooter site={site} />
      </div>
    </div>
  );
}
