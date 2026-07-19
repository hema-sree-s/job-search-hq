const { getRedis, getJSON, setJSON } = require("../../lib/redis");
const { signToken } = require("../../lib/auth");
const { verifyGoogleIdToken } = require("../../lib/googleAuth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { credential, salt } = req.body || {};
    if (!credential) return res.status(400).json({ error: "Missing Google credential." });

    let payload;
    try {
      payload = await verifyGoogleIdToken(credential);
    } catch (e) {
      return res.status(401).json({ error: "Could not verify that Google sign-in. Try again." });
    }
    if (!payload || !payload.sub || !payload.email_verified) {
      return res.status(401).json({ error: "Could not verify that Google account." });
    }

    const redis = getRedis();
    const googleKey = `user:byGoogleId:${payload.sub}`;
    let userId = await redis.get(googleKey);
    let isNewUser = false;

    if (!userId) {
      // First time this Google account has signed in here — create a user
      // record. No password/hash is stored for Google accounts; identity is
      // Google's job. The encryption salt still comes from the browser
      // (generated fresh, just like password signup) since the *data*
      // encryption key is always derived from a passphrase the user sets,
      // never from Google — otherwise the server could read your data.
      if (!salt || typeof salt !== "string") {
        return res.status(400).json({ error: "Missing encryption setup — try reloading the page." });
      }
      const base = (payload.email || "user").split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 24) || "user";
      let uname = base;
      let n = 1;
      while (await redis.get(`user:byUsername:${uname.toLowerCase()}`)) {
        n += 1;
        uname = `${base}${n}`;
      }
      const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await redis.set(`user:byUsername:${uname.toLowerCase()}`, id);
      await redis.set(googleKey, id);
      await setJSON(redis, `user:${id}`, {
        id, username: uname, googleId: payload.sub, email: payload.email || null,
        passwordHash: null, salt,
      });
      userId = id;
      isNewUser = true;
    }

    const user = await getJSON(redis, `user:${userId}`);
    if (!user) return res.status(500).json({ error: "Account lookup failed." });

    res.status(200).json({
      token: signToken(user.id, user.username),
      username: user.username,
      salt: user.salt,
      isNewUser,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
