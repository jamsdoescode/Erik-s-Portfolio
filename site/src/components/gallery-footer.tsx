import Link from "next/link";
import type { SiteConfig } from "@/lib/content";

type GalleryFooterProps = {
  site: SiteConfig;
};

export function GalleryFooter({ site }: GalleryFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="gallery-footer">
      <div className="gallery-footer-inner">
        <div className="grid gap-8 md:grid-cols-4 mb-10">
          <div>
            <p className="section-kicker mb-3">Studio</p>
            <p className="text-sm leading-relaxed text-muted">{site.tagline}</p>
          </div>
          <div>
            <p className="section-kicker mb-3">Explore</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-link">About</Link></li>
              <li><Link href="/projects" className="text-link">Projects</Link></li>
              <li><Link href="/blog" className="text-link">Blog</Link></li>
            </ul>
          </div>
          <div>
            <p className="section-kicker mb-3">Reading</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/reading" className="text-link">Reading list</Link></li>
            </ul>
          </div>
          <div>
            <p className="section-kicker mb-3">Connect</p>
            <ul className="space-y-2 text-sm">
              {site.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-link"
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-t border-rule pt-6">
          <div className="flex items-center gap-4">
            <div className="footer-mark">{site.name.charAt(0)}</div>
            <div>
              <p className="font-display text-2xl font-semibold">{site.name}</p>
              <p className="text-xs text-muted mt-1">© {year}</p>
            </div>
          </div>
          <Link href="/admin/login" className="text-xs text-muted hover:text-accent lg:hidden">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
