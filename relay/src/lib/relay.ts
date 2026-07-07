import type { RelayLog, Project } from "@/generated/prisma/client";
import { differenceInMinutes, formatDistanceToNow } from "date-fns";

export const PLAN_PRICE = 14.99;
export const TRIAL_DAYS = 14;

export type RelayLogView = RelayLog & { project?: Project | null };

export function isTrialActive(user: {
  plan: string;
  trialEndsAt: Date | null;
}): boolean {
  if (user.plan === "pro") return true;
  if (!user.trialEndsAt) return false;
  return user.trialEndsAt > new Date();
}

export function trialDaysLeft(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;
  const ms = trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

export function timeSince(date: Date | null | undefined): string {
  if (!date) return "never";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function sessionDuration(log: RelayLog): number | null {
  if (log.durationSec) return log.durationSec;
  if (!log.endedAt) return null;
  return differenceInMinutes(log.endedAt, log.startedAt) * 60;
}

export function buildHeuristicBrief(
  projectName: string,
  logs: RelayLogView[]
): { headline: string; body: string; usedAI: boolean } {
  const completed = logs.filter((l) => l.endedAt);
  if (completed.length === 0) {
    return {
      headline: `Fresh start on ${projectName}`,
      body: "No prior sessions logged yet. Start a relay session and you'll get a briefing next time you return.",
      usedAI: false,
    };
  }

  const last = completed[0];
  const ago = timeSince(last.endedAt ?? last.startedAt);
  const parts: string[] = [];

  if (last.accomplished) parts.push(`You last worked on: ${last.accomplished}`);
  if (last.nextStep) parts.push(`Pick up with: ${last.nextStep}`);
  if (last.blockers) parts.push(`Blockers to watch: ${last.blockers}`);

  const openSessions = logs.filter((l) => !l.endedAt);
  if (openSessions.length > 0) {
    parts.push(`You have an open session from ${timeSince(openSessions[0].startedAt)}.`);
  }

  return {
    headline: `Last touched ${ago}`,
    body: parts.join("\n\n") || last.body || "Review your recent logs below.",
    usedAI: false,
  };
}
