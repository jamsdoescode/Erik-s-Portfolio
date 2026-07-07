import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { isTrialActive, trialDaysLeft } from "@/lib/commitments";
import { isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      onboarded: user.onboarded,
      timezone: user.timezone,
      digestEnabled: user.digestEnabled,
      digestHour: user.digestHour,
      trialDaysLeft: trialDaysLeft(user.trialEndsAt),
      hasAccess: isTrialActive(user),
      stripeConfigured: isStripeConfigured(),
      hasStripeCustomer: Boolean(user.stripeCustomerId),
    },
  });
}
