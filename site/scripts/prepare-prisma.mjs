import fs from "node:fs";
import path from "node:path";

function firstNonEmpty(...values) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

const url =
  firstNonEmpty(
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
  ) ?? "file:";

const provider = url.startsWith("postgres") ? "postgresql" : "sqlite";
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const schema = fs.readFileSync(schemaPath, "utf8");
const currentMatch = schema.match(/datasource db\s*\{\s*provider\s*=\s*"(sqlite|postgresql)"/);
if (!currentMatch) {
  throw new Error("Could not find Prisma datasource provider in schema.prisma");
}

if (currentMatch[1] === provider) {
  console.log(`[prepare-prisma] datasource provider already ${provider}`);
  process.exit(0);
}

const next = schema.replace(
  /(datasource db\s*\{\s*provider\s*=\s*")(?:sqlite|postgresql)(")/,
  `$1${provider}$2`,
);

fs.writeFileSync(schemaPath, next);
console.log(`[prepare-prisma] datasource provider -> ${provider}`);
