import "dotenv/config";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { defaultTrialEnd } from "../src/lib/commitments";

const url =
  process.env.DATABASE_URL ||
  `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

const adapter = new PrismaBetterSqlite3({ url });
const db = new PrismaClient({ adapter });

async function main() {
  await db.commitment.deleteMany();
  await db.capture.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);
  const user = await db.user.create({
    data: {
      email: "demo@followthrough.app",
      passwordHash,
      name: "Alex Chen",
      plan: "trial",
      trialEndsAt: defaultTrialEnd(),
      onboarded: true,
    },
  });

  const capture = await db.capture.create({
    data: {
      userId: user.id,
      rawText: "Sample meeting notes",
      sourceType: "notes",
      title: "Q2 Launch Sync — Acme Corp",
      processedAt: new Date(),
    },
  });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 5);

  await db.commitment.createMany({
    data: [
      {
        userId: user.id,
        captureId: capture.id,
        title: "Send revised pricing deck to Marcus",
        personName: "Marcus",
        direction: "i_owe",
        dueDate: yesterday,
        priority: 85,
        status: "active",
      },
      {
        userId: user.id,
        captureId: capture.id,
        title: "Follow up with Sarah on contract redlines",
        personName: "Sarah",
        direction: "i_owe",
        dueDate: now,
        priority: 90,
        status: "active",
      },
      {
        userId: user.id,
        title: "Schedule eng team demo with Acme",
        personName: "Marcus",
        direction: "i_owe",
        dueDate: nextWeek,
        priority: 60,
        status: "active",
      },
      {
        userId: user.id,
        title: "CFO budget approval",
        personName: "Marcus",
        direction: "they_owe",
        dueDate: nextWeek,
        priority: 55,
        status: "active",
      },
      {
        userId: user.id,
        title: "Legal MSA review",
        personName: "Legal team",
        direction: "they_owe",
        dueDate: tomorrow,
        priority: 70,
        status: "active",
      },
    ],
  });

  console.log("Seed complete!");
  console.log("Demo login: demo@followthrough.app / demo1234");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
