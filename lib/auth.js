const jwt = require("jsonwebtoken");

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error(
      "JWT_SECRET environment variable is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy."
    );
  }
  return s;
}

function signToken(userId, username) {
  return jwt.sign({ userId, username }, getSecret(), { expiresIn: "30d" });
}

// Returns the decoded payload ({ userId, username }) or null if the request
// isn't authenticated / the token is invalid or expired.
function verifyAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret());
  } catch (e) {
    return null;
  }
}

// Like verifyAuth, but also explains WHY it failed -- used to surface a real
// diagnosis to the user instead of a generic 401.
function verifyAuthDetailed(req) {
  const header = req.headers.authorization || "";
  if (!header) return { payload: null, reason: "no Authorization header was sent by the browser" };
  if (!header.startsWith("Bearer ")) return { payload: null, reason: "Authorization header was malformed" };
  const token = header.slice(7);
  try {
    return { payload: jwt.verify(token, getSecret()), reason: null };
  } catch (e) {
    // e.message examples: "jwt expired", "invalid signature" (= token was
    // signed with a different JWT_SECRET than the current one)
    return { payload: null, reason: `token rejected: ${e.message}` };
  }
}

module.exports = { signToken, verifyAuth, verifyAuthDetailed };
