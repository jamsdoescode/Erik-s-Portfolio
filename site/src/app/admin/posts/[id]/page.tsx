import { notFound } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { toDateString } from "@/lib/content";
import { db } from "@/lib/db";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold mb-8">Edit post</h1>
      <PostEditor
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          description: post.description,
          content: post.content,
          date: toDateString(post.date),
          published: post.published,
        }}
      />
    </div>
  );
}
