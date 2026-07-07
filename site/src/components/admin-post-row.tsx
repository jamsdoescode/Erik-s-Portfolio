"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminPostRowProps = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  dateLabel: string;
};

export function AdminPostRow({ id, title, slug, published, dateLabel }: AdminPostRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete "${title}"?`)) return;
    setLoading(true);
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <li className="flex items-center justify-between gap-4 border-b border-rule pb-4 last:border-b-0 last:pb-0">
      <div>
        <Link href={`/admin/posts/${id}`} className="font-medium hover:text-accent">
          {title}
        </Link>
        <p className="text-sm text-muted mt-1">
          {dateLabel} · {slug} · {published ? "Published" : "Draft"}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link href={`/admin/posts/${id}`} className="text-sm text-link">
          Edit
        </Link>
        <Link href={`/blog/${slug}`} className="text-sm text-link">
          View
        </Link>
        <button
          type="button"
          className="text-sm text-red-600"
          onClick={onDelete}
          disabled={loading}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
