import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { defaultPageCopy, pageCopyToLegacyFields } from "@/lib/page-copy";

const pageCopySchema = z.object({
  nav: z.object({
    about: z.string().min(1),
    reading: z.string().min(1),
    projects: z.string().min(1),
    blog: z.string().min(1),
  }),
  home: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    lead: z.string().min(1),
    now: z.string().min(1),
    latestWriting: z.string().min(1),
    projects: z.string().min(1),
    allPosts: z.string().min(1),
    viewProjects: z.string().min(1),
  }),
  about: z.object({
    title: z.string().min(1),
    intro: z.string().min(1),
    sidebarName: z.string().min(1),
    bio: z.string().min(1),
    bioExtended: z.string().min(1),
    blogLink: z.string().min(1),
  }),
  reading: z.object({
    title: z.string().min(1),
    intro: z.string().min(1),
    empty: z.string().min(1),
    statusReading: z.string().min(1),
    statusFinished: z.string().min(1),
    statusQueue: z.string().min(1),
  }),
  projects: z.object({
    title: z.string().min(1),
    intro: z.string().min(1),
    backLink: z.string().min(1),
    visitLink: z.string().min(1),
  }),
  blog: z.object({
    title: z.string().min(1),
    intro: z.string().min(1),
    empty: z.string().min(1),
    backLink: z.string().min(1),
  }),
  footer: z.object({
    copyrightName: z.string().min(1),
    adminLink: z.string().min(1),
  }),
});

const settingsSchema = z.object({
  name: z.string().min(1).optional(),
  tagline: z.string().min(1).optional(),
  intro: z.string().min(1).optional(),
  bio: z.string().min(1).optional(),
  bioExtended: z.string().min(1).optional(),
  now: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), href: z.string() })),
  photo: z.string().optional(),
  aboutPhoto: z.string().optional(),
  photos: z.array(z.string()).optional(),
  pageCopy: pageCopySchema,
  sectionLabels: pageCopySchema.partial().optional(),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const settings = await db.siteSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const pageCopy = data.pageCopy ?? defaultPageCopy;
    const legacy = pageCopyToLegacyFields(pageCopy);

    const settings = await db.siteSettings.update({
      where: { id: "default" },
      data: {
        name: legacy.name,
        tagline: legacy.tagline,
        intro: legacy.intro,
        bio: legacy.bio,
        bioExtended: legacy.bioExtended,
        nowItems: JSON.stringify(data.now),
        links: JSON.stringify(data.links),
        photo: data.photo?.trim() || null,
        aboutPhoto: data.aboutPhoto?.trim() || null,
        photos: JSON.stringify(data.photos ?? []),
        pageCopy: JSON.stringify(pageCopy),
        sectionLabels: JSON.stringify(pageCopy.home),
      },
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/reading");
    revalidatePath("/projects");
    revalidatePath("/blog");
    revalidatePath("/admin/settings");

    return NextResponse.json({ ok: true, settings });
  } catch (cause) {
    console.error("Settings update failed:", cause);
    const message = cause instanceof Error ? cause.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}