import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const MovePlanSchema = z.object({
  summary: z.string(),
  folders_to_create: z.array(z.string()),
  moves: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      reason: z.string(),
    })
  ),
});

const IGNORED_NAMES = new Set([
  ".DS_Store",
  ".localized",
  "desktop.ini",
  "Thumbs.db",
]);

function resolveDownloadsPath(overridePath) {
  if (overridePath) {
    return path.resolve(overridePath.replace(/^~/, os.homedir()));
  }
  return path.join(os.homedir(), "Downloads");
}

async function listDownloadEntries(downloadsPath) {
  const entries = await fs.readdir(downloadsPath, { withFileTypes: true });
  return entries
    .filter((entry) => !IGNORED_NAMES.has(entry.name))
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
      extension: entry.isDirectory()
        ? null
        : path.extname(entry.name).toLowerCase() || null,
    }));
}

export async function planOrganizeDownloads({
  openAiApiKey,
  model,
  downloadsPathOverride,
  dryRun = false,
}) {
  const downloadsPath = resolveDownloadsPath(downloadsPathOverride);
  const entries = await listDownloadEntries(downloadsPath);

  if (entries.length === 0) {
    return {
      status: "done",
      downloadsPath,
      dryRun,
      summary: "Downloads is already empty (nothing to organize).",
      movesApplied: 0,
      foldersCreated: 0,
    };
  }

  const openai = new OpenAI({ apiKey: openAiApiKey });

  const completion = await openai.chat.completions.parse({
    model,
    messages: [
      {
        role: "system",
        content: [
          "You organize a user's Downloads folder.",
          "Return a practical plan using subfolders like Images, Documents, Archives, Videos, Audio, Installers, Code, Other.",
          "Only move top-level files and loose top-level folders.",
          "Do not nest more than one level under Downloads.",
          "Use relative paths from the Downloads root (e.g. Images/photo.png).",
          "Skip files that already look organized in subfolders.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify({ downloadsPath, entries }, null, 2),
      },
    ],
    response_format: zodResponseFormat(MovePlanSchema, "organize_downloads_plan"),
  });

  const plan = completion.choices[0]?.message?.parsed;
  if (!plan) {
    throw new Error("OpenAI returned no organization plan.");
  }

  let foldersCreated = 0;
  let movesApplied = 0;
  const errors = [];

  for (const folderName of plan.folders_to_create) {
    const folderPath = path.join(downloadsPath, folderName);
    if (dryRun) continue;
    await fs.mkdir(folderPath, { recursive: true });
    foldersCreated += 1;
  }

  for (const move of plan.moves) {
    const sourcePath = path.join(downloadsPath, move.from);
    const destinationPath = path.join(downloadsPath, move.to);

    if (dryRun) {
      movesApplied += 1;
      continue;
    }

    try {
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      await fs.rename(sourcePath, destinationPath);
      movesApplied += 1;
    } catch (error) {
      errors.push({
        from: move.from,
        to: move.to,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const remainingEntries = await listDownloadEntries(downloadsPath);

  return {
    status: errors.length === 0 ? "done" : "done_with_errors",
    downloadsPath,
    dryRun,
    summary: plan.summary,
    plannedMoves: plan.moves.length,
    movesApplied,
    foldersCreated,
    remainingTopLevelCount: remainingEntries.length,
    errors,
  };
}
