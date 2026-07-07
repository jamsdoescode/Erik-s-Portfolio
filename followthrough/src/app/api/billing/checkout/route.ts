import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAppUrl, getStripe, isStripeConfigured, STRIPE_PRICE_ID } from "@/lib/stripe";

const schema = z.object({
  demoMode: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan === "pro") {
      return NextResponse.json({ error: "Already subscribed to Pro" }, { status: 400 });
    }

    if (!isStripeConfigured()) {
      if (parsed.data.demoMode) {
        await db.user.update({
          where: { id: user.id },
          data: { plan: "pro" },
        });
        return NextResponse.json({ demo: true, url: "/app/settings?upgraded=demo" });
      }

      return NextResponse.json(
        {
          error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in .env.",
          demoAvailable: true,
        },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const appUrl = getAppUrl(req);
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/app/settings?upgraded=1`,
      cancel_url: `${appUrl}/app/settings?cancelled=1`,
      subscription_data: {
        metadata: { userId: user.id },
      },
      metadata: { userId: user.id },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
