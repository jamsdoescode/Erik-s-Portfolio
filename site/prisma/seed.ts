import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";
import { defaultPageCopy } from "../src/lib/page-copy";

const contentDir = path.join(process.cwd(), "content");

async function main() {
  const email = process.env.ADMIN_EMAIL || "emkeitz@students.wcpss.net";
  const password = process.env.ADMIN_PASSWORD || "HenskaoHenskaoHenskao67";
  const name = process.env.ADMIN_NAME || "Admin";

  const passwordHash = await hashPassword(password);

  await db.admin.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  const existingSettings = await db.siteSettings.findUnique({ where: { id: "default" } });

  if (!existingSettings) {
    const siteRaw = fs.readFileSync(path.join(contentDir, "site.json"), "utf-8");
    const site = JSON.parse(siteRaw) as {
      name: string;
      tagline: string;
      intro: string;
      bio: string;
      bioExtended?: string;
      now: string[];
      links: { label: string; href: string }[];
      photo?: string;
      aboutPhoto?: string;
      photos?: string[];
    };

    await db.siteSettings.create({
      data: {
        id: "default",
        name: site.name,
        tagline: site.tagline,
        intro: site.intro,
        bio: site.bio,
        bioExtended: site.bioExtended ?? site.bio,
        nowItems: JSON.stringify(site.now),
        links: JSON.stringify(site.links),
        photo: site.photo ?? null,
        aboutPhoto: site.aboutPhoto ?? null,
        photos: JSON.stringify(site.photos ?? (site.photo ? [site.photo] : [])),
        sectionLabels: JSON.stringify(defaultPageCopy.home),
        pageCopy: JSON.stringify(defaultPageCopy),
      },
    });
    console.log("Seeded site settings (table was empty).");
  } else {
    console.log("Site settings already exist, skipping (your admin edits are preserved).");
  }

  const existingReadingCount = await db.readingItem.count();
  if (existingReadingCount === 0) {
    const readingRaw = fs.readFileSync(path.join(contentDir, "reading.json"), "utf-8");
    const reading = JSON.parse(readingRaw) as Array<{
      title: string;
      author?: string;
      status: string;
      url?: string;
      note?: string;
    }>;

    await db.readingItem.createMany({
      data: reading.map((item, index) => ({
        title: item.title,
        author: item.author ?? null,
        status: item.status,
        url: item.url ?? null,
        note: item.note ?? null,
        sortOrder: index,
      })),
    });
    console.log("Seeded reading list (table was empty).");
  } else {
    console.log("Reading list already has items, skipping.");
  }

  const existingProjectCount = await db.project.count();
  if (existingProjectCount === 0) {
    const projectDir = path.join(contentDir, "projects");
    const projectFiles = fs.readdirSync(projectDir).filter((f) => f.endsWith(".md"));

    for (const [index, file] of projectFiles.entries()) {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(projectDir, file), "utf-8");
      const { data, content } = matter(raw);

      await db.project.create({
        data: {
          slug,
          title: data.title as string,
          year: data.year as number,
          description: data.description as string,
          url: (data.url as string | undefined) ?? null,
          status: (data.status as string | undefined) ?? null,
          content,
          sortOrder: index,
        },
      });
    }
    console.log("Seeded projects (table was empty).");
  } else {
    console.log("Projects already exist, skipping.");
  }

  const existingBlogCount = await db.blogPost.count();
  if (existingBlogCount === 0) {
    const blogDir = path.join(contentDir, "blog");
    const blogFiles = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

    for (const file of blogFiles) {
      const slug = file.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(blogDir, file), "utf-8");
      const { data, content } = matter(raw);

      await db.blogPost.create({
        data: {
          slug,
          title: data.title as string,
          description: data.description as string,
          content,
          date: new Date(data.date as string),
          tags: data.tags ? JSON.stringify(data.tags) : null,
          published: true,
        },
      });
    }
    console.log("Seeded blog posts (table was empty).");
  } else {
    console.log("Blog posts already exist, skipping.");
  }

  console.log(`Admin account ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });