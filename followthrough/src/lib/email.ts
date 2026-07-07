type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL || "FollowThrough <onboarding@resend.dev>";

    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  console.log("[email dev]", { to, subject, html });
}
