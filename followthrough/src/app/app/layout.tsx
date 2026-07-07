import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { trialDaysLeft, isTrialActive } from "@/lib/commitments";
import { wakeSnoozedCommitments } from "@/lib/snooze";
import { AppShell } from "@/components/app-shell";
import { headers } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  await wakeSnoozedCommitments(user.id);

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  if (!user.onboarded && !pathname.startsWith("/app/onboarding")) {
    redirect("/app/onboarding");
  }

  return (
    <AppShell
      userName={user.name}
      trialDaysLeft={trialDaysLeft(user.trialEndsAt)}
      hasAccess={isTrialActive(user)}
      plan={user.plan}
    >
      {children}
    </AppShell>
  );
}
