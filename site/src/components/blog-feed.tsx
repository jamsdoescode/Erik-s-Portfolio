import Link from "next/link";
import { formatDate, type Post } from "@/lib/content";

type BlogFeedProps = {
  posts: Post[];
  emptyLabel: string;
};

export function BlogFeed({ posts, emptyLabel }: BlogFeedProps) {
  return (
    <div className="blog-feed">
      {posts.length === 0 ? (
        <p className="empty-state">{emptyLabel}</p>
      ) : (
        posts.map((post) => (
          <article key={post.slug} className="blog-feed-item">
            <p className="doc-meta">{formatDate(post.date)}</p>
            <Link href={`/blog/${post.slug}`} className="blog-feed-title">
              {post.title}
            </Link>
            <p className="blog-feed-excerpt">{post.description}</p>
          </article>
        ))
      )}
    </div>
  );
}
