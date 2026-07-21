const bcrypt = require("bcryptjs");
const { list: blobList, del: blobDel } = require("@vercel/blob");
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
  const uname = username.trim();
  const redis = getRedis();
  const usernameKey = `user:byUsername:${uname.toLowerCase()}`;

  const existing = await redis.get(usernameKey);
  if (existing) return res.status(409).json({ error: "That username is already taken." });

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const passwordHash = await bcrypt.hash(password, 10);

  await redis.set(usernameKey, id);
  await setJSON(redis, `user:${id}`, { id, username: uname, passwordHash, salt: typeof salt === "string" ? salt : "" });

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
      passwordHash: null, salt: typeof salt === "string" ? salt : "",
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

// Simple per-IP rate limit on credential endpoints: blocks brute-force
// attempts without affecting normal use. 25 attempts per 10 minutes.
async function rateLimited(req) {
  try {
    const redis = getRedis();
    const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
    const key = `rl:auth:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 600);
    return count > 25;
  } catch (e) {
    return false; // never let the limiter itself break auth
  }
}

async function handleChangePassword(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  const redis = getRedis();
  const user = await getJSON(redis, `user:${payload.userId}`);
  if (!user) return res.status(404).json({ error: "Account not found." });

  if (user.passwordHash) {
    // Existing password must be verified before changing it.
    const match = await bcrypt.compare(String(currentPassword || ""), user.passwordHash);
    if (!match) return res.status(401).json({ error: "Current password is incorrect." });
  }
  // Google-only accounts (passwordHash null) may set a password directly --
  // they've already proven identity via their active session.

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await setJSON(redis, `user:${payload.userId}`, user);
  res.status(200).json({ ok: true, message: user.passwordHash ? "Password updated." : "Password set." });
}

async function handleDeleteAccount(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const { confirm } = req.body || {};
  const redis = getRedis();
  const user = await getJSON(redis, `user:${payload.userId}`);
  if (!user) return res.status(404).json({ error: "Account not found." });
  if (confirm !== user.username) {
    return res.status(400).json({ error: "Confirmation text doesn't match your username." });
  }

  // Delete uploaded files from Blob storage (best-effort -- account deletion
  // proceeds even if file cleanup partially fails).
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { blobs } = await blobList({ prefix: `docs/${payload.userId}/` });
      if (blobs && blobs.length) await blobDel(blobs.map((b) => b.url));
    }
  } catch (e) { /* best effort */ }

  const resources = ["jobs", "resume", "interviews", "learning", "profile", "documents"];
  for (const r of resources) await redis.del(`blob:${r}:${payload.userId}`);
  await redis.del(`user:byUsername:${user.username.toLowerCase()}`);
  if (user.googleId) await redis.del(`user:byGoogleId:${user.googleId}`);
  await redis.del(`user:${payload.userId}`);

  res.status(200).json({ ok: true });
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  const { action } = req.query;
  try {
    if (action === "signup" || action === "login" || action === "google") {
      if (await rateLimited(req)) {
        return res.status(429).json({ error: "Too many attempts -- wait a few minutes and try again." });
      }
    }
    if (action === "signup") return await handleSignup(req, res);
    if (action === "login") return await handleLogin(req, res);
    if (action === "google") return await handleGoogle(req, res);
    if (action === "me") return await handleMe(req, res);
    if (action === "change-password") return await handleChangePassword(req, res);
    if (action === "delete-account") return await handleDeleteAccount(req, res);
    res.status(404).json({ error: "Unknown auth action" });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
