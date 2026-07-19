const { verifyAuth } = require("../../lib/auth");
const { callClaude } = require("../../lib/claude");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const { role } = req.body || {};
  const roleClean = String(role || "").slice(0, 200).trim();
  if (!roleClean) return res.status(400).json({ ok: false, error: "Missing role" });

  const prompt = `You are a career development coach advising someone who works in or is targeting this role/field: "${roleClean}". Return ONLY valid JSON (no markdown fences, no extra commentary) with this exact shape: {"summary": "2-3 sentences on what's currently most worth focusing on in this field", "topics": ["specific current topic or skill to study", "..."], "certifications": [{"name": "certification name", "provider": "issuing organization", "note": "one sentence on why it's worth pursuing"}]}. Include 6-10 topics, ordered roughly by current relevance, and 4-6 certifications. Keep topics specific and current (e.g. name actual tools, platforms, or techniques relevant in 2026), not generic advice.`;

  res.status(200).json(await callClaude(prompt));
};
