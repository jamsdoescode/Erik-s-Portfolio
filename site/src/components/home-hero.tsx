import Link from "next/link";
import type { Post, Project, SiteConfig } from "@/lib/content";
import { formatDate } from "@/lib/content";
import { SitePhoto } from "@/components/site-photo";
import { SocialLinks } from "@/components/social-links";

type HomeHeroProps = {
  site: SiteConfig;
  latestPost?: Post;
  projects: Project[];
};

export function HomeHero({ site, latestPost, projects }: HomeHeroProps) {
  const copy = site.pageCopy;

  return (
    <div className="home-stack">
      <section className="home-intro">
        <div className="home-intro-copy">
          <p className="eyebrow">{copy.home.eyebrow}</p>
          <h1 className="display-title">{copy.home.headline}</h1>
          <p className="body-lead">{copy.home.lead}</p>

          {site.now.length > 0 && (
            <div className="now-panel">
              <p className="now-label">{copy.home.now}</p>
              <ul className="now-list">
                {site.now.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="home-intro-aside">
          <SitePhoto src={site.photo} alt={copy.home.headline} variant="rounded" />
          <SocialLinks links={site.links} />
        </aside>
      </section>

      {latestPost && (
        <section className="home-section">
          <div className="section-row">
            <h2 className="section-title">{copy.home.latestWriting}</h2>
            <Link href="/blog" className="section-action">
              {copy.home.allPosts}
            </Link>
          </div>
          <article className="preview-card">
            <p className="doc-meta">{formatDate(latestPost.date)}</p>
            <Link href={`/blog/${latestPost.slug}`} className="preview-card-title">
              {latestPost.title}
            </Link>
            <p className="preview-card-copy">{latestPost.description}</p>
          </article>
        </section>
      )}

      {projects.length > 0 && (
        <section className="home-section">
          <div className="section-row">
            <h2 className="section-title">{copy.home.projects}</h2>
            <Link href="/projects" className="section-action">
              {copy.home.viewProjects}
            </Link>
          </div>
          <div className="preview-grid">
            {projects.map((project) => (
              <Link key={project.slug} href={`/projects/${project.slug}`} className="preview-tile">
                <p className="doc-meta">{project.year}</p>
                <h3 className="preview-tile-title">{project.title}</h3>
                <p className="preview-tile-copy">{project.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
