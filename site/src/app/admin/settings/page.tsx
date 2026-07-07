import { SettingsEditor } from "@/components/settings-editor";
import { getSiteConfig } from "@/lib/content";

export default async function AdminSettingsPage() {
  const site = await getSiteConfig();

  return (
    <div>
      <h1 className="font-display text-4xl font-semibold mb-8">Site settings</h1>
      <SettingsEditor
        initial={{
          now: site.now,
          links: site.links,
          photo: site.photo,
          aboutPhoto: site.aboutPhoto,
          pageCopy: site.pageCopy,
        }}
      />
    </div>
  );
}
