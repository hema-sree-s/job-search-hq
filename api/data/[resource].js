const { getRedis, getJSON, setJSON } = require("../../lib/redis");
const { verifyAuth, verifyAuthDetailed } = require("../../lib/auth");

// Every resource here follows the same contract: an opaque, client-encrypted
// JSON blob (a string) stored under blob:<resource>:<userId>. The server
// never sees plaintext content for any of these.
const ALLOWED_RESOURCES = new Set(["jobs", "resume", "interviews", "learning", "profile", "documents"]);

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  const { resource } = req.query;
  if (!ALLOWED_RESOURCES.has(resource)) {
    return res.status(404).json({ error: "Unknown resource" });
  }

  const { payload, reason } = verifyAuthDetailed(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated", reason });

  try {
    const redis = getRedis();
    const key = `blob:${resource}:${payload.userId}`;

    if (req.method === "GET") {
      const blob = await getJSON(redis, key);
      return res.status(200).json({ blob: blob || null });
    }

    if (req.method === "PUT") {
      const blob = req.body && typeof req.body.blob === "string" ? req.body.blob : null;
      if (!blob) return res.status(400).json({ error: "Missing blob" });
      await setJSON(redis, key, blob);
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      await redis.del(key);
      return res.status(200).json({ ok: true });
    }

    // Used by "Forgot passphrase? Reset my data" -- deletes this user's
    // encrypted blob so they can start fresh with a new passphrase. Only ever
    // affects the authenticated user's own data.
    if (req.method === "DELETE") {
      await redis.del(key);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
