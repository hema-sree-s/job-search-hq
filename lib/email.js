// Sends email via Brevo (free tier: 300 emails/day, no credit card, no
// custom domain needed -- just verify a sender address in their dashboard).
// Setup: create account at https://www.brevo.com, get an API key from
// SMTP & API -> API Keys, set it as BREVO_API_KEY in Vercel, and set
// EMAIL_FROM to the sender address you verified in Brevo.

function emailConfigured() {
  return !!(process.env.BREVO_API_KEY && process.env.EMAIL_FROM);
}

async function sendEmail({ to, subject, html }) {
  if (!emailConfigured()) {
    return { ok: false, error: "Email isn't configured (BREVO_API_KEY / EMAIL_FROM missing)." };
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: process.env.EMAIL_FROM, name: "Job Search HQ" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: `Email send failed (${res.status}): ${t.slice(0, 150)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "Email send failed" };
  }
}

module.exports = { sendEmail, emailConfigured };