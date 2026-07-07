import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getProjects, getSiteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const [site, projects] = await Promise.all([getSiteConfig(), getProjects()]);

  return (
    <SiteShell site={site} currentPath="/projects">
      <h1 className="page-heading">{site.pageCopy.projects.title}</h1>
      <p className="page-intro">{site.pageCopy.projects.intro}</p>
      <div className="project-grid">
        {projects.map((project) => (
          <Link key={project.slug} href={`/projects/${project.slug}`} className="project-card">
            <p className="doc-meta">{project.year}</p>
            <h2 className="project-card-title">{project.title}</h2>
            <p className="project-card-copy">{project.description}</p>
          </Link>
        ))}
      </div>
    </SiteShell>
  );
}
