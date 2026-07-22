const nodemailer = require("nodemailer");

// Sends email through Gmail's own SMTP using an App Password.
// This bypasses the "Gmail blocks third-party senders from @gmail.com"
// problem entirely -- we're sending AS Gmail, not pretending to be it.
//
// Setup in Vercel env vars:
//   GMAIL_USER  = your Gmail address  e.g. hemasreesurapaneni10@gmail.com
//   GMAIL_PASS  = 16-char App Password from https://myaccount.google.com/apppasswords
//                 (requires 2-Step Verification to be on first)
//
// Old Brevo env vars (BREVO_API_KEY, EMAIL_FROM) are no longer needed.

function emailConfigured() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_PASS);
}

let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,   // App Password, not your real Gmail password
    },
  });
  return _transporter;
}

async function sendEmail({ to, subject, html }) {
  if (!emailConfigured()) {
    return { ok: false, error: "Email isn't configured (GMAIL_USER / GMAIL_PASS missing)." };
  }
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Job Search HQ" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message || "Email send failed" };
  }
}

module.exports = { sendEmail, emailConfigured };
