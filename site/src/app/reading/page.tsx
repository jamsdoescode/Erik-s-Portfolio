import type { Metadata } from "next";
import { ReadingCoverGrid } from "@/components/reading-list";
import { SiteShell } from "@/components/site-shell";
import { getReadingList, getSiteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reading",
};

export default async function ReadingPage() {
  const [site, items] = await Promise.all([getSiteConfig(), getReadingList()]);

  return (
    <SiteShell site={site} currentPath="/reading">
      <h1 className="page-heading">{site.pageCopy.reading.title}</h1>
      <p className="page-intro">{site.pageCopy.reading.intro}</p>
      <ReadingCoverGrid items={items} labels={site.pageCopy.reading} />
    </SiteShell>
  );
}
