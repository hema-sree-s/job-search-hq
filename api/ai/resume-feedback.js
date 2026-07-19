const { verifyAuth } = require("../../lib/auth");
const { callClaude } = require("../../lib/claude");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const { resumeText } = req.body || {};
  const prompt = `You are an experienced career coach reviewing a resume. Return ONLY valid JSON (no markdown fences, no extra commentary) with this exact shape: {"summary": "2-3 sentence overall assessment", "strengths": ["short actionable point", "..."], "improvements": ["short actionable point", "..."]}. Include at most 4 strengths and 4 improvements. Resume:\n\n${String(resumeText || "").slice(0, 6000)}`;

  res.status(200).json(await callClaude(prompt));
};
