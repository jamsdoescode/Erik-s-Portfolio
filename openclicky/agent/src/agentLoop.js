import OpenAI from "openai";
import { toolDefinitions, executeTool, notifyDone } from "./tools/index.js";

const MAX_STEPS = 12;

const SYSTEM_PROMPT = `You are Done, a macOS outcome agent. The user wants something accomplished on their computer — not explained.

Rules:
- Use tools to DO the work: move files, click, type, open URLs, run allowlisted shell commands.
- Plan from the user's intent and any screen context provided.
- Verify the outcome before calling mark_outcome_complete with verified=true.
- If you need 2FA or human judgment, call pause_for_user.
- Prefer file operations when the task is about organizing files.
- Use screen_click/type only when UI interaction is required.
- When complete, call mark_outcome_complete with a short summary starting with what was done.
- Do not chat — execute until done or blocked.`;

export async function runAgentLoop({
  intent,
  openAiApiKey,
  model = "gpt-4o",
  dryRun = false,
  screenshots = [],
  outcomeId = null,
}) {
  const openai = new OpenAI({ apiKey: openAiApiKey });
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: buildUserMessage(intent, outcomeId, screenshots),
    },
  ];

  const steps = [];
  let finalResult = null;

  for (let step = 0; step < MAX_STEPS; step += 1) {
    const response = await openai.chat.completions.create({
      model,
      messages,
      tools: toolDefinitions,
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    if (!choice?.message) {
      throw new Error("OpenAI returned no message");
    }

    messages.push(choice.message);

    const toolCalls = choice.message.tool_calls ?? [];
    if (toolCalls.length === 0) {
      finalResult = {
        status: "done",
        summary: choice.message.content ?? "Task completed.",
        steps,
        dryRun,
      };
      break;
    }

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
      const toolResult = await executeTool(toolName, toolArgs, { dryRun });

      steps.push({ tool: toolName, args: toolArgs, result: toolResult });

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });

      if (toolName === "mark_outcome_complete" && toolResult.complete) {
        if (toolResult.verified && !dryRun) {
          await notifyDone("Done.", toolResult.summary);
        }
        finalResult = {
          status: toolResult.verified ? "done" : "incomplete",
          summary: toolResult.summary,
          steps,
          dryRun,
        };
        return finalResult;
      }

      if (toolName === "pause_for_user") {
        return {
          status: "paused",
          summary: toolResult.reason,
          steps,
          dryRun,
        };
      }
    }
  }

  if (!finalResult) {
    finalResult = {
      status: "max_steps",
      summary: "Agent reached step limit without confirming outcome.",
      steps,
      dryRun,
    };
  }

  if (finalResult.status === "done" && !dryRun) {
    await notifyDone("Done.", finalResult.summary);
  }

  return finalResult;
}

function buildUserMessage(intent, outcomeId, screenshots) {
  const parts = [{ type: "text", text: `Intent: ${intent}` }];
  if (outcomeId) {
    parts[0].text += `\nOutcome ID: ${outcomeId}`;
  }
  for (const shot of screenshots) {
    if (shot.base64) {
      parts.push({
        type: "image_url",
        image_url: { url: `data:${shot.mimeType ?? "image/jpeg"};base64,${shot.base64}` },
      });
    }
  }
  return parts.length === 1 ? parts[0].text : parts;
}

export async function verifyOutcome({ openAiApiKey, model, intent, screenshotBase64 }) {
  const openai = new OpenAI({ apiKey: openAiApiKey });
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You verify whether a desktop outcome was achieved. Reply JSON: {\"verified\": boolean, \"reason\": string}",
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Outcome to verify: ${intent}` },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${screenshotBase64}` },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });
  return JSON.parse(response.choices[0]?.message?.content ?? "{}");
}
