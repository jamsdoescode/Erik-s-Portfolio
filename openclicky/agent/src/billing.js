// Stripe billing stub — wire when Supabase auth ships.
// Set STRIPE_PRICE_PRO and STRIPE_SECRET_KEY in .env for production.

export function getBillingConfig() {
  return {
    proMonthlyCents: 2900,
    teamMonthlyCents: 4900,
    stripePricePro: process.env.STRIPE_PRICE_PRO ?? "",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? "[set]" : "",
    checkoutUrl: process.env.STRIPE_CHECKOUT_URL ?? "",
    targetMrrCents: 1_000_000,
    targetProUsers: 345,
  };
}

export function mrrPathSummary() {
  const config = getBillingConfig();
  return {
    proPrice: `$${(config.proMonthlyCents / 100).toFixed(0)}/mo`,
    targetMrr: `$${(config.targetMrrCents / 100).toLocaleString()} MRR`,
    usersNeeded: config.targetProUsers,
  };
}
