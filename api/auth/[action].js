const bcrypt = require("bcryptjs");
const { getRedis, getJSON, setJSON } = require("../../lib/redis");
const { signToken, verifyAuth } = require("../../lib/auth");
const { verifyGoogleIdToken } = require("../../lib/googleAuth");

async function handleSignup(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
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

  await redis.set(usernameKey, id);
  await setJSON(redis, `user:${id}`, { id, username: uname, passwordHash, salt });

  res.status(200).json({ token: signToken(id, uname), username: uname, salt });
}

async function handleLogin(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { username, password } = req.body || {};
  const redis = getRedis();
  const userId = await redis.get(`user:byUsername:${String(username || "").toLowerCase()}`);
  if (!userId) return res.status(401).json({ error: "Invalid username or password." });

  const user = await getJSON(redis, `user:${userId}`);
  if (!user) return res.status(401).json({ error: "Invalid username or password." });
  if (!user.passwordHash) {
    return res.status(401).json({ error: "This account uses Google Sign-In -- click \"Continue with Google\" instead of logging in with a password." });
  }

  const match = await bcrypt.compare(String(password || ""), user.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid username or password." });

  res.status(200).json({ token: signToken(user.id, user.username), username: user.username, salt: user.salt });
}

async function handleGoogle(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
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

  res.status(200).json({ token: signToken(user.id, user.username), username: user.username, salt: user.salt, isNewUser });
}

async function handleMe(req, res) {
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });
  const redis = getRedis();
  const user = await getJSON(redis, `user:${payload.userId}`);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.status(200).json({ username: user.username, salt: user.salt });
}

module.exports = async (req, res) => {
  const { action } = req.query;
  try {
    if (action === "signup") return await handleSignup(req, res);
    if (action === "login") return await handleLogin(req, res);
    if (action === "google") return await handleGoogle(req, res);
    if (action === "me") return await handleMe(req, res);
    res.status(404).json({ error: "Unknown auth action" });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};