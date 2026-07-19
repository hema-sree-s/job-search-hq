const { getRedis, getJSON } = require("../../lib/redis");
const { verifyAuth } = require("../../lib/auth");

module.exports = async (req, res) => {
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  try {
    const redis = getRedis();
    const user = await getJSON(redis, `user:${payload.userId}`);
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    res.status(200).json({ username: user.username, salt: user.salt });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
