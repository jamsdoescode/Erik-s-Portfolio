import Link from "next/link";
import { formatDate, type Post } from "@/lib/content";
import { ImagePlaceholder } from "@/components/image-placeholder";

type PostListProps = {
  posts: Post[];
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-muted text-sm">No posts yet.</p>;
  }

  return (
    <div className="card-grid card-grid-2">
      {posts.map((post) => (
        <article key={post.slug} className="group">
          <Link href={`/blog/${post.slug}`}>
            <ImagePlaceholder aspect="wide" />
            <div className="card-caption">
              <p className="doc-meta mb-2">{formatDate(post.date)}</p>
              <h3 className="card-caption-title group-hover:text-accent transition-colors duration-150">
                {post.title}
              </h3>
              <p className="card-caption-meta">{post.description}</p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}

export function PostListCompact({ posts }: PostListProps) {
  return (
    <ul className="space-y-4">
      {posts.slice(0, 3).map((post) => (
        <li key={post.slug} className="border-b border-rule pb-4">
          <Link href={`/blog/${post.slug}`} className="font-display text-xl font-semibold hover:text-accent transition-colors duration-150">
            {post.title}
          </Link>
          <p className="doc-meta mt-1">{formatDate(post.date)}</p>
        </li>
      ))}
    </ul>
  );
}
