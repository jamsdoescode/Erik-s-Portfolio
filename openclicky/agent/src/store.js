import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PLAYBOOKS_FILE = path.join(DATA_DIR, "playbooks.json");
const SCHEDULES_FILE = path.join(DATA_DIR, "schedules.json");
const WATCH_FILE = path.join(DATA_DIR, "watch-events.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await ensureDataDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export async function listPlaybooks() {
  const data = await readJson(PLAYBOOKS_FILE, { playbooks: [] });
  return data.playbooks;
}

export async function savePlaybook({ title, intent, outcomeId, verificationHint }) {
  const data = await readJson(PLAYBOOKS_FILE, { playbooks: [] });
  const playbook = {
    id: `pb_${Date.now()}`,
    title,
    intent,
    outcomeId: outcomeId ?? `outcome_${Date.now()}`,
    verificationHint: verificationHint ?? "",
    createdAt: new Date().toISOString(),
    source: "show",
  };
  data.playbooks.unshift(playbook);
  await writeJson(PLAYBOOKS_FILE, data);
  return playbook;
}

export async function listSchedules() {
  const data = await readJson(SCHEDULES_FILE, { schedules: [] });
  return data.schedules;
}

export async function saveSchedule({ playbookId, cron, enabled = true }) {
  const data = await readJson(SCHEDULES_FILE, { schedules: [] });
  const schedule = {
    id: `sch_${Date.now()}`,
    playbookId,
    cron,
    enabled,
    createdAt: new Date().toISOString(),
  };
  data.schedules.unshift(schedule);
  await writeJson(SCHEDULES_FILE, data);
  return schedule;
}

export async function recordWatchEvent({ pattern, suggestion, appName }) {
  const data = await readJson(WATCH_FILE, { events: [] });
  const event = {
    id: `watch_${Date.now()}`,
    pattern,
    suggestion,
    appName: appName ?? "",
    detectedAt: new Date().toISOString(),
    status: "offered",
  };
  data.events.unshift(event);
  await writeJson(WATCH_FILE, data);
  return event;
}

export async function listWatchEvents() {
  const data = await readJson(WATCH_FILE, { events: [] });
  return data.events;
}

export async function acceptWatchOffer(eventId, intent) {
  const data = await readJson(WATCH_FILE, { events: [] });
  const event = data.events.find((item) => item.id === eventId);
  if (!event) throw new Error("Watch event not found");
  event.status = "accepted";
  event.intent = intent;
  await writeJson(WATCH_FILE, data);
  return savePlaybook({
    title: event.suggestion,
    intent,
    outcomeId: `watch_${eventId}`,
    verificationHint: event.pattern,
  });
}
