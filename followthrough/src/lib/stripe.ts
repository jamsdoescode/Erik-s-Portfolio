import Stripe from "stripe";

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim() && STRIPE_PRICE_ID);
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }

  return stripeClient;
}

export function getAppUrl(req?: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (req) {
    const origin = req.headers.get("origin");
    if (origin) return origin;

    const host = req.headers.get("host");
    if (host) {
      const proto = host.includes("localhost") ? "http" : "https";
      return `${proto}://${host}`;
    }
  }

  return "http://localhost:3000";
}
