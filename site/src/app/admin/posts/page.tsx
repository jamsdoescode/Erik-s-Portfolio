import Link from "next/link";
import { AdminPostRow } from "@/components/admin-post-row";
import { formatDate, toDateString } from "@/lib/content";
import { db } from "@/lib/db";

export default async function AdminPostsPage() {
  const posts = await db.blogPost.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-semibold mb-2">Blog posts</h1>
          <p className="text-muted">Create, edit, publish, or delete essays.</p>
        </div>
        <Link href="/admin/posts/new" className="admin-button">
          New post
        </Link>
      </div>

      <div className="admin-card">
        {posts.length === 0 ? (
          <p className="text-muted text-sm">No posts yet.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <AdminPostRow
                key={post.id}
                id={post.id}
                title={post.title}
                slug={post.slug}
                published={post.published}
                dateLabel={formatDate(toDateString(post.date))}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
