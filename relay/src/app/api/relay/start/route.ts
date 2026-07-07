import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { isTrialActive } from "@/lib/relay";

const schema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(120).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user || !isTrialActive(user)) {
      return NextResponse.json({ error: "Trial expired. Upgrade to Pro." }, { status: 402 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const project = await db.project.findFirst({
      where: { id: parsed.data.projectId, userId: session.userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // End any open session first
    if (user.activeLogId) {
      const open = await db.relayLog.findUnique({ where: { id: user.activeLogId } });
      if (open && !open.endedAt) {
        const durationSec = Math.floor((Date.now() - open.startedAt.getTime()) / 1000);
        await db.relayLog.update({
          where: { id: open.id },
          data: { endedAt: new Date(), durationSec },
        });
      }
    }

    const log = await db.relayLog.create({
      data: {
        userId: session.userId,
        projectId: project.id,
        title: parsed.data.title || `Working on ${project.name}`,
        startedAt: new Date(),
      },
      include: { project: true },
    });

    await db.user.update({
      where: { id: session.userId },
      data: { activeLogId: log.id },
    });

    await db.project.update({
      where: { id: project.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ log });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
