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

module.exports = { signToken, verifyAuth };
