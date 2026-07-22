module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  // Derive admin username from ADMIN_EMAIL (everything before @).
  // Safe to expose -- tells the frontend which account sees the admin UI,
  // but actual admin actions are protected by ADMIN_SECRET separately.
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "";
  const adminUsername = adminEmail ? adminEmail.split("@")[0].toLowerCase() : null;
  res.status(200).json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    adminUsername,
  });
};
