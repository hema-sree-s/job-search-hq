const bcrypt = require("bcryptjs");
const { list: blobList, del: blobDel } = require("@vercel/blob");
const { getRedis, getJSON, setJSON } = require("../../lib/redis");
const { signToken, verifyAuth } = require("../../lib/auth");
const { verifyGoogleIdToken } = require("../../lib/googleAuth");
const { sendEmail, emailConfigured } = require("../../lib/email");
const crypto = require("crypto");

async function handleSignup(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { username, password, salt, email } = req.body || {};

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
  await setJSON(redis, `user:${id}`, {
    id, username: uname, passwordHash,
    email: (typeof email === "string" && email.includes("@")) ? email.trim() : null,
    salt: typeof salt === "string" ? salt : "",
    status: "pending",   // "pending" | "active"
  });
  // NOTE: do NOT add to users:index yet -- pending users can't log in and
  // shouldn't receive digest emails until an admin approves them.

  // Email the admin so they can approve or reject.
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
  if (adminEmail) {
    const origin = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
    const approveLink = `${origin}/api/auth/admin?action=approve&userId=${id}&secret=${process.env.ADMIN_SECRET || ""}`;
    const rejectLink  = `${origin}/api/auth/admin?action=reject&userId=${id}&secret=${process.env.ADMIN_SECRET || ""}`;
    const { sendEmail } = require("../../lib/email");
    await sendEmail({
      to: adminEmail,
      subject: `New signup request: ${uname}`,
      html: `<p>Someone wants to join Job Search HQ.</p>
             <p><b>Username:</b> ${uname}<br>
             <b>Email:</b> ${(typeof email === "string" && email.includes("@")) ? email.trim() : "(none provided)"}</p>
             <p>
               <a href="${approveLink}" style="background:#B9A0EA;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-right:8px">✓ Approve</a>
               <a href="${rejectLink}" style="background:#D97862;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">✗ Reject</a>
             </p>
             <p style="font-size:12px;color:#999">Approve link activates the account. Reject permanently deletes it.</p>`,
    }).catch((e) => console.log("[signup-notify] email failed:", e.message));
  }

  res.status(200).json({ pending: true, message: "Your account request has been sent. You'll be able to log in once an admin approves it -- this usually takes less than a day." });
}

async function handleLogin(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { username, password } = req.body || {};
  const redis = getRedis();
  const userId = await redis.get(`user:byUsername:${String(username || "").toLowerCase()}`);
  if (!userId) return res.status(401).json({ error: "Invalid username or password." });

  const user = await getJSON(redis, `user:${userId}`);
  if (!user) return res.status(401).json({ error: "Invalid username or password." });
  if (user.status === "pending") {
    return res.status(403).json({ error: "Your account is pending admin approval. You'll receive an email when it's approved." });
  }
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
    // New Google user -- create as pending, same as password signup.
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
      passwordHash: null, salt: "",
      status: "pending",
    });
    // Do NOT add to users:index yet -- only active accounts go there.
    userId = id;

    // Email admin about the new signup request.
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
    if (adminEmail) {
      const { sendEmail } = require("../../lib/email");
      const origin = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
      const approveLink = `${origin}/api/auth/admin?action=approve&userId=${id}&secret=${process.env.ADMIN_SECRET || ""}`;
      const rejectLink  = `${origin}/api/auth/admin?action=reject&userId=${id}&secret=${process.env.ADMIN_SECRET || ""}`;
      await sendEmail({
        to: adminEmail,
        subject: `New Google signup request: ${uname}`,
        html: `<p>A Google account wants to join Job Search HQ.</p>
               <p><b>Username:</b> ${uname}<br><b>Email:</b> ${payload.email || "unknown"}</p>
               <p>
                 <a href="${approveLink}" style="background:#B9A0EA;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-right:8px">✓ Approve</a>
                 <a href="${rejectLink}" style="background:#D97862;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">✗ Reject</a>
               </p>`,
      }).catch((e) => console.log("[google-signup-notify] email failed:", e.message));
    }

    return res.status(200).json({
      pending: true,
      message: "Your account request has been sent. You can log in once an admin approves it.",
    });
  }

  const user = await getJSON(redis, `user:${userId}`);
  if (!user) return res.status(500).json({ error: "Account lookup failed." });

  // Block existing Google users who are still pending.
  if (user.status === "pending") {
    return res.status(403).json({ error: "Your account is pending admin approval. You'll be notified when it's approved." });
  }

  res.status(200).json({ token: signToken(user.id, user.username), username: user.username, salt: user.salt || "" });
}

