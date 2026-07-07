import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  timezone: z.string().optional(),
  onboarded: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: session.userId },
      data: parsed.data,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        onboarded: user.onboarded,
        timezone: user.timezone,
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
