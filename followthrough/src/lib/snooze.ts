import { db } from "./db";

/** Reactivate commitments whose snooze period has ended. */
export async function wakeSnoozedCommitments(userId?: string) {
  const now = new Date();
  const result = await db.commitment.updateMany({
    where: {
      status: "snoozed",
      snoozedUntil: { lte: now },
      ...(userId ? { userId } : {}),
    },
    data: {
      status: "active",
      snoozedUntil: null,
    },
  });
  return result.count;
}
