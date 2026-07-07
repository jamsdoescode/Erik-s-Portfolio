import cron from "node-cron";
import { listSchedules, listPlaybooks } from "./store.js";
import { runAgentLoop } from "./agentLoop.js";

const activeJobs = new Map();

export async function reloadScheduler({ openAiApiKey, model, dryRun = false }) {
  for (const job of activeJobs.values()) {
    job.stop();
  }
  activeJobs.clear();

  const schedules = await listSchedules();
  const playbooks = await listPlaybooks();

  for (const schedule of schedules) {
    if (!schedule.enabled || !cron.validate(schedule.cron)) continue;
    const playbook = playbooks.find((item) => item.id === schedule.playbookId);
    if (!playbook) continue;

    const job = cron.schedule(schedule.cron, async () => {
      console.log(`Running scheduled outcome: ${playbook.title}`);
      await runAgentLoop({
        intent: playbook.intent,
        openAiApiKey,
        model,
        dryRun,
        outcomeId: playbook.outcomeId,
      });
    });
    activeJobs.set(schedule.id, job);
    console.log(`Scheduled ${playbook.title} with cron ${schedule.cron}`);
  }
}

export function stopScheduler() {
  for (const job of activeJobs.values()) {
    job.stop();
  }
  activeJobs.clear();
}