async function handleMe(req, res) {
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });
  const redis = getRedis();
  const user = await getJSON(redis, `user:${payload.userId}`);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  try { await redis.sadd("users:index", user.id); } catch (e) { /* best effort */ }
  res.status(200).json({ username: user.username, salt: user.salt, email: user.email || null });
}

async function handleSetEmail(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });
  const { email } = req.body || {};
  const clean = String(email || "").trim();
  if (clean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return res.status(400).json({ error: "That doesn't look like a valid email address." });
  }
  const redis = getRedis();
  const user = await getJSON(redis, `user:${payload.userId}`);
  if (!user) return res.status(404).json({ error: "Account not found." });
  user.email = clean || null;
  await setJSON(redis, `user:${payload.userId}`, user);
  res.status(200).json({ ok: true, email: user.email });
}

async function handleRequestReset(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { username } = req.body || {};
  const generic = { ok: true, message: "If that account has an email on file, a reset link has been sent." };
  if (!emailConfigured()) {
    return res.status(200).json({ ok: false, message: "Password reset by email isn't set up on this deployment (BREVO_API_KEY / EMAIL_FROM not configured)." });
  }
  try {
    const redis = getRedis();
    const userId = await redis.get(`user:byUsername:${String(username || "").toLowerCase()}`);
    if (!userId) { console.log("[reset-email] no such username"); return res.status(200).json(generic); }
    const user = await getJSON(redis, `user:${userId}`);
    if (!user || !user.email) { console.log("[reset-email] account has no email on file"); return res.status(200).json(generic); }

    const token = crypto.randomBytes(24).toString("hex");
    await redis.set(`reset:${token}`, userId, { ex: 1800 }); // 30 minutes
    const origin = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
    const link = `${origin}/?reset=${token}`;
    const result = await sendEmail({
      to: user.email,
      subject: "Reset your Job Search HQ password",
      html: `<p>Hi ${user.username},</p><p>Someone (hopefully you) requested a password reset for your Job Search HQ account. This link works for 30 minutes:</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });
    // Server-side log only -- the client always gets the generic message, so
    // this can't be used to probe accounts, but Vercel's logs show the truth.
    console.log("[reset-email]", result.ok ? `sent to ${user.email}` : `FAILED: ${result.error}`);
    res.status(200).json(generic);
  } catch (e) {
    console.log("[reset-email] handler error:", e.message);
    res.status(200).json(generic); // never leak errors that reveal account existence
  }
}

async function handleResetPassword(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { token, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }
  const redis = getRedis();
  const userId = await redis.get(`reset:${String(token || "")}`);
  if (!userId) return res.status(400).json({ error: "That reset link is invalid or has expired -- request a new one." });
  const user = await getJSON(redis, `user:${userId}`);
  if (!user) return res.status(400).json({ error: "Account not found." });
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await setJSON(redis, `user:${userId}`, user);
  await redis.del(`reset:${String(token)}`);
  res.status(200).json({ ok: true, message: "Password reset -- you can log in now." });
}

// Simple per-IP rate limit on credential endpoints: blocks brute-force
// attempts without affecting normal use. Default: 50 attempts per 10 minutes.
// Configurable via AUTH_RATE_LIMIT env var; set it to 0 to disable entirely
// (e.g. temporarily while testing).
async function rateLimited(req) {
  try {
    const limit = process.env.AUTH_RATE_LIMIT !== undefined ? parseInt(process.env.AUTH_RATE_LIMIT, 10) : 50;
    if (!limit || isNaN(limit)) return false; // 0 or invalid = disabled
    const redis = getRedis();
    const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
    const key = `rl:auth:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 600);
    return count > limit;
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

  const hadPassword = !!user.passwordHash;
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await setJSON(redis, `user:${payload.userId}`, user);
  res.status(200).json({ ok: true, message: hadPassword ? "Password updated." : "Password set -- you can now also log in with username + password." });
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

  const resources = ["jobs", "resume", "interviews", "learning", "profile", "documents", "contacts", "todos"];
  for (const r of resources) await redis.del(`blob:${r}:${payload.userId}`);
  await redis.srem("users:index", payload.userId);
  await redis.del(`user:byUsername:${user.username.toLowerCase()}`);
  if (user.googleId) await redis.del(`user:byGoogleId:${user.googleId}`);
  await redis.del(`user:${payload.userId}`);

  res.status(200).json({ ok: true });
}

async function handleAdmin(req, res) {
  // Admin secret protects these actions. Set ADMIN_SECRET in Vercel env vars.
  // The approve/reject links in signup emails include it automatically.
  const secret = process.env.ADMIN_SECRET;
  const masterKey = process.env.ADMIN_MASTER_KEY; // emergency fallback bypass
  const provided = req.query.secret || (req.body && req.body.secret);

  const validSecret = secret && provided === secret;
  const validMaster = masterKey && provided === masterKey;

  if (!validSecret && !validMaster) {
    if (!secret && !masterKey) {
      return res.status(500).json({ error: "ADMIN_SECRET env var is not set. Add it in Vercel env vars and redeploy." });
    }
    // Log failed attempts to Vercel logs so the admin can see them
    console.log(`[admin] unauthorized attempt from ${req.headers["x-forwarded-for"] || "unknown"}`);
    return res.status(401).json({ error: "Unauthorized -- wrong admin secret." });
  }
  if (validMaster && !validSecret) {
    // Emergency access -- log it so you remember to reset ADMIN_SECRET after
    console.log("[admin] ACCESS VIA MASTER KEY -- remember to reset ADMIN_SECRET");
  }

  const redis = getRedis();
  const { action: adminAction, userId } = req.query;

  // List all users (for the admin panel in the app)
  if (adminAction === "list") {
    // Scan all user keys (pending users aren't in users:index yet)
    let allIds = [];
    try {
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(cursor, { match: "user:u_*", count: 100 });
        cursor = parseInt(nextCursor);
        allIds.push(...keys.map((k) => k.replace("user:", "")));
      } while (cursor !== 0);
    } catch (e) {
      // Fallback if scan not supported: use the index we have
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

  // Approve a pending account
  if (adminAction === "approve" && userId) {
    const user = await getJSON(redis, `user:${userId}`);
    if (!user) return res.status(404).json({ error: "User not found." });
    user.status = "active";
    await setJSON(redis, `user:${userId}`, user);
    await redis.sadd("users:index", userId);
    const { sendEmail } = require("../../lib/email");
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Your Job Search HQ account is approved!",
        html: `<p>Hi ${user.username},</p><p>Your Job Search HQ account has been approved. You can now log in at <a href="https://${req.headers["x-forwarded-host"] || req.headers.host}">Job Search HQ</a>.</p>`,
      }).catch(() => {});
    }
    // Redirect so clicking the email link shows a nice page
    if (req.method === "GET") return res.redirect(302, `/?approved=1`);
    return res.status(200).json({ ok: true, message: `${user.username} approved.` });
  }

  // Reject/delete any account
  if ((adminAction === "reject" || adminAction === "delete") && userId) {
    const user = await getJSON(redis, `user:${userId}`);
    if (!user) return res.status(404).json({ error: "User not found." });
    // Clean up everything
    const resources = ["jobs", "resume", "interviews", "learning", "profile", "documents", "contacts", "todos"];
    for (const r of resources) await redis.del(`blob:${r}:${userId}`);
    await redis.del(`user:byUsername:${user.username.toLowerCase()}`);
    if (user.googleId) await redis.del(`user:byGoogleId:${user.googleId}`);
    await redis.del(`user:${userId}`);
    await redis.srem("users:index", userId);
    if (adminAction === "reject" && req.method === "GET") return res.redirect(302, `/?rejected=1`);
    return res.status(200).json({ ok: true, message: `${user.username} deleted.` });
  }

  res.status(400).json({ error: "Unknown admin action." });
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  const { action } = req.query;
  try {
    if (action === "signup" || action === "login" || action === "google" || action === "request-reset") {
      if (await rateLimited(req)) {
        return res.status(429).json({ error: "Too many attempts -- wait a few minutes and try again." });
      }
    }
    if (action === "signup") return await handleSignup(req, res);
    if (action === "login") return await handleLogin(req, res);
    if (action === "google") return await handleGoogle(req, res);
    if (action === "me") return await handleMe(req, res);
    if (action === "change-password") return await handleChangePassword(req, res);
    if (action === "set-email") return await handleSetEmail(req, res);
    if (action === "request-reset") return await handleRequestReset(req, res);
    if (action === "reset-password") return await handleResetPassword(req, res);
    if (action === "delete-account") return await handleDeleteAccount(req, res);
    if (action === "admin") return await handleAdmin(req, res);
    res.status(404).json({ error: "Unknown auth action" });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
