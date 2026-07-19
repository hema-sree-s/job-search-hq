const bcrypt = require("bcryptjs");
const { getRedis, getJSON } = require("../../lib/redis");
const { signToken } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username, password } = req.body || {};
    const redis = getRedis();
    const userId = await redis.get(`user:byUsername:${String(username || "").toLowerCase()}`);
    if (!userId) return res.status(401).json({ error: "Invalid username or password." });

    const user = await getJSON(redis, `user:${userId}`);
    if (!user) return res.status(401).json({ error: "Invalid username or password." });

    const match = await bcrypt.compare(String(password || ""), user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid username or password." });

    res.status(200).json({ token: signToken(user.id, user.username), username: user.username, salt: user.salt });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
