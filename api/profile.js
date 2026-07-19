const { getRedis, getJSON, setJSON } = require("../lib/redis");
const { verifyAuth } = require("../lib/auth");

module.exports = async (req, res) => {
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  try {
    const redis = getRedis();
    const key = `blob:profile:${payload.userId}`;

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

    res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
