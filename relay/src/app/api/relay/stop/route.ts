import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseStopNote } from "@/lib/ai";

const schema = z.object({
  logId: z.string().optional(),
  note: z.string().min(3).max(5000),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Add a short note about where you left off" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logId = parsed.data.logId || user.activeLogId;
    if (!logId) {
      return NextResponse.json({ error: "No active session" }, { status: 400 });
    }

    const log = await db.relayLog.findFirst({
      where: { id: logId, userId: session.userId },
    });
    if (!log) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const structured = await parseStopNote(parsed.data.note);
    const endedAt = new Date();
    const durationSec = Math.floor((endedAt.getTime() - log.startedAt.getTime()) / 1000);

    const updated = await db.relayLog.update({
      where: { id: log.id },
      data: {
        title: structured.title,
        accomplished: structured.accomplished,
        nextStep: structured.nextStep,
        blockers: structured.blockers,
        body: parsed.data.note,
        endedAt,
        durationSec,
      },
      include: { project: true },
    });

    if (user.activeLogId === log.id) {
      await db.user.update({
        where: { id: session.userId },
        data: { activeLogId: null },
      });
    }

    if (log.projectId) {
      await db.project.update({
        where: { id: log.projectId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ log: updated });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to stop session" }, { status: 500 });
  }
}
