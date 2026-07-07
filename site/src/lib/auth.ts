import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { JWT_SECRET_BYTES } from "@/lib/jwt-secret";

const COOKIE_NAME = "site_admin_session";

export type AdminSession = {
  adminId: string;
  email: string;
  name: string;
};

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, passwordHash);
}

export async function createAdminSession(adminId: string, email: string, name: string) {
  const token = await new SignJWT({ adminId, email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET_BYTES);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.session.deleteMany({
    where: { adminId, expiresAt: { lt: new Date() } },
  });

  await db.session.create({
    data: { adminId, token, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);
    const session = await db.session.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) return null;

    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await db.session.deleteMany({ where: { token } });
    cookieStore.delete(COOKIE_NAME);
  }
}

export { COOKIE_NAME };
