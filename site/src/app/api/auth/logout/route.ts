import { NextResponse } from "next/server";
import { destroyAdminSession, getAdminSession } from "@/lib/auth";

export async function POST() {
  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }
  return NextResponse.json({ admin: session });
}
