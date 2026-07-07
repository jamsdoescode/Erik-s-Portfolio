import { buildDailyDigest, type CommitmentView } from "./commitments";
import { sendEmail } from "./email";

export function buildDigestEmailHtml(
  name: string,
  digest: ReturnType<typeof buildDailyDigest>,
  appUrl: string
) {
  const sections: string[] = [];

  if (digest.overdue.length > 0) {
    sections.push(
      `<h3 style="color:#b8481f;margin:16px 0 8px;">Overdue (${digest.overdue.length})</h3><ul>${digest.overdue
        .slice(0, 5)
        .map((c) => `<li>${c.title}</li>`)
        .join("")}</ul>`
    );
  }
  if (digest.today.length > 0) {
    sections.push(
      `<h3 style="margin:16px 0 8px;">Due today (${digest.today.length})</h3><ul>${digest.today
        .slice(0, 5)
        .map((c) => `<li>${c.title}</li>`)
        .join("")}</ul>`
    );
  }
  if (digest.waiting.length > 0) {
    sections.push(
      `<h3 style="margin:16px 0 8px;">Waiting on others</h3><ul>${digest.waiting
        .map((c) => `<li>${c.title}${c.personName ? ` — ${c.personName}` : ""}</li>`)
        .join("")}</ul>`
    );
  }

  const body =
    sections.length > 0
      ? sections.join("")
      : `<p>You're clear today — no overdue items.</p>`;

  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;color:#1c1917;">
      <p>Hi ${name},</p>
      <p><strong>${digest.headline}</strong></p>
      ${body}
      <p style="margin-top:24px;">
        <a href="${appUrl}/app/digest" style="color:#b8481f;">Open digest →</a>
      </p>
    </div>
  `;
}

export async function sendDigestEmail(
  to: string,
  name: string,
  commitments: CommitmentView[],
  appUrl: string
) {
  const digest = buildDailyDigest(commitments);
  const html = buildDigestEmailHtml(name, digest, appUrl);
  await sendEmail({
    to,
    subject: `FollowThrough: ${digest.headline}`,
    html,
  });
}
