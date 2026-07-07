import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const ALLOWED_SHELL_COMMANDS = new Set([
  "ls",
  "mkdir",
  "mv",
  "cp",
  "zip",
  "unzip",
  "curl",
  "open",
  "date",
  "echo",
]);

export async function commandExists(name) {
  try {
    await execFileAsync("which", [name]);
    return true;
  } catch {
    return false;
  }
}

export function expandPath(inputPath) {
  if (!inputPath) return os.homedir();
  return path.resolve(inputPath.replace(/^~(?=\/|$)/, os.homedir()));
}

export async function listDirectory(dirPath) {
  const resolved = expandPath(dirPath);
  const entries = await fs.readdir(resolved, { withFileTypes: true });
  return entries.map((entry) => ({
    name: entry.name,
    type: entry.isDirectory() ? "directory" : "file",
  }));
}

export async function movePath(from, to, { dryRun = false } = {}) {
  const source = expandPath(from);
  const destination = expandPath(to);
  if (dryRun) {
    return { moved: true, from: source, to: destination, dryRun: true };
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.rename(source, destination);
  return { moved: true, from: source, to: destination };
}

export async function makeDirectory(dirPath, { dryRun = false } = {}) {
  const resolved = expandPath(dirPath);
  if (dryRun) return { created: true, path: resolved, dryRun: true };
  await fs.mkdir(resolved, { recursive: true });
  return { created: true, path: resolved };
}

export async function readTextFile(filePath, { maxBytes = 32_000 } = {}) {
  const resolved = expandPath(filePath);
  const handle = await fs.open(resolved, "r");
  try {
    const buffer = Buffer.alloc(maxBytes);
    const { bytesRead } = await handle.read(buffer, 0, maxBytes, 0);
    return buffer.subarray(0, bytesRead).toString("utf8");
  } finally {
    await handle.close();
  }
}

export async function captureScreen(outputPath = "/tmp/done-agent-screen.jpg") {
  await execFileAsync("screencapture", ["-x", "-t", "jpg", outputPath]);
  const data = await fs.readFile(outputPath);
  return { path: outputPath, base64: data.toString("base64"), mimeType: "image/jpeg" };
}

export async function clickAt(x, y, { dryRun = false } = {}) {
  if (!(await commandExists("cliclick"))) {
    return { ok: false, error: "cliclick not installed (brew install cliclick)" };
  }
  if (dryRun) return { ok: true, action: "click", x, y, dryRun: true };
  await execFileAsync("cliclick", ["c:" + Math.round(x) + "," + Math.round(y)]);
  return { ok: true, action: "click", x, y };
}

export async function typeText(text, { dryRun = false } = {}) {
  if (!(await commandExists("cliclick"))) {
    return { ok: false, error: "cliclick not installed (brew install cliclick)" };
  }
  if (dryRun) return { ok: true, action: "type", text, dryRun: true };
  await execFileAsync("cliclick", ["t:" + text]);
  return { ok: true, action: "type", text };
}

export async function pressKey(key, { dryRun = false } = {}) {
  if (!(await commandExists("cliclick"))) {
    return { ok: false, error: "cliclick not installed (brew install cliclick)" };
  }
  if (dryRun) return { ok: true, action: "key", key, dryRun: true };
  await execFileAsync("cliclick", ["kp:" + key]);
  return { ok: true, action: "key", key };
}

export async function openUrl(url, { dryRun = false } = {}) {
  if (dryRun) return { ok: true, action: "open_url", url, dryRun: true };
  await execFileAsync("open", [url]);
  return { ok: true, action: "open_url", url };
}

export async function runAllowlistedShell(command, args = [], { dryRun = false } = {}) {
  const binary = path.basename(command);
  if (!ALLOWED_SHELL_COMMANDS.has(binary)) {
    throw new Error(`Shell command not allowlisted: ${binary}`);
  }
  if (dryRun) return { ok: true, command, args, dryRun: true };
  const { stdout, stderr } = await execFileAsync(command, args, { maxBuffer: 1024 * 1024 });
  return { ok: true, command, args, stdout, stderr };
}

export async function notifyDone(title, body, { dryRun = false } = {}) {
  if (dryRun) return { ok: true, title, body, dryRun: true };
  const script = `display notification ${JSON.stringify(body)} with title ${JSON.stringify(title)}`;
  await execFileAsync("osascript", ["-e", script]);
  return { ok: true, title, body };
}

export function pauseForUser(reason) {
  return { paused: true, reason, message: "Waiting for user (2FA, captcha, etc.)" };
}

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "files_list",
      description: "List entries in a directory",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "files_move",
      description: "Move or rename a file or folder",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string" },
          to: { type: "string" },
        },
        required: ["from", "to"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "files_mkdir",
      description: "Create a directory (recursive)",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "screen_capture",
      description: "Capture the current screen for verification",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "screen_click",
      description: "Click at screen coordinates (requires cliclick)",
      parameters: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" },
        },
        required: ["x", "y"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "screen_type",
      description: "Type text at the focused field (requires cliclick)",
      parameters: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "screen_key",
      description: "Press a key (return, tab, cmd-v, etc.)",
      parameters: {
        type: "object",
        properties: { key: { type: "string" } },
        required: ["key"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "browser_open",
      description: "Open a URL in the default browser",
      parameters: {
        type: "object",
        properties: { url: { type: "string" } },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "shell_run",
      description: "Run an allowlisted shell command",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string" },
          args: { type: "array", items: { type: "string" } },
        },
        required: ["command"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pause_for_user",
      description: "Pause until user completes 2FA or manual step",
      parameters: {
        type: "object",
        properties: { reason: { type: "string" } },
        required: ["reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "mark_outcome_complete",
      description: "Mark the outcome verified and complete with summary",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          verified: { type: "boolean" },
        },
        required: ["summary", "verified"],
      },
    },
  },
];

export async function executeTool(name, args, { dryRun = false } = {}) {
  switch (name) {
    case "files_list":
      return listDirectory(args.path);
    case "files_move":
      return movePath(args.from, args.to, { dryRun });
    case "files_mkdir":
      return makeDirectory(args.path, { dryRun });
    case "screen_capture":
      return captureScreen();
    case "screen_click":
      return clickAt(args.x, args.y, { dryRun });
    case "screen_type":
      return typeText(args.text, { dryRun });
    case "screen_key":
      return pressKey(args.key, { dryRun });
    case "browser_open":
      return openUrl(args.url, { dryRun });
    case "shell_run":
      return runAllowlistedShell(args.command, args.args ?? [], { dryRun });
    case "pause_for_user":
      return pauseForUser(args.reason);
    case "mark_outcome_complete":
      return { complete: true, summary: args.summary, verified: args.verified };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
