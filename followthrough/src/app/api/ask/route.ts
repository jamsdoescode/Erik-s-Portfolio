import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { answerQuery } from "@/lib/ai";
import { requireAccess } from "@/lib/access";
import { wakeSnoozedCommitments } from "@/lib/snooze";

const schema = z.object({ query: z.string().min(3).max(500) });

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    await requireAccess(session.userId);
    await wakeSnoozedCommitments(session.userId);

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ask a longer question" }, { status: 400 });
    }

    const commitments = await db.commitment.findMany({
      where: { userId: session.userId, status: "active" },
      orderBy: { priority: "desc" },
    });

    const answer = await answerQuery(parsed.data.query, commitments);
    return NextResponse.json({ answer });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "PaymentRequired") {
      return NextResponse.json({ error: "Trial expired. Upgrade to Pro." }, { status: 402 });
    }
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
