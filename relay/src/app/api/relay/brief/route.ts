import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateRelayBrief } from "@/lib/ai";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const project = await db.project.findFirst({
      where: { id: projectId, userId: session.userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const logs = await db.relayLog.findMany({
      where: { projectId, userId: session.userId },
      orderBy: { startedAt: "desc" },
      take: 12,
      include: { project: true },
    });

    const brief = await generateRelayBrief(project.name, logs);

    return NextResponse.json({ brief, project, logs });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Brief failed" }, { status: 500 });
  }
}
