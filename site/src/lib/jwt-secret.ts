const DEV_FALLBACK_SECRET = "site-dev-secret-change-me";

function resolveJwtSecretValue(): string {
  const envSecret = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && (!envSecret || envSecret.trim().length === 0)) {
    throw new Error(
      [
        "Missing JWT_SECRET in production.",
        "",
        "Set the JWT_SECRET environment variable to a long, random string.",
        "This secret is used to sign/verify admin session cookies.",
      ].join("\n"),
    );
  }

  return (envSecret && envSecret.trim().length > 0 ? envSecret : DEV_FALLBACK_SECRET).trim();
}

/**
 * Shared, validated JWT secret (as bytes) used for signing/verifying sessions.
 *
 * - In production, the app crashes on startup if JWT_SECRET is missing.
 * - In non-production, it falls back to a dev-only default for convenience.
 */
export const JWT_SECRET_BYTES = new TextEncoder().encode(resolveJwtSecretValue());

