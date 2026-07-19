const { put } = require("@vercel/blob");
const { verifyAuth } = require("../../lib/auth");

// Files land in Blob storage as opaque AES-256-GCM ciphertext, encrypted in
// the browser before it ever reaches this route -- this server only ever
// sees and stores unreadable bytes, same as the rest of the app's data.
// Storage uses Blob's public access mode (so the browser can fetch the
// ciphertext directly without a separate authenticated download route), but
// "public" only means "reachable if you know/guess the random URL" -- since
// the bytes are ciphertext, that alone reveals nothing without your password.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  try {
    const { dataB64 } = req.body || {};
    if (!dataB64 || typeof dataB64 !== "string") {
      return res.status(400).json({ error: "Missing file data." });
    }

    const buffer = Buffer.from(dataB64, "base64");
    // Vercel's server-side request body limit is 4.5MB; stay comfortably under it.
    if (buffer.length > 4 * 1024 * 1024) {
      return res.status(413).json({ error: "That file is too large -- keep uploads under 4MB." });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        error: "File storage isn't configured. In Vercel, go to Storage → Connect Database → Blob, then redeploy.",
      });
    }

    const blob = await put(`docs/${payload.userId}/file`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/octet-stream",
    });

    res.status(200).json({ url: blob.url, pathname: blob.pathname });
  } catch (e) {
    res.status(500).json({ error: e.message || "Upload failed" });
  }
};
