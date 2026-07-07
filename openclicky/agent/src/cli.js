import "dotenv/config";
import { runAgentLoop } from "./agentLoop.js";
import { planOrganizeDownloads } from "./planOrganizeDownloads.js";
import { savePlaybook, saveSchedule } from "./store.js";

const [command, ...args] = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function requireKey() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY. Copy agent/.env.example to agent/.env");
    process.exit(1);
  }
  return process.env.OPENAI_API_KEY;
}

const model = process.env.OPENAI_MODEL || "gpt-4o";

if (command === "organize") {
  const result = await planOrganizeDownloads({
    openAiApiKey: requireKey(),
    model,
    downloadsPathOverride: process.env.DOWNLOADS_PATH,
    dryRun,
  });
  console.log(JSON.stringify(result, null, 2));
} else if (command === "run") {
  const intent = args.filter((arg) => arg !== "--dry-run").join(" ");
  if (!intent) {
    console.error("Usage: npm run task -- \"your intent here\" [--dry-run]");
    process.exit(1);
  }
  const result = await runAgentLoop({
    intent,
    openAiApiKey: requireKey(),
    model,
    dryRun,
  });
  console.log(JSON.stringify(result, null, 2));
} else if (command === "show") {
  const intent = args.filter((arg) => arg !== "--dry-run").join(" ");
  const playbook = await savePlaybook({ title: intent.slice(0, 60), intent });
  console.log(JSON.stringify(playbook, null, 2));
} else if (command === "schedule") {
  const [playbookId, cronExpr] = args;
  const schedule = await saveSchedule({ playbookId, cron: cronExpr });
  console.log(JSON.stringify(schedule, null, 2));
} else {
  console.error(`Usage:
  npm run organize [-- --dry-run]
  npm run task -- "intent" [--dry-run]
  npm run show -- "intent to save"
  node src/cli.js schedule <playbookId> "0 9 * * 1"`);
  process.exit(1);
}
