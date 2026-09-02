"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CompanySection } from "@/lib/company-page";
import { companyPageUrl } from "@/lib/root-domain";

type CompanyRecord = {
  id: string;
  slug: string;
  orgName: string;
  roleTitle: string;
  heroHeadline: string;
  sections: CompanySection[];
  talkingPoints: string[];
  published: boolean;
};

type CompanyAdminProps = {
  companies: CompanyRecord[];
  rootDomain: string;
};

const emptySection = (): CompanySection => ({ title: "", content: "" });

const emptyForm = {
  slug: "",
  orgName: "",
  roleTitle: "",
  heroHeadline: "",
  sections: [emptySection()],
  talkingPoints: "",
  published: true,
};

function talkingPointsFromText(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function talkingPointsToText(points: string[]): string {
  return points.join("\n");
}

function cleanSections(sections: CompanySection[]): CompanySection[] {
  return sections
    .map((section) => ({ title: section.title.trim(), content: section.content.trim() }))
    .filter((section) => section.title && section.content);
}

function SectionsEditor({
  sections,
  onChange,
}: {
  sections: CompanySection[];
  onChange: (sections: CompanySection[]) => void;
}) {
  function updateSection(index: number, patch: Partial<CompanySection>) {
    onChange(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  function addSection() {
    onChange([...sections, emptySection()]);
  }

  if (sections.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">No content sections yet.</p>
        <button type="button" className="admin-button admin-button-secondary" onClick={addSection}>
          Add section
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={index} className="rounded-lg border border-rule p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="admin-label mb-0">Section {index + 1}</label>
            <button
              type="button"
              className="text-sm text-red-600"
              onClick={() => removeSection(index)}
            >
              Remove
            </button>
          </div>
          <input
            className="admin-input"
            placeholder="Section heading"
            value={section.title}
            onChange={(e) => updateSection(index, { title: e.target.value })}
          />
          <textarea
            className="admin-textarea min-h-28"
            placeholder="Section content (use blank lines for paragraphs, or one item per line for bullets)"
            value={section.content}
            onChange={(e) => updateSection(index, { content: e.target.value })}
          />
        </div>
      ))}
      <button type="button" className="admin-button admin-button-secondary" onClick={addSection}>
        Add section
      </button>
    </div>
  );
}

