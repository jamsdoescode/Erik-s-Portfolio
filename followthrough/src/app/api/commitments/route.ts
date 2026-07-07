import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { wakeSnoozedCommitments } from "@/lib/snooze";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    await wakeSnoozedCommitments(session.userId);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "active";

    const commitments = await db.commitment.findMany({
      where: {
        userId: session.userId,
        ...(status === "active"
          ? { status: { in: ["active", "snoozed"] } }
          : status !== "all"
            ? { status }
            : {}),
      },
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });

    const visible = commitments.filter((c) => {
      if (c.status === "snoozed" && c.snoozedUntil && c.snoozedUntil > new Date()) {
        return false;
      }
      if (status === "active") return c.status === "active";
      return true;
    });

    return NextResponse.json({ commitments: visible });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  personName: z.string().max(120).optional(),
  direction: z.enum(["i_owe", "they_owe", "neutral"]).default("i_owe"),
  dueDate: z.string().optional().nullable(),
  priority: z.number().int().min(0).max(100).default(50),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const commitment = await db.commitment.create({
      data: {
        userId: session.userId,
        title: parsed.data.title,
        description: parsed.data.description,
        personName: parsed.data.personName,
        direction: parsed.data.direction,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        priority: parsed.data.priority,
      },
    });

    return NextResponse.json({ commitment });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
