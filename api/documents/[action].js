const { put, del } = require("@vercel/blob");
const { verifyAuth } = require("../../lib/auth");

async function handleUpload(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const { dataB64 } = req.body || {};
  if (!dataB64 || typeof dataB64 !== "string") {
    return res.status(400).json({ error: "Missing file data." });
  }

  const buffer = Buffer.from(dataB64, "base64");
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
}

async function handleDelete(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const { pathname } = req.body || {};
  if (!pathname || typeof pathname !== "string" || !pathname.startsWith(`docs/${payload.userId}/`)) {
    return res.status(403).json({ error: "Not allowed to delete this file." });
  }
  await del(pathname);
  res.status(200).json({ ok: true });
}

module.exports = async (req, res) => {
  const { action } = req.query;
  try {
    if (action === "upload") return await handleUpload(req, res);
    if (action === "delete") return await handleDelete(req, res);
    res.status(404).json({ error: "Unknown documents action" });
  } catch (e) {
    res.status(500).json({ error: e.message || "Upload/delete failed" });
  }
};
