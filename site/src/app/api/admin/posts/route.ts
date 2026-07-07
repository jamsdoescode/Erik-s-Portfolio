import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-api";
import { parseLocalDate, todayDateString } from "@/lib/dates";
import { slugify } from "@/lib/content";
import { db } from "@/lib/db";

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  content: z.string().min(1),
  date: z.string().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const posts = await db.blogPost.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  const dateValue = parsed.data.date?.trim() || todayDateString();
  const post = await db.blogPost.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      content: parsed.data.content,
      date: parseLocalDate(dateValue),
      tags: null,
      published: parsed.data.published ?? true,
    },
  });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return NextResponse.json({ post });
}
