"use client";

import type { PageCopy } from "@/lib/page-copy";

type PageCopyEditorProps = {
  value: PageCopy;
  onChange: (value: PageCopy) => void;
};

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {multiline ? (
        <textarea className="admin-textarea" value={value} onChange={(e) => onChange(e.target.value)} required />
      ) : (
        <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} required />
      )}
    </div>
  );
}

export function PageCopyEditor({ value, onChange }: PageCopyEditorProps) {
  function updateSection<K extends keyof PageCopy>(section: K, key: keyof PageCopy[K], next: string) {
    onChange({
      ...value,
      [section]: {
        ...value[section],
        [key]: next,
      },
    });
  }

  return (
    <div className="border-t border-rule pt-4 space-y-6">
      <p className="admin-label">Site text — each field is unique to its page</p>

      <div className="space-y-3">
        <p className="text-sm font-medium">Navigation</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="About nav" value={value.nav.about} onChange={(v) => updateSection("nav", "about", v)} />
          <Field label="Reading nav" value={value.nav.reading} onChange={(v) => updateSection("nav", "reading", v)} />
          <Field label="Projects nav" value={value.nav.projects} onChange={(v) => updateSection("nav", "projects", v)} />
          <Field label="Blog nav" value={value.nav.blog} onChange={(v) => updateSection("nav", "blog", v)} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Home page</p>
        <div className="grid gap-4">
          <Field label="Eyebrow (small line above name)" value={value.home.eyebrow} onChange={(v) => updateSection("home", "eyebrow", v)} />
          <Field label="Headline (main name)" value={value.home.headline} onChange={(v) => updateSection("home", "headline", v)} />
          <Field label="Lead paragraph" value={value.home.lead} onChange={(v) => updateSection("home", "lead", v)} multiline />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Now panel title" value={value.home.now} onChange={(v) => updateSection("home", "now", v)} />
            <Field label="Latest writing title" value={value.home.latestWriting} onChange={(v) => updateSection("home", "latestWriting", v)} />
            <Field label="Projects section title" value={value.home.projects} onChange={(v) => updateSection("home", "projects", v)} />
            <Field label="All posts link" value={value.home.allPosts} onChange={(v) => updateSection("home", "allPosts", v)} />
            <Field label="View projects link" value={value.home.viewProjects} onChange={(v) => updateSection("home", "viewProjects", v)} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">About page</p>
        <div className="grid gap-4">
          <Field label="Page title" value={value.about.title} onChange={(v) => updateSection("about", "title", v)} />
          <Field label="Intro line (below title)" value={value.about.intro} onChange={(v) => updateSection("about", "intro", v)} />
          <Field label="Sidebar name" value={value.about.sidebarName} onChange={(v) => updateSection("about", "sidebarName", v)} />
          <Field label="Bio (short)" value={value.about.bio} onChange={(v) => updateSection("about", "bio", v)} multiline />
          <Field label="Bio (full body)" value={value.about.bioExtended} onChange={(v) => updateSection("about", "bioExtended", v)} multiline />
          <Field label="Blog link label" value={value.about.blogLink} onChange={(v) => updateSection("about", "blogLink", v)} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Reading page</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Page title" value={value.reading.title} onChange={(v) => updateSection("reading", "title", v)} />
          <Field label="Intro" value={value.reading.intro} onChange={(v) => updateSection("reading", "intro", v)} multiline />
          <Field label="Empty state" value={value.reading.empty} onChange={(v) => updateSection("reading", "empty", v)} />
          <Field label="Reading status label" value={value.reading.statusReading} onChange={(v) => updateSection("reading", "statusReading", v)} />
          <Field label="Finished status label" value={value.reading.statusFinished} onChange={(v) => updateSection("reading", "statusFinished", v)} />
          <Field label="Queue status label" value={value.reading.statusQueue} onChange={(v) => updateSection("reading", "statusQueue", v)} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Projects page</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Page title" value={value.projects.title} onChange={(v) => updateSection("projects", "title", v)} />
          <Field label="Intro" value={value.projects.intro} onChange={(v) => updateSection("projects", "intro", v)} multiline />
          <Field label="Back link" value={value.projects.backLink} onChange={(v) => updateSection("projects", "backLink", v)} />
          <Field label="Visit project link" value={value.projects.visitLink} onChange={(v) => updateSection("projects", "visitLink", v)} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Blog page</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Page title" value={value.blog.title} onChange={(v) => updateSection("blog", "title", v)} />
          <Field label="Intro" value={value.blog.intro} onChange={(v) => updateSection("blog", "intro", v)} multiline />
          <Field label="Empty state" value={value.blog.empty} onChange={(v) => updateSection("blog", "empty", v)} />
          <Field label="Back link" value={value.blog.backLink} onChange={(v) => updateSection("blog", "backLink", v)} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Footer</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Copyright name" value={value.footer.copyrightName} onChange={(v) => updateSection("footer", "copyrightName", v)} />
          <Field label="Admin link" value={value.footer.adminLink} onChange={(v) => updateSection("footer", "adminLink", v)} />
        </div>
      </div>
    </div>
  );
}
