import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { ComponentType } from "react";
import { db } from "./db";
import { formatDate, parseLocalDate, toDateString, todayDateString } from "./dates";
import type { PageCopy } from "@/lib/page-copy";
import { mergePageCopyWithLegacy } from "@/lib/page-copy";

export type SiteConfig = {
  name: string;
  tagline: string;
  intro: string;
  bio: string;
  bioExtended?: string;
  now: string[];
  links: { label: string; href: string }[];
  photo?: string;
  aboutPhoto?: string;
  photos?: string[];
  pageCopy: PageCopy;
};

export type ReadingItem = {
  id: string;
  title: string;
  author?: string;
  status: "reading" | "finished" | "queue";
  url?: string;
  note?: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  url?: string;
  status?: string;
  content: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  tags?: string[];
  content: string;
};

function parseJsonArray<T>(value: string | null | undefined, fallback: T[]): T[] {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T[];
  } catch {
    return fallback;
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const settings = await db.siteSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    throw new Error("Site settings not found. Run npm run db:seed.");
  }

  let storedCopy: Partial<PageCopy> = {};
  const copySource = settings.pageCopy ?? settings.sectionLabels;
  if (copySource) {
    try {
      storedCopy = JSON.parse(copySource) as Partial<PageCopy>;
    } catch {
      storedCopy = {};
    }
  }

  const pageCopy = mergePageCopyWithLegacy(storedCopy, {
    name: settings.name,
    tagline: settings.tagline,
    intro: settings.intro,
    bio: settings.bio,
    bioExtended: settings.bioExtended,
  });

  return {
    name: pageCopy.footer.copyrightName,
    tagline: pageCopy.home.eyebrow,
    intro: pageCopy.home.lead,
    bio: pageCopy.about.bio,
    bioExtended: pageCopy.about.bioExtended,
    now: parseJsonArray<string>(settings.nowItems, []),
    links: parseJsonArray<{ label: string; href: string }>(settings.links, []),
    photo: settings.photo ?? undefined,
    aboutPhoto: settings.aboutPhoto ?? undefined,
    photos: parseJsonArray<string>(settings.photos, settings.photo ? [settings.photo] : []),
    pageCopy,
  };
}

export { formatDate, parseLocalDate, toDateString, todayDateString } from "./dates";

export async function getReadingList(): Promise<ReadingItem[]> {
  const items = await db.readingItem.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    author: item.author ?? undefined,
    status: item.status as ReadingItem["status"],
    url: item.url ?? undefined,
    note: item.note ?? undefined,
  }));
}

export async function getProjects(): Promise<Project[]> {
  const projects = await db.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { year: "desc" }],
  });

  return projects.map(mapProject);
}

export async function getHomeProjects(): Promise<Project[]> {
  const pinned = await db.project.findMany({
    where: { homePin: { not: null } },
    orderBy: { homePin: "asc" },
    take: 3,
  });

  if (pinned.length > 0) {
    return pinned.map(mapProject);
  }

  const projects = await db.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { year: "desc" }],
    take: 3,
  });

  return projects.map(mapProject);
}

export async function getLatestPost(): Promise<Post | undefined> {
  const post = await db.blogPost.findFirst({
    where: { published: true },
    orderBy: { date: "desc" },
  });

  if (!post) return undefined;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: toDateString(post.date),
    description: post.description,
    tags: parseJsonArray<string>(post.tags, []),
    content: post.content,
  };
}

function mapProject(project: {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  url: string | null;
  status: string | null;
  content: string;
}): Project {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    year: project.year,
    description: project.description,
    url: project.url ?? undefined,
    status: project.status ?? undefined,
    content: project.content,
  };
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const project = await db.project.findUnique({ where: { slug } });
  if (!project) return undefined;

  return mapProject(project);
}

export async function getPosts(): Promise<Post[]> {
  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });

  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: toDateString(post.date),
    description: post.description,
    tags: parseJsonArray<string>(post.tags, []),
    content: post.content,
  }));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const post = await db.blogPost.findFirst({
    where: { slug, published: true },
  });
  if (!post) return undefined;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: toDateString(post.date),
    description: post.description,
    tags: parseJsonArray<string>(post.tags, []),
    content: post.content,
  };
}

export async function compileMdx(source: string): Promise<ComponentType> {
  const code = String(
    await compile(source, {
      outputFormat: "function-body",
      development: process.env.NODE_ENV === "development",
    }),
  );

  const { default: Content } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return Content as ComponentType;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
