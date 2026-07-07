import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { isTrialActive } from "@/lib/relay";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function GET() {
  try {
    const session = await requireSession();
    const projects = await db.project.findMany({
      where: { userId: session.userId, archived: false },
      orderBy: { updatedAt: "desc" },
      include: {
        relayLogs: {
          orderBy: { startedAt: "desc" },
          take: 1,
        },
        _count: { select: { relayLogs: true } },
      },
    });

    return NextResponse.json({ projects });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user || !isTrialActive(user)) {
      return NextResponse.json({ error: "Trial expired. Upgrade to Pro." }, { status: 402 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid project data" }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        userId: session.userId,
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
      },
    });

    return NextResponse.json({ project });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
