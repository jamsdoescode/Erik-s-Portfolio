import path from "node:path";

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export function isPostgresDatabaseUrl(url: string): boolean {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function resolveDatabaseUrl(): string {
  const explicit = firstNonEmpty(
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  );

  if (explicit) {
    if (process.env.NODE_ENV === "production" && !isPostgresDatabaseUrl(explicit)) {
      throw new Error(
        [
          "Invalid DATABASE_URL for production.",
          "Vercel serverless cannot use SQLite file databases.",
          "Set DATABASE_URL (or POSTGRES_PRISMA_URL) to a Postgres connection string.",
        ].join(" "),
      );
    }
    return explicit;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      [
        "Missing DATABASE_URL in production.",
        "Set DATABASE_URL or connect Vercel Postgres so POSTGRES_PRISMA_URL is available.",
      ].join(" "),
    );
  }

  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

export function withPostgresSsl(url: string): string {
  if (!isPostgresDatabaseUrl(url)) return url;
  if (url.includes("sslmode=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}sslmode=require`;
}
