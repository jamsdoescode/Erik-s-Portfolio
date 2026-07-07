import type { Metadata } from "next";
import { HomeHero } from "@/components/home-hero";
import { LaunchSplash } from "@/components/launch-splash";
import { SiteShell } from "@/components/site-shell";
import { getHomeProjects, getLatestPost, getSiteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage() {
  const [site, latestPost, projects] = await Promise.all([getSiteConfig(), getLatestPost(), getHomeProjects()]);

  return (
    <SiteShell site={site} currentPath="/">
      <LaunchSplash />
      <HomeHero site={site} latestPost={latestPost} projects={projects} />
    </SiteShell>
  );
}
