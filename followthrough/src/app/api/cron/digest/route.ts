import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wakeSnoozedCommitments } from "@/lib/snooze";
import { sendDigestEmail } from "@/lib/digest-email";
import { getAppUrl } from "@/lib/stripe";

function authorize(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function localHour(now: Date, timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(now);
    const hour = parts.find((p) => p.type === "hour")?.value;
    return hour ? Number(hour) % 24 : now.getUTCHours();
  } catch {
    return now.getUTCHours();
  }
}

/** Send morning digest emails — run hourly, sends when user's local digestHour matches */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const users = await db.user.findMany({
    where: { digestEnabled: true },
  });

  let sent = 0;
  const appUrl = getAppUrl();

  for (const user of users) {
    await wakeSnoozedCommitments(user.id);

    const hour = localHour(now, user.timezone || "America/Los_Angeles");
    if (hour !== user.digestHour) continue;

    const commitments = await db.commitment.findMany({
      where: { userId: user.id, status: "active" },
    });

    if (commitments.length === 0) continue;

    try {
      await sendDigestEmail(user.email, user.name, commitments, appUrl);
      sent++;
    } catch (err) {
      console.error(`Digest failed for ${user.email}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
