const { verifyAuth } = require("../../lib/auth");
const { callClaude } = require("../../lib/claude");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const { jobDesc, resumeText } = req.body || {};
  const prompt = `You are a career coach helping a candidate tailor their resume to a specific job. Return ONLY valid JSON (no markdown fences): {"summary": "2-3 sentence fit assessment", "tips": ["short actionable tailoring tip", "..."]}. Include at most 5 tips. Job description:\n\n${String(jobDesc || "").slice(0, 4000)}\n\nResume:\n\n${String(resumeText || "").slice(0, 4000)}`;

  res.status(200).json(await callClaude(prompt));
};
