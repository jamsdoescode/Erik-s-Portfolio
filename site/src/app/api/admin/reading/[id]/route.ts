import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-api";
import { db } from "@/lib/db";

const readingSchema = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  status: z.enum(["reading", "finished", "queue"]),
  url: z.string().optional(),
  note: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = readingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reading item" }, { status: 400 });
  }

  const item = await db.readingItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      author: parsed.data.author ?? null,
      status: parsed.data.status,
      url: parsed.data.url ?? null,
      note: parsed.data.note ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  revalidatePath("/");
  revalidatePath("/reading");
  revalidatePath("/admin/reading");
  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;
  await db.readingItem.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/reading");
  revalidatePath("/admin/reading");
  return NextResponse.json({ ok: true });
}