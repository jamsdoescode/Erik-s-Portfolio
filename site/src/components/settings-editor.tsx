"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageCopyEditor } from "@/components/page-copy-editor";
import { ImageUploadField } from "@/components/image-upload-field";
import type { PageCopy } from "@/lib/page-copy";

type SettingsEditorProps = {
  initial: {
    now: string[];
    links: { label: string; href: string }[];
    photo?: string;
    aboutPhoto?: string;
    pageCopy: PageCopy;
  };
};

export function SettingsEditor({ initial }: SettingsEditorProps) {
  const router = useRouter();
  const [nowText, setNowText] = useState(initial.now.join("\n"));
  const [linksText, setLinksText] = useState(
    initial.links.map((link) => `${link.label}|${link.href}`).join("\n"),
  );
  const [photo, setPhoto] = useState(initial.photo ?? "");
  const [aboutPhoto, setAboutPhoto] = useState(initial.aboutPhoto ?? "");
  const [pageCopy, setPageCopy] = useState(initial.pageCopy);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const links = linksText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|");
        return { label: label?.trim() ?? "", href: href?.trim() ?? "" };
      })
      .filter((link) => link.label && link.href);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          now: nowText.split("\n").map((line) => line.trim()).filter(Boolean),
          links,
          photo: photo.trim() || undefined,
          aboutPhoto: aboutPhoto.trim() || undefined,
          pageCopy,
        }),
      });

      const raw = await response.text();
      let data: { error?: string; ok?: boolean } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string; ok?: boolean };
        } catch {
          setError("Server returned an invalid response. Restart the dev server and try again.");
          return;
        }
      }

      if (!response.ok) {
        setError(data.error || `Save failed (${response.status})`);
        return;
      }

      setSuccess("Settings saved.");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card space-y-4">
      <PageCopyEditor value={pageCopy} onChange={setPageCopy} />

      <div className="border-t border-rule pt-4 space-y-4">
        <p className="admin-label">Home page list</p>
        <div>
          <label className="admin-label">Now items (one per line)</label>
          <textarea className="admin-textarea" value={nowText} onChange={(e) => setNowText(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="admin-label">Links (Label|URL per line)</label>
        <textarea className="admin-textarea" value={linksText} onChange={(e) => setLinksText(e.target.value)} />
        <p className="text-xs text-muted mt-1">Use Email, GitHub, and LinkedIn labels for home page icons.</p>
      </div>
      <ImageUploadField label="Home photo" value={photo} onChange={setPhoto} purpose="home" />
      <ImageUploadField label="About photo" value={aboutPhoto} onChange={setAboutPhoto} purpose="about" />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-accent">{success}</p>}
      <button type="submit" className="admin-button" disabled={loading}>
        {loading ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
