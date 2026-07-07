"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ReadingItemRecord = {
  id: string;
  title: string;
  author?: string | null;
  status: string;
  url?: string | null;
  note?: string | null;
};

type ReadingAdminProps = {
  items: ReadingItemRecord[];
};

const statusOptions = [
  { value: "reading", label: "Reading" },
  { value: "finished", label: "Finished" },
  { value: "queue", label: "Queue" },
] as const;

export function ReadingAdmin({ items: initialItems }: ReadingAdminProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<"reading" | "finished" | "queue">("reading");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ReadingItemRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  async function addItem(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        author: author.trim() || undefined,
        status,
        url: url.trim() || undefined,
        note: note.trim() || undefined,
      }),
    });

    if (!response.ok) {
      setError("Could not add item.");
      setLoading(false);
      return;
    }

    setTitle("");
    setAuthor("");
    setUrl("");
    setNote("");
    router.refresh();
    setLoading(false);
  }

  function startEdit(item: ReadingItemRecord) {
    setEditingId(item.id);
    setEditDraft({ ...item });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editDraft) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/admin/reading/${editDraft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editDraft.title,
        author: editDraft.author?.trim() || undefined,
        status: editDraft.status,
        url: editDraft.url?.trim() || undefined,
        note: editDraft.note?.trim() || undefined,
      }),
    });

    if (!response.ok) {
      setError("Could not save changes.");
      setLoading(false);
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === editDraft.id ? { ...item, ...editDraft } : item)),
    );
    setEditingId(null);
    setEditDraft(null);
    router.refresh();
    setLoading(false);
  }

  async function removeItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/admin/reading/${id}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) cancelEdit();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addItem} className="admin-card space-y-4">
        <h2 className="font-medium">Add reading item</h2>
        <div>
          <label className="admin-label">Title</label>
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="admin-label">Author</label>
          <input className="admin-input" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label">Buy / read link</label>
          <input
            className="admin-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://amazon.com/... or any store link"
          />
          <p className="text-xs text-muted mt-1">Optional. When set, the title on your reading page links here.</p>
        </div>
        <div>
          <label className="admin-label">Note</label>
          <textarea className="admin-textarea" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button type="submit" className="admin-button" disabled={loading}>
          Add item
        </button>
      </form>

      <div className="admin-card">
        <h2 className="font-medium mb-4">Current list</h2>
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="border-b border-rule pb-4 last:border-b-0 last:pb-0">
              {editingId === item.id && editDraft ? (
                <form onSubmit={saveEdit} className="space-y-3">
                  <input
                    className="admin-input"
                    value={editDraft.title}
                    onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                    required
                  />
                  <input
                    className="admin-input"
                    placeholder="Author"
                    value={editDraft.author ?? ""}
                    onChange={(e) => setEditDraft({ ...editDraft, author: e.target.value })}
                  />
                  <select
                    className="admin-select"
                    value={editDraft.status}
                    onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="admin-input"
                    placeholder="https://amazon.com/..."
                    value={editDraft.url ?? ""}
                    onChange={(e) => setEditDraft({ ...editDraft, url: e.target.value })}
                  />
                  <textarea
                    className="admin-textarea"
                    placeholder="Note"
                    value={editDraft.note ?? ""}
                    onChange={(e) => setEditDraft({ ...editDraft, note: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="admin-button" disabled={loading}>
                      Save
                    </button>
                    <button type="button" className="admin-button admin-button-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted mt-1">
                      {item.status}
                      {item.author ? ` · ${item.author}` : ""}
                    </p>
                    {item.url && (
                      <a
                        href={item.url}
                        className="text-sm text-link mt-1 inline-block break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.url}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button type="button" className="text-sm text-link" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="text-sm text-red-600" onClick={() => removeItem(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
