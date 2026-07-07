import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wakeSnoozedCommitments } from "@/lib/snooze";

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Wake all expired snoozes — run hourly */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await wakeSnoozedCommitments();
  return NextResponse.json({ ok: true, woken: count });
}
