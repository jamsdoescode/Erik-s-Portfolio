import "dotenv/config";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { TRIAL_DAYS } from "../src/lib/relay";

const url =
  process.env.DATABASE_URL ||
  `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

const adapter = new PrismaBetterSqlite3({ url });
const db = new PrismaClient({ adapter });

async function main() {
  await db.relayLog.deleteMany();
  await db.project.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const user = await db.user.create({
    data: {
      email: "demo@relay.app",
      passwordHash,
      name: "Demo User",
      onboarded: true,
      trialEndsAt,
    },
  });

  const authProject = await db.project.create({
    data: {
      userId: user.id,
      name: "Auth refactor",
      description: "OAuth migration + SSO for enterprise",
      color: "#059669",
    },
  });

  const sideProject = await db.project.create({
    data: {
      userId: user.id,
      name: "Side project",
      description: "Weekend SaaS experiment",
      color: "#0284c7",
    },
  });

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  await db.relayLog.create({
    data: {
      userId: user.id,
      projectId: authProject.id,
      title: "OAuth callback wiring",
      accomplished: "Wired OAuth callback and refresh token flow in staging",
      nextStep: "Fix token expiry edge case in middleware",
      blockers: "Waiting on infra for new secrets store",
      startedAt: twoDaysAgo,
      endedAt: new Date(twoDaysAgo.getTime() + 90 * 60 * 1000),
      durationSec: 5400,
    },
  });

  await db.relayLog.create({
    data: {
      userId: user.id,
      projectId: sideProject.id,
      title: "Landing page draft",
      accomplished: "Sketched hero and pricing sections",
      nextStep: "Build waitlist form and connect Resend",
      blockers: "",
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      durationSec: 2700,
    },
  });

  console.log("Seeded demo user demo@relay.app / demo1234");
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    void db.$disconnect();
    process.exit(1);
  });
