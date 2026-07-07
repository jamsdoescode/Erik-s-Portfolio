import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { isTrialActive, trialDaysLeft } from "@/lib/relay";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ user: null });

  let activeLog = null;
  if (user.activeLogId) {
    activeLog = await db.relayLog.findUnique({
      where: { id: user.activeLogId },
      include: { project: true },
    });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      onboarded: user.onboarded,
      plan: user.plan,
      timezone: user.timezone,
      trialDaysLeft: trialDaysLeft(user.trialEndsAt),
      hasAccess: isTrialActive(user),
      activeLog,
    },
  });
}
