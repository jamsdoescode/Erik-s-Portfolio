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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  const dateValue = parsed.data.date?.trim() || todayDateString();
  const post = await db.blogPost.update({
    where: { id },
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

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const post = await db.blogPost.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return NextResponse.json({ ok: true });
}
