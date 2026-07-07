import {
  addDays,
  isBefore,
  isToday,
  isTomorrow,
  startOfDay,
  differenceInDays,
} from "date-fns";

export type CommitmentView = {
  id: string;
  title: string;
  description?: string | null;
  personName?: string | null;
  direction: string;
  dueDate?: Date | null;
  priority: number;
  status: string;
  followUpDraft?: string | null;
  snoozedUntil?: Date | null;
  createdAt: Date;
};

export function computePriorityScore(c: CommitmentView): number {
  let score = c.priority;

  if (c.status !== "active") return 0;

  if (c.dueDate) {
    const days = differenceInDays(startOfDay(c.dueDate), startOfDay(new Date()));
    if (days < 0) score += 50;
    else if (days === 0) score += 40;
    else if (days <= 2) score += 25;
    else if (days <= 7) score += 10;
  }

  if (c.direction === "i_owe") score += 15;

  return score;
}

export function bucketCommitment(c: CommitmentView): "overdue" | "today" | "upcoming" | "waiting" | "none" {
  if (c.status !== "active") return "none";
  if (c.direction === "they_owe") return "waiting";
  if (!c.dueDate) return "upcoming";

  const due = startOfDay(c.dueDate);
  const now = startOfDay(new Date());

  if (isBefore(due, now)) return "overdue";
  if (isToday(c.dueDate)) return "today";
  return "upcoming";
}

export function formatDueLabel(due?: Date | null): string {
  if (!due) return "No date";
  if (isToday(due)) return "Today";
  if (isTomorrow(due)) return "Tomorrow";
  const days = differenceInDays(startOfDay(due), startOfDay(new Date()));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days <= 7) return due.toLocaleDateString("en-US", { weekday: "short" });
  return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function directionLabel(direction: string): string {
  switch (direction) {
    case "i_owe":
      return "You owe";
    case "they_owe":
      return "Waiting on";
    default:
      return "Neutral";
  }
}

export function buildDailyDigest(commitments: CommitmentView[]) {
  const active = commitments.filter(
    (c) => c.status === "active" && !isSnoozedHidden(c)
  );
  const sorted = [...active].sort((a, b) => computePriorityScore(b) - computePriorityScore(a));

  const overdue = sorted.filter((c) => bucketCommitment(c) === "overdue");
  const today = sorted.filter((c) => bucketCommitment(c) === "today");
  const upcoming = sorted.filter((c) => bucketCommitment(c) === "upcoming").slice(0, 5);
  const waiting = sorted.filter((c) => bucketCommitment(c) === "waiting").slice(0, 5);

  const headline =
    overdue.length > 0
      ? `${overdue.length} overdue — address these first`
      : today.length > 0
        ? `${today.length} due today — stay on track`
        : "You're clear for today — plan ahead";

  return { headline, overdue, today, upcoming, waiting, totalActive: active.length };
}

export function groupByPerson(commitments: CommitmentView[]) {
  const map = new Map<string, CommitmentView[]>();

  for (const c of commitments.filter((x) => x.status === "active" && x.personName)) {
    const key = c.personName!;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }

  return [...map.entries()]
    .map(([name, items]) => ({
      name,
      count: items.length,
      iOwe: items.filter((i) => i.direction === "i_owe").length,
      theyOwe: items.filter((i) => i.direction === "they_owe").length,
      topPriority: Math.max(...items.map(computePriorityScore)),
    }))
    .sort((a, b) => b.topPriority - a.topPriority);
}

export const PLAN_PRICE = 14.99;
export const TRIAL_DAYS = 14;

export function isTrialActive(user: { plan: string; trialEndsAt: Date | null }): boolean {
  if (user.plan === "pro") return true;
  if (!user.trialEndsAt) return false;
  return user.trialEndsAt > new Date();
}

export function isSnoozedHidden(c: { status: string; snoozedUntil?: Date | null }): boolean {
  if (c.status !== "snoozed") return false;
  if (!c.snoozedUntil) return true;
  return c.snoozedUntil > new Date();
}

export function trialDaysLeft(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return TRIAL_DAYS;
  return Math.max(0, differenceInDays(trialEndsAt, new Date()));
}

export function defaultTrialEnd(): Date {
  return addDays(new Date(), TRIAL_DAYS);
}
