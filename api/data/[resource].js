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

      // Safety net: if non-empty data is about to be replaced with empty
      // data, keep the previous value under a backup key first. If a client
      // bug ever wipes data again, the last good copy survives at
      // backup:<resource>:<userId> and can be restored from the Upstash
      // console by copying it back into blob:<resource>:<userId>.
      try {
        const isEmptyish = (s) => {
          try {
            const v = JSON.parse(s);
            if (v === null || v === undefined) return true;
            if (Array.isArray(v)) return v.length === 0;
            if (typeof v === "object") {
              return Object.values(v).every((x) =>
                x === null || x === undefined || x === "" ||
                (Array.isArray(x) && x.length === 0) ||
                (typeof x === "object" && x !== null && Object.keys(x).length === 0)
              );
            }
            return false;
          } catch (e) { return false; }
        };
        const prev = await getJSON(redis, key);
        if (typeof prev === "string" && prev !== blob && isEmptyish(blob) && !isEmptyish(prev)) {
          await redis.set(`backup:${resource}:${payload.userId}`, prev);
        }
      } catch (e) { /* backup is best-effort; never block a save */ }

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
