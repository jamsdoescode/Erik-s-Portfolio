import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { SitePhoto } from "@/components/site-photo";
import { getSiteConfig } from "@/lib/content";
import "./about-v2.css";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage() {
  const site = await getSiteConfig();
  const copy = site.pageCopy;
  const paragraphs = copy.about.bioExtended.split("\n\n").filter(Boolean);

  return (
    <SiteShell site={site} currentPath="/about">
      {/* Rollback: delete about-v2.css import + this file's v2 markup; restore prior about/page.tsx from git */}
      <div className="about-v2">
        <header className="about-v2-hero">
          <SitePhoto
            src={site.aboutPhoto}
            alt={copy.about.sidebarName}
            variant="circle"
            className="about-v2-photo"
          />
          <div className="about-v2-hero-copy">
            <p className="about-v2-eyebrow">{copy.about.title}</p>
            <h1 className="about-v2-name">{copy.about.sidebarName}</h1>
            <p className="about-v2-intro">{copy.about.intro}</p>
            <p className="about-v2-lead">{copy.about.bio}</p>
          </div>
        </header>

        {paragraphs.length > 0 && (
          <section className="about-v2-body" aria-label="Bio">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </section>
        )}

        <nav className="about-v2-links" aria-label="Links">
          {site.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="about-v2-link"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
          <Link href="/blog" className="about-v2-link">
            {copy.about.blogLink}
          </Link>
        </nav>
      </div>
    </SiteShell>
  );
}
