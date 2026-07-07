import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-api";
import { slugify } from "@/lib/content";
import { db } from "@/lib/db";

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  year: z.number().int(),
  description: z.string().min(1),
  content: z.string().min(1),
  url: z.string().optional(),
  status: z.string().optional(),
  sortOrder: z.number().int().optional(),
  homePin: z.union([z.literal(1), z.literal(2), z.literal(3), z.null()]).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  const homePin = parsed.data.homePin ?? null;

  const project = await db.$transaction(async (tx) => {
    if (homePin !== null) {
      await tx.project.updateMany({
        where: { homePin, id: { not: id } },
        data: { homePin: null },
      });
    }

    return tx.project.update({
      where: { id },
      data: {
        slug,
        title: parsed.data.title,
        year: parsed.data.year,
        description: parsed.data.description,
        content: parsed.data.content,
        url: parsed.data.url ?? null,
        status: parsed.data.status ?? null,
        sortOrder: parsed.data.sortOrder ?? 0,
        homePin,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  return NextResponse.json({ project });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const project = await db.project.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${project.slug}`);
  return NextResponse.json({ ok: true });
}
