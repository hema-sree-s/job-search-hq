const bcrypt = require("bcryptjs");
const { getRedis, setJSON } = require("../../lib/redis");
const { signToken } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username, password, salt } = req.body || {};

    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return res.status(400).json({ error: "Choose a username of at least 2 characters." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    if (!salt || typeof salt !== "string") {
      return res.status(400).json({ error: "Missing encryption setup — try reloading the page." });
    }

    const uname = username.trim();
    const redis = getRedis();
    const usernameKey = `user:byUsername:${uname.toLowerCase()}`;

    const existing = await redis.get(usernameKey);
    if (existing) return res.status(409).json({ error: "That username is already taken." });

    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Note: we only ever store the bcrypt hash (for login checks) and the
    // salt (not secret — needed so the browser can re-derive the same
    // encryption key on future logins). We never store the password itself,
    // and we never see the encryption key or plaintext resume/job/interview
    // content — those are encrypted in the browser before they reach us.
    await redis.set(usernameKey, id);
    await setJSON(redis, `user:${id}`, { id, username: uname, passwordHash, salt });

    res.status(200).json({ token: signToken(id, uname), username: uname, salt });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
