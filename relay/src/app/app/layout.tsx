import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { isTrialActive, trialDaysLeft } from "@/lib/relay";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  if (!user.onboarded && !pathname.startsWith("/app/onboarding")) {
    redirect("/app/onboarding");
  }

  return (
    <AppShell
      userName={user.name}
      hasAccess={isTrialActive(user)}
      trialDaysLeft={trialDaysLeft(user.trialEndsAt)}
    >
      {children}
    </AppShell>
  );
}
