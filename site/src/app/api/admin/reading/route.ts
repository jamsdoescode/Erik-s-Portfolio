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

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const items = await db.readingItem.findMany({ orderBy: [{ sortOrder: "asc" }, { title: "asc" }] });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const body = await request.json();
  const parsed = readingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reading item" }, { status: 400 });
  }

  const item = await db.readingItem.create({
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
  return NextResponse.json({ item });
}
