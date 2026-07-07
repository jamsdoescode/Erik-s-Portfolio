"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { todayDateString } from "@/lib/dates";

type PostFormProps = {
  post?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    date: string;
    published: boolean;
  };
};

export function PostEditor({ post }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [date, setDate] = useState(post?.date ?? todayDateString());
  const [published, setPublished] = useState(post?.published ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      slug,
      description,
      content,
      date,
      published,
    };

    const response = await fetch(post ? `/api/admin/posts/${post.id}` : "/api/admin/posts", {
      method: post ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Save failed");
      setLoading(false);
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  }

  async function onDelete() {
    if (!post || !confirm("Delete this post?")) return;
    setLoading(true);
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    router.push("/admin/posts");
    router.refresh();
  }

  function useToday() {
    setDate(todayDateString());
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-4">
      <div>
        <label className="admin-label">Title</label>
        <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="admin-label">Slug</label>
        <input className="admin-input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-title" />
      </div>
      <div>
        <label className="admin-label">Description</label>
        <input className="admin-input" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
        <label className="admin-label">Date</label>
        <div className="flex gap-2">
          <input className="admin-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button type="button" className="admin-button admin-button-secondary" onClick={useToday}>
            Today
          </button>
        </div>
        <p className="text-xs text-muted mt-1">New posts default to today&apos;s date in your local timezone.</p>
      </div>
      <div>
        <label className="admin-label">Content (Markdown)</label>
        <textarea className="admin-textarea min-h-[20rem] font-mono text-sm" value={content} onChange={(e) => setContent(e.target.value)} required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="admin-button" disabled={loading}>
          {loading ? "Saving..." : "Save post"}
        </button>
        {post && (
          <button type="button" className="admin-button admin-button-secondary" onClick={onDelete} disabled={loading}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
