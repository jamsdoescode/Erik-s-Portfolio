import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await requireSession();

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in .env." },
        { status: 503 }
      );
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe to Pro first." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const appUrl = getAppUrl(req);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/app/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Portal error:", e);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
