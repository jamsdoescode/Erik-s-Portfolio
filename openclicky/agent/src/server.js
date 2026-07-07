import "dotenv/config";
import express from "express";
import { planOrganizeDownloads } from "./planOrganizeDownloads.js";
import { runAgentLoop } from "./agentLoop.js";
import {
  listPlaybooks,
  savePlaybook,
  listSchedules,
  saveSchedule,
  recordWatchEvent,
  listWatchEvents,
  acceptWatchOffer,
} from "./store.js";
import { reloadScheduler } from "./scheduler.js";
import { getBillingConfig, mrrPathSummary } from "./billing.js";

const app = express();
app.use(express.json({ limit: "15mb" }));

function requireOpenAiKey() {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is missing. Copy agent/.env.example to agent/.env");
  }
  return openAiApiKey;
}

function agentConfig() {
  return {
    openAiApiKey: requireOpenAiKey(),
    model: process.env.OPENAI_MODEL || "gpt-4o",
    dryRun: process.env.DONE_DRY_RUN === "true",
  };
}

app.get("/", (_request, response) => {
  response.type("html").send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Done Agent</title></head>
<body style="font-family:system-ui;max-width:640px;margin:48px auto;padding:0 24px;line-height:1.5">
<h1>Done Agent</h1>
<p>Local API on port 7432. Open this URL in a browser to check status; tasks run from OpenClicky or the CLI.</p>
<ul>
<li><a href="/health">/health</a> — status check</li>
<li><code>POST /run</code> — run any intent (Say)</li>
<li><code>POST /run/organize-downloads</code> — organize Downloads</li>
<li><a href="/playbooks">/playbooks</a> — saved outcomes (Show)</li>
<li><a href="/schedules">/schedules</a> — scheduled runs</li>
</ul>
<p><strong>OpenClicky:</strong> double-tap Shift, type what you want, press Enter.</p>
<p><strong>CLI:</strong> <code>npm run task -- "organize my Downloads"</code></p>
</body></html>`);
});

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "done-agent", version: "0.2.0" });
});

app.post("/run", async (request, response) => {
  try {
    const { intent, dryRun, screenshots, outcomeId } = request.body ?? {};
    if (!intent || typeof intent !== "string") {
      response.status(400).json({ status: "error", message: "intent is required" });
      return;
    }
    const config = agentConfig();
    const result = await runAgentLoop({
      intent,
      openAiApiKey: config.openAiApiKey,
      model: config.model,
      dryRun: dryRun ?? config.dryRun,
      screenshots: screenshots ?? [],
      outcomeId: outcomeId ?? null,
    });
    response.json(result);
  } catch (error) {
    response.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post("/run/organize-downloads", async (request, response) => {
  try {
    const dryRun = Boolean(request.body?.dryRun);
    const config = agentConfig();
    const result = await planOrganizeDownloads({
      openAiApiKey: config.openAiApiKey,
      model: config.model,
      downloadsPathOverride: request.body?.downloadsPath || process.env.DOWNLOADS_PATH,
      dryRun,
    });
    response.json(result);
  } catch (error) {
    response.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/playbooks", async (_request, response) => {
  response.json({ playbooks: await listPlaybooks() });
});

app.post("/playbooks", async (request, response) => {
  try {
    const playbook = await savePlaybook(request.body ?? {});
    await reloadScheduler(agentConfig());
    response.json(playbook);
  } catch (error) {
    response.status(500).json({ status: "error", message: String(error) });
  }
});

app.get("/schedules", async (_request, response) => {
  response.json({ schedules: await listSchedules() });
});

app.post("/schedules", async (request, response) => {
  try {
    const schedule = await saveSchedule(request.body ?? {});
    await reloadScheduler(agentConfig());
    response.json(schedule);
  } catch (error) {
    response.status(500).json({ status: "error", message: String(error) });
  }
});

app.get("/watch", async (_request, response) => {
  response.json({ events: await listWatchEvents() });
});

app.post("/watch/detect", async (request, response) => {
  try {
    const event = await recordWatchEvent(request.body ?? {});
    response.json(event);
  } catch (error) {
    response.status(500).json({ status: "error", message: String(error) });
  }
});

app.post("/watch/:id/accept", async (request, response) => {
  try {
    const playbook = await acceptWatchOffer(request.params.id, request.body?.intent ?? "");
    response.json(playbook);
  } catch (error) {
    response.status(500).json({ status: "error", message: String(error) });
  }
});

app.get("/billing", (_request, response) => {
  response.json({ config: getBillingConfig(), path: mrrPathSummary() });
});

const port = Number(process.env.AGENT_PORT || 7432);
app.listen(port, "127.0.0.1", async () => {
  console.log(`done-agent listening on http://127.0.0.1:${port}`);
  try {
    await reloadScheduler(agentConfig());
  } catch (error) {
    console.warn("Scheduler not started:", error.message);
  }
});
