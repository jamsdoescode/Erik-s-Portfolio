import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/mdx-content";
import { SiteShell } from "@/components/site-shell";
import { formatDate, getPost, getPosts, getSiteConfig } from "@/lib/content";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPost(slug), getSiteConfig()]);

  if (!post) notFound();

  return (
    <SiteShell site={site} currentPath="/blog" narrow>
      <Link href="/blog" className="back-link">
        {site.pageCopy.blog.backLink}
      </Link>
      <article>
        <header className="article-header">
          <p className="doc-meta">{formatDate(post.date)}</p>
          <h1 className="article-title">{post.title}</h1>
        </header>
        <MdxContent source={post.content} />
      </article>
    </SiteShell>
  );
}
