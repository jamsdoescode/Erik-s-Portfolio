import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildDailyDigest } from "@/lib/commitments";
import { wakeSnoozedCommitments } from "@/lib/snooze";

export async function GET() {
  try {
    const session = await requireSession();
    await wakeSnoozedCommitments(session.userId);

    const commitments = await db.commitment.findMany({
      where: { userId: session.userId, status: { in: ["active", "snoozed"] } },
      orderBy: { priority: "desc" },
    });

    const visible = commitments.filter(
      (c) =>
        c.status === "active" ||
        (c.status === "snoozed" && c.snoozedUntil && c.snoozedUntil <= new Date())
    );

    const digest = buildDailyDigest(visible);
    return NextResponse.json({ digest });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