function CompanyFormFields({
  slug,
  orgName,
  roleTitle,
  heroHeadline,
  sections,
  talkingPoints,
  published,
  rootDomain,
  onSlugChange,
  onOrgNameChange,
  onRoleTitleChange,
  onHeroHeadlineChange,
  onSectionsChange,
  onTalkingPointsChange,
  onPublishedChange,
}: {
  slug: string;
  orgName: string;
  roleTitle: string;
  heroHeadline: string;
  sections: CompanySection[];
  talkingPoints: string;
  published: boolean;
  rootDomain: string;
  onSlugChange: (value: string) => void;
  onOrgNameChange: (value: string) => void;
  onRoleTitleChange: (value: string) => void;
  onHeroHeadlineChange: (value: string) => void;
  onSectionsChange: (sections: CompanySection[]) => void;
  onTalkingPointsChange: (value: string) => void;
  onPublishedChange: (value: boolean) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Slug (subdomain)</label>
          <input
            className="admin-input"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="housejudiciary"
            required
          />
          <p className="text-xs text-muted mt-1">
            {slug || "slug"}.{rootDomain}
          </p>
        </div>
        <div>
          <label className="admin-label">Published</label>
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => onPublishedChange(e.target.checked)} />
            Visible at subdomain
          </label>
        </div>
      </div>
      <div>
        <label className="admin-label">Organization name</label>
        <input className="admin-input" value={orgName} onChange={(e) => onOrgNameChange(e.target.value)} required />
      </div>
      <div>
        <label className="admin-label">Role title</label>
        <input className="admin-input" value={roleTitle} onChange={(e) => onRoleTitleChange(e.target.value)} required />
      </div>
      <div>
        <label className="admin-label">Hero headline</label>
        <input
          className="admin-input"
          value={heroHeadline}
          onChange={(e) => onHeroHeadlineChange(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="admin-label">Page sections</label>
        <p className="text-xs text-muted mb-3">Add, remove, or rename sections. Each gets its own heading on the page.</p>
        <SectionsEditor sections={sections} onChange={onSectionsChange} />
      </div>
      <div>
        <label className="admin-label">TL;DR bullets (one per line)</label>
        <p className="text-xs text-muted mb-2">Shown in the popup when someone lands on the page.</p>
        <textarea
          className="admin-textarea min-h-24"
          value={talkingPoints}
          onChange={(e) => onTalkingPointsChange(e.target.value)}
        />
      </div>
    </>
  );
}

export function CompanyAdmin({ companies: initialCompanies, rootDomain }: CompanyAdminProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState(initialCompanies);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CompanyRecord | null>(null);
  const [editTalkingPoints, setEditTalkingPoints] = useState("");
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");

  useEffect(() => {
    setCompanies(initialCompanies);
  }, [initialCompanies]);

  async function addCompany(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setCreatedUrl("");

    const response = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: form.slug.trim(),
        orgName: form.orgName,
        roleTitle: form.roleTitle,
        heroHeadline: form.heroHeadline,
        sections: cleanSections(form.sections),
        talkingPoints: talkingPointsFromText(form.talkingPoints),
        published: form.published,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not add company page.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as { company: CompanyRecord };
    setForm(emptyForm);
    setCreatedUrl(companyPageUrl(data.company.slug));
    router.refresh();
    setLoading(false);
  }

  function startEdit(company: CompanyRecord) {
    setEditingId(company.id);
    setEditDraft({
      ...company,
      sections: company.sections.length > 0 ? company.sections : [emptySection()],
    });
    setEditTalkingPoints(talkingPointsToText(company.talkingPoints));
    setError("");
    setCreatedUrl("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setEditTalkingPoints("");
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editDraft) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/admin/companies/${editDraft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: editDraft.slug.trim(),
        orgName: editDraft.orgName,
        roleTitle: editDraft.roleTitle,
        heroHeadline: editDraft.heroHeadline,
        sections: cleanSections(editDraft.sections),
        talkingPoints: talkingPointsFromText(editTalkingPoints),
        published: editDraft.published,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not save changes.");
      setLoading(false);
      return;
    }

    setEditingId(null);
    setEditDraft(null);
    setEditTalkingPoints("");
    router.refresh();
    setLoading(false);
  }

  async function removeCompany(id: string) {
    if (!confirm("Delete this company page?")) return;
    await fetch(`/api/admin/companies/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    router.refresh();
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="space-y-6">
      {createdUrl && (
        <div className="admin-card border-accent/30 bg-accent-soft">
          <p className="font-medium mb-2">Live URL</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href={createdUrl} className="text-link break-all" target="_blank" rel="noopener noreferrer">
              {createdUrl}
            </a>
            <button type="button" className="admin-button admin-button-secondary" onClick={() => copyUrl(createdUrl)}>
              Copy
            </button>
          </div>
        </div>
      )}

      <form onSubmit={addCompany} className="admin-card space-y-4">
        <h2 className="font-medium">Add company page</h2>
        <CompanyFormFields
          slug={form.slug}
          orgName={form.orgName}
          roleTitle={form.roleTitle}
          heroHeadline={form.heroHeadline}
          sections={form.sections}
          talkingPoints={form.talkingPoints}
          published={form.published}
          rootDomain={rootDomain}
          onSlugChange={(slug) => setForm({ ...form, slug })}
          onOrgNameChange={(orgName) => setForm({ ...form, orgName })}
          onRoleTitleChange={(roleTitle) => setForm({ ...form, roleTitle })}
          onHeroHeadlineChange={(heroHeadline) => setForm({ ...form, heroHeadline })}
          onSectionsChange={(sections) => setForm({ ...form, sections })}
          onTalkingPointsChange={(talkingPoints) => setForm({ ...form, talkingPoints })}
          onPublishedChange={(published) => setForm({ ...form, published })}
        />
        <button type="submit" className="admin-button" disabled={loading}>
          Add company page
        </button>
      </form>

      <div className="admin-card">
        <h2 className="font-medium mb-4">Company pages</h2>
        {companies.length === 0 ? (
          <p className="text-sm text-muted">No company pages yet.</p>
        ) : (
          <ul className="space-y-4">
            {companies.map((company) => {
              const liveUrl = companyPageUrl(company.slug);

              return (
                <li key={company.id} className="border-b border-rule pb-4 last:border-b-0 last:pb-0">
                  {editingId === company.id && editDraft ? (
                    <form onSubmit={saveEdit} className="space-y-3">
                      <CompanyFormFields
                        slug={editDraft.slug}
                        orgName={editDraft.orgName}
                        roleTitle={editDraft.roleTitle}
                        heroHeadline={editDraft.heroHeadline}
                        sections={editDraft.sections}
                        talkingPoints={editTalkingPoints}
                        published={editDraft.published}
                        rootDomain={rootDomain}
                        onSlugChange={(slug) => setEditDraft({ ...editDraft, slug })}
                        onOrgNameChange={(orgName) => setEditDraft({ ...editDraft, orgName })}
                        onRoleTitleChange={(roleTitle) => setEditDraft({ ...editDraft, roleTitle })}
                        onHeroHeadlineChange={(heroHeadline) => setEditDraft({ ...editDraft, heroHeadline })}
                        onSectionsChange={(sections) => setEditDraft({ ...editDraft, sections })}
                        onTalkingPointsChange={setEditTalkingPoints}
                        onPublishedChange={(published) => setEditDraft({ ...editDraft, published })}
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
                        <p className="font-medium">{company.orgName}</p>
                        <p className="text-sm text-muted mt-1">
                          {company.slug} · {company.roleTitle} · {company.published ? "Published" : "Draft"}
                        </p>
                        <a
                          href={liveUrl}
                          className="text-sm text-link break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {liveUrl}
                        </a>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Link href={`/companies/${company.slug}`} className="text-sm text-link">
                          Preview
                        </Link>
                        <button type="button" className="text-sm text-link" onClick={() => copyUrl(liveUrl)}>
                          Copy URL
                        </button>
                        <button type="button" className="text-sm text-link" onClick={() => startEdit(company)}>
                          Edit
                        </button>
                        <button type="button" className="text-sm text-red-600" onClick={() => removeCompany(company.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
