import { db } from "./db";
import { isTrialActive } from "./commitments";

export async function getUserAccess(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { user: null, hasAccess: false };
  return { user, hasAccess: isTrialActive(user) };
}

export async function requireAccess(userId: string) {
  const { user, hasAccess } = await getUserAccess(userId);
  if (!user) throw new Error("Unauthorized");
  if (!hasAccess) throw new Error("PaymentRequired");
  return user;
}
