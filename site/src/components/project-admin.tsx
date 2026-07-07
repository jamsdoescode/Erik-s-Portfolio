"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProjectRecord = {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  content: string;
  url?: string | null;
  status?: string | null;
  sortOrder: number;
  homePin?: number | null;
};

type ProjectAdminProps = {
  projects: ProjectRecord[];
};

const emptyForm = {
  title: "",
  slug: "",
  year: new Date().getFullYear(),
  description: "",
  content: "",
  url: "",
  status: "",
  sortOrder: 0,
  homePin: null as number | null,
};

export function ProjectAdmin({ projects: initialProjects }: ProjectAdminProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProjectRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  async function addProject(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug.trim() || undefined,
        year: form.year,
        description: form.description,
        content: form.content,
        url: form.url.trim() || undefined,
        status: form.status.trim() || undefined,
        sortOrder: form.sortOrder,
        homePin: form.homePin,
      }),
    });

    if (!response.ok) {
      setError("Could not add project.");
      setLoading(false);
      return;
    }

    setForm(emptyForm);
    router.refresh();
    setLoading(false);
  }

  function startEdit(project: ProjectRecord) {
    setEditingId(project.id);
    setEditDraft({ ...project });
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

    const response = await fetch(`/api/admin/projects/${editDraft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editDraft.title,
        slug: editDraft.slug.trim() || undefined,
        year: editDraft.year,
        description: editDraft.description,
        content: editDraft.content,
        url: editDraft.url?.trim() || undefined,
        status: editDraft.status?.trim() || undefined,
        sortOrder: editDraft.sortOrder,
        homePin: editDraft.homePin ?? null,
      }),
    });

    if (!response.ok) {
      setError("Could not save changes.");
      setLoading(false);
      return;
    }

    setEditingId(null);
    setEditDraft(null);
    router.refresh();
    setLoading(false);
  }

  async function removeProject(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    router.refresh();
  }

  function PinSelector({
    value,
    onChange,
  }: {
    value: number | null | undefined;
    onChange: (pin: number | null) => void;
  }) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Home pin:</span>
        {[null, 1, 2, 3].map((pin) => (
          <button
            key={pin ?? "none"}
            type="button"
            className={`admin-pin ${value === pin ? "is-active" : ""}`}
            onClick={() => onChange(pin)}
          >
            {pin ?? "—"}
          </button>
        ))}
        <span className="text-xs text-muted">1–3 shows on home page (admin only)</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addProject} className="admin-card space-y-4">
        <h2 className="font-medium">Add project</h2>
        <div>
          <label className="admin-label">Title</label>
          <input
            className="admin-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="admin-label">Slug</label>
          <input
            className="admin-input"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="auto-generated from title if empty"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">Year</label>
            <input
              className="admin-input"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="admin-label">Sort order</label>
            <input
              className="admin-input"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label className="admin-label">Description</label>
          <textarea
            className="admin-textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="admin-label">Content (Markdown)</label>
          <textarea
            className="admin-textarea font-mono text-sm min-h-48"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">URL</label>
            <input
              className="admin-input"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="admin-label">Status</label>
            <input
              className="admin-input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              placeholder="Active, Archived, etc."
            />
          </div>
        </div>
        <PinSelector value={form.homePin} onChange={(homePin) => setForm({ ...form, homePin })} />
        <button type="submit" className="admin-button" disabled={loading}>
          Add project
        </button>
      </form>

      <div className="admin-card">
        <h2 className="font-medium mb-4">Current projects</h2>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id} className="border-b border-rule pb-4 last:border-b-0 last:pb-0">
              {editingId === project.id && editDraft ? (
                <form onSubmit={saveEdit} className="space-y-3">
                  <input
                    className="admin-input"
                    value={editDraft.title}
                    onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                    required
                  />
                  <input
                    className="admin-input"
                    placeholder="Slug"
                    value={editDraft.slug}
                    onChange={(e) => setEditDraft({ ...editDraft, slug: e.target.value })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="admin-input"
                      type="number"
                      placeholder="Year"
                      value={editDraft.year}
                      onChange={(e) => setEditDraft({ ...editDraft, year: Number(e.target.value) })}
                    />
                    <input
                      className="admin-input"
                      type="number"
                      placeholder="Sort order"
                      value={editDraft.sortOrder}
                      onChange={(e) => setEditDraft({ ...editDraft, sortOrder: Number(e.target.value) })}
                    />
                  </div>
                  <textarea
                    className="admin-textarea"
                    placeholder="Description"
                    value={editDraft.description}
                    onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                  />
                  <textarea
                    className="admin-textarea font-mono text-sm min-h-48"
                    placeholder="Content"
                    value={editDraft.content}
                    onChange={(e) => setEditDraft({ ...editDraft, content: e.target.value })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="admin-input"
                      placeholder="URL"
                      value={editDraft.url ?? ""}
                      onChange={(e) => setEditDraft({ ...editDraft, url: e.target.value })}
                    />
                    <input
                      className="admin-input"
                      placeholder="Status"
                      value={editDraft.status ?? ""}
                      onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })}
                    />
                  </div>
                  <PinSelector
                    value={editDraft.homePin}
                    onChange={(homePin) => setEditDraft({ ...editDraft, homePin })}
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{project.title}</p>
                      {project.homePin && (
                        <span className="admin-pin is-active" aria-label={`Pinned slot ${project.homePin}`}>
                          ★{project.homePin}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted mt-1">
                      {project.slug} · {project.year}
                      {project.status ? ` · ${project.status}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/projects/${project.slug}`} className="text-sm text-link">
                      View
                    </Link>
                    <button type="button" className="text-sm text-link" onClick={() => startEdit(project)}>
                      Edit
                    </button>
                    <button type="button" className="text-sm text-red-600" onClick={() => removeProject(project.id)}>
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
