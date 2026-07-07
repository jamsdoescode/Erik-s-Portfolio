import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_EMAIL = "emkeitz@students.wcpss.net";
const ALLOWED_PASSWORD = "HenskaoHenskaoHenskao67";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  if (email !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const passwordHash = await hashPassword(ALLOWED_PASSWORD);
  const admin = await db.admin.upsert({
    where: { email: ALLOWED_EMAIL },
    update: { passwordHash, name: "Admin" },
    create: { email: ALLOWED_EMAIL, passwordHash, name: "Admin" },
  });

  await createAdminSession(admin.id, admin.email, admin.name);
  return NextResponse.json({ ok: true });
}
