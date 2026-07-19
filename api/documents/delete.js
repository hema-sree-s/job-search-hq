const { del } = require("@vercel/blob");
const { verifyAuth } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  try {
    const { pathname } = req.body || {};
    // Every file this user could legitimately own lives under docs/<their userId>/...
    // -- refuse anything else so one account can't delete another's file.
    if (!pathname || typeof pathname !== "string" || !pathname.startsWith(`docs/${payload.userId}/`)) {
      return res.status(403).json({ error: "Not allowed to delete this file." });
    }
    await del(pathname);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Delete failed" });
  }
};
