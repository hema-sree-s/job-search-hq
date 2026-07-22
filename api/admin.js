const { getRedis, getJSON, setJSON } = require("../lib/redis");
const { sendEmail } = require("../lib/email");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, must-revalidate");

  const secret = process.env.ADMIN_SECRET;
  const masterKey = process.env.ADMIN_MASTER_KEY;
  const provided = req.query.secret || (req.body && req.body.secret);

  const validSecret = secret && provided === secret;
  const validMaster = masterKey && provided === masterKey;

  if (!validSecret && !validMaster) {
    if (!secret && !masterKey) {
      return res.status(500).json({ error: "ADMIN_SECRET env var is not set." });
    }
    console.log(`[admin] unauthorized attempt from ${req.headers["x-forwarded-for"] || "unknown"}`);
    return res.status(401).json({ error: "Unauthorized -- wrong admin secret." });
  }
  if (validMaster && !validSecret) {
    console.log("[admin] ACCESS VIA MASTER KEY -- remember to reset ADMIN_SECRET");
  }

  try {
    const redis = getRedis();
    const { action, userId } = req.query;

    if (action === "list") {
      let allIds = [];
      try {
        let cursor = 0;
        do {
          const [nextCursor, keys] = await redis.scan(cursor, { match: "user:u_*", count: 100 });
          cursor = parseInt(nextCursor);
          allIds.push(...keys.map((k) => k.replace("user:", "")));
        } while (cursor !== 0);
      } catch (e) {
        allIds = (await redis.smembers("users:index")) || [];
      }
      allIds = [...new Set(allIds)];
      const users = (await Promise.all(allIds.map((id) => getJSON(redis, `user:${id}`)))).filter(Boolean);
      return res.status(200).json({
        adminEmail: process.env.ADMIN_EMAIL || process.env.GMAIL_USER || null,
        usingMasterKey: validMaster && !validSecret,
        users: users.map((u) => ({
          id: u.id, username: u.username, email: u.email || null,
          status: u.status || "active", googleId: !!u.googleId,
          createdAt: u.id ? u.id.split("_")[1] || null : null,
        })).sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (b.status === "pending" && a.status !== "pending") return 1;
          return (b.createdAt || 0) - (a.createdAt || 0);
        })
      });
    }

    if (action === "approve" && userId) {
      const user = await getJSON(redis, `user:${userId}`);
      if (!user) return res.status(404).json({ error: "User not found." });
      user.status = "active";
      await setJSON(redis, `user:${userId}`, user);
      await redis.sadd("users:index", userId);
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "Your Job Search HQ account is approved!",
          html: `<p>Hi ${user.username},</p><p>Your Job Search HQ account has been approved. You can now log in.</p>`,
        }).catch(() => {});
      }
      if (req.method === "GET") {
        return res.redirect(302, `/?approved=1`);
      }
      return res.status(200).json({ ok: true, message: `${user.username} approved.` });
    }

    if ((action === "reject" || action === "delete") && userId) {
      const user = await getJSON(redis, `user:${userId}`);
      if (!user) return res.status(404).json({ error: "User not found." });
      const resources = ["jobs", "resume", "interviews", "learning", "profile", "documents", "contacts", "todos"];
      for (const r of resources) await redis.del(`blob:${r}:${userId}`);
      await redis.del(`user:byUsername:${user.username.toLowerCase()}`);
      if (user.googleId) await redis.del(`user:byGoogleId:${user.googleId}`);
      await redis.del(`user:${userId}`);
      await redis.srem("users:index", userId);
      if (action === "reject" && req.method === "GET") {
        return res.redirect(302, `/?rejected=1`);
      }
      return res.status(200).json({ ok: true, message: `${user.username} deleted.` });
    }

    res.status(400).json({ error: "Unknown admin action." });
  } catch (e) {
    console.error("[admin error]", e.message);
    res.status(500).json({ error: e.message || "Server error" });
  }
};
