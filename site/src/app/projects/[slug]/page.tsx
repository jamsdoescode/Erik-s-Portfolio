import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { MdxContent } from "@/components/mdx-content";
import { SiteShell } from "@/components/site-shell";
import { getProject, getProjects, getSiteConfig } from "@/lib/content";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProject(slug), getSiteConfig()]);

  if (!project) notFound();

  return (
    <SiteShell site={site} currentPath="/projects" narrow>
      <Link href="/projects" className="back-link">
        {site.pageCopy.projects.backLink}
      </Link>
      <article>
        <header className="article-header">
          <p className="doc-meta">{project.year}</p>
          <h1 className="article-title">{project.title}</h1>
          <p className="page-intro">{project.description}</p>
          {project.url && (
            <a
              href={project.url}
              className="inline-flex items-center gap-1 text-link text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {site.pageCopy.projects.visitLink}
              <ArrowUpRight size={14} />
            </a>
          )}
        </header>
        <MdxContent source={project.content} />
      </article>
    </SiteShell>
  );
}
