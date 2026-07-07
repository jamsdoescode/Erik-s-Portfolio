import type { Metadata } from "next";
import { BlogFeed } from "@/components/blog-feed";
import { SiteShell } from "@/components/site-shell";
import { getPosts, getSiteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogPage() {
  const [site, posts] = await Promise.all([getSiteConfig(), getPosts()]);

  return (
    <SiteShell site={site} currentPath="/blog">
      <h1 className="page-heading">{site.pageCopy.blog.title}</h1>
      <p className="page-intro">{site.pageCopy.blog.intro}</p>
      <BlogFeed posts={posts} emptyLabel={site.pageCopy.blog.empty} />
    </SiteShell>
  );
}
