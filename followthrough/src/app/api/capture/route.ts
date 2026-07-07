import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractCommitments } from "@/lib/ai";
import { requireAccess } from "@/lib/access";

const schema = z.object({
  text: z.string().min(20).max(50000),
  sourceType: z.enum(["notes", "email", "slack", "transcript", "other"]).default("notes"),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    await requireAccess(session.userId);

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Paste at least 20 characters of text" }, { status: 400 });
    }

    const { text, sourceType } = parsed.data;
    const extraction = await extractCommitments(text);

    const capture = await db.capture.create({
      data: {
        userId: session.userId,
        rawText: text,
        sourceType,
        title: extraction.captureTitle,
        processedAt: new Date(),
      },
    });

    const created = await Promise.all(
      extraction.commitments.map((c) =>
        db.commitment.create({
          data: {
            userId: session.userId,
            captureId: capture.id,
            title: c.title,
            description: c.description,
            personName: c.personName,
            personEmail: c.personEmail,
            direction: c.direction,
            dueDate: c.dueDate ? new Date(c.dueDate) : null,
            priority: c.priority,
            sourceText: c.sourceSnippet,
          },
        })
      )
    );

    return NextResponse.json({
      capture: { id: capture.id, title: capture.title },
      summary: extraction.summary,
      usedAI: extraction.usedAI,
      commitments: created,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (e instanceof Error && e.message === "PaymentRequired") {
      return NextResponse.json({ error: "Trial expired. Upgrade to Pro." }, { status: 402 });
    }
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }
}
