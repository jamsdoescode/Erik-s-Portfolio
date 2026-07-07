import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

async function activatePro(userId: string, stripeCustomerId?: string | null) {
  await db.user.update({
    where: { id: userId },
    data: {
      plan: "pro",
      ...(stripeCustomerId ? { stripeCustomerId } : {}),
    },
  });
}

async function deactivatePro(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: {
      plan: "trial",
      trialEndsAt: new Date(),
    },
  });
}

async function resolveUserId(
  stripe: Stripe,
  opts: { userId?: string | null; customerId?: string | null }
): Promise<string | null> {
  if (opts.userId) return opts.userId;

  if (opts.customerId) {
    const user = await db.user.findUnique({
      where: { stripeCustomerId: opts.customerId },
      select: { id: true },
    });
    if (user) return user.id;

    const customer = await stripe.customers.retrieve(opts.customerId);
    if (!customer.deleted && customer.metadata?.userId) {
      return customer.metadata.userId;
    }
  }

  return null;
}

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== "subscription") break;

        const userId = await resolveUserId(stripe, {
          userId: checkoutSession.metadata?.userId,
          customerId:
            typeof checkoutSession.customer === "string"
              ? checkoutSession.customer
              : checkoutSession.customer?.id,
        });

        if (userId) {
          const customerId =
            typeof checkoutSession.customer === "string"
              ? checkoutSession.customer
              : checkoutSession.customer?.id;
          await activatePro(userId, customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(stripe, {
          userId: subscription.metadata?.userId,
          customerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id,
        });

        if (userId) {
          await deactivatePro(userId);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const isSubscriptionInvoice =
          invoice.parent?.type === "subscription_details" ||
          invoice.billing_reason?.startsWith("subscription");

        if (!isSubscriptionInvoice) break;

        const userId = await resolveUserId(stripe, {
          customerId:
            typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id,
        });

        if (userId) {
          const customerId =
            typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
          await activatePro(userId, customerId);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
