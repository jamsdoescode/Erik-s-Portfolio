import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}
