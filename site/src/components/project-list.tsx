import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/lib/content";
import { ImagePlaceholder } from "@/components/image-placeholder";

type ProjectListProps = {
  projects: Project[];
};

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="card-grid card-grid-3">
      {projects.map((project) => (
        <article key={project.slug} className="group">
          <Link href={`/projects/${project.slug}`}>
            <ImagePlaceholder aspect="wide" />
            <div className="card-caption">
              <div className="flex items-center gap-2 mb-2">
                <span className="doc-meta">{project.year}</span>
                {project.status && <span className="tag">{project.status}</span>}
              </div>
              <h3 className="card-caption-title group-hover:text-accent transition-colors duration-150">
                {project.title}
              </h3>
              <p className="card-caption-meta">{project.description}</p>
            </div>
          </Link>
          {project.url && (
            <a
              href={project.url}
              className="inline-flex items-center gap-1 text-sm text-link mt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit
              <ArrowUpRight size={14} />
            </a>
          )}
        </article>
      ))}
    </div>
  );
}

export function ProjectListCompact({ projects }: ProjectListProps) {
  return (
    <ul className="space-y-4">
      {projects.slice(0, 3).map((project) => (
        <li key={project.slug} className="border-b border-rule pb-4">
          <Link href={`/projects/${project.slug}`} className="font-display text-xl font-semibold hover:text-accent transition-colors duration-150">
            {project.title}
          </Link>
          <p className="doc-meta mt-1">{project.year}</p>
        </li>
      ))}
    </ul>
  );
}
