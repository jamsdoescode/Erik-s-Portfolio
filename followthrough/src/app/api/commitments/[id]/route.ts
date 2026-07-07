import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateFollowUpDraft } from "@/lib/ai";
import { requireAccess } from "@/lib/access";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await requireAccess(session.userId);
    const { id } = await params;
    const body = await req.json();

    const existing = await db.commitment.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.dueDate !== undefined) {
      data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }
    if (body.priority !== undefined) data.priority = body.priority;

    if (body.status === "done") {
      data.status = "done";
      data.completedAt = new Date();
      data.snoozedUntil = null;
    } else if (body.status === "archived") {
      data.status = "archived";
      data.snoozedUntil = null;
    } else if (body.status === "active") {
      data.status = "active";
      data.snoozedUntil = null;
      data.completedAt = null;
    }

    if (body.snoozedUntil !== undefined) {
      if (body.snoozedUntil) {
        data.snoozedUntil = new Date(body.snoozedUntil);
        data.status = "snoozed";
      } else {
        data.snoozedUntil = null;
        data.status = "active";
      }
    }

    const commitment = await db.commitment.update({
      where: { id },
      data,
    });

    return NextResponse.json({ commitment });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "PaymentRequired") {
      return NextResponse.json({ error: "Trial expired. Upgrade to Pro." }, { status: 402 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    await db.commitment.deleteMany({ where: { id, userId: session.userId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await requireAccess(session.userId);
    const { id } = await params;

    const commitment = await db.commitment.findFirst({
      where: { id, userId: session.userId },
    });
    if (!commitment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const draft = await generateFollowUpDraft(commitment);
    const updated = await db.commitment.update({
      where: { id },
      data: { followUpDraft: draft },
    });

    return NextResponse.json({ commitment: updated, draft });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "PaymentRequired") {
      return NextResponse.json({ error: "Trial expired. Upgrade to Pro." }, { status: 402 });
    }
    return NextResponse.json({ error: "Draft failed" }, { status: 500 });
  }
}
