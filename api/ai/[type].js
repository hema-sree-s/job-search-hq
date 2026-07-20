const { verifyAuth } = require("../../lib/auth");
const { callClaude } = require("../../lib/claude");

function resumeFeedbackPrompt(body) {
  const { resumeText } = body || {};
  return `You are an experienced career coach reviewing a resume. Return ONLY valid JSON (no markdown fences, no extra commentary) with this exact shape: {"summary": "2-3 sentence overall assessment", "strengths": ["short actionable point", "..."], "improvements": ["short actionable point", "..."]}. Include at most 4 strengths and 4 improvements. Resume:\n\n${String(resumeText || "").slice(0, 6000)}`;
}

function matchTipsPrompt(body) {
  const { jobDesc, resumeText } = body || {};
  return `You are a career coach helping a candidate tailor their resume to a specific job. Return ONLY valid JSON (no markdown fences): {"summary": "2-3 sentence fit assessment", "tips": ["short actionable tailoring tip", "..."]}. Include at most 5 tips. Job description:\n\n${String(jobDesc || "").slice(0, 4000)}\n\nResume:\n\n${String(resumeText || "").slice(0, 4000)}`;
}

function learningSuggestionsPrompt(body) {
  const { role } = body || {};
  const roleClean = String(role || "").slice(0, 200).trim();
  return `You are a career development coach advising someone who works in or is targeting this role/field: "${roleClean}". Return ONLY valid JSON (no markdown fences, no extra commentary) with this exact shape: {"summary": "2-3 sentences on what's currently most worth focusing on in this field", "topics": ["specific current topic or skill to study", "..."], "certifications": [{"name": "certification name", "provider": "issuing organization", "note": "one sentence on why it's worth pursuing"}]}. Include 6-10 topics, ordered roughly by current relevance, and 4-6 certifications. Keep topics specific and current (e.g. name actual tools, platforms, or techniques relevant in 2026), not generic advice.`;
}

function profileSuggestionsPrompt(body) {
  const { resumeText } = body || {};
  return `You are a career coach helping someone write a professional profile summary from their resume. Return ONLY valid JSON (no markdown fences): {"headline": "a punchy 3-8 word professional headline based on their most recent/prominent role", "bio": "a 2-3 sentence first-person professional summary", "skills": ["skill", "..."]}. Include at most 10 of their most relevant, specific skills (real tools/technologies/methods mentioned or clearly implied, not generic filler). Resume:\n\n${String(resumeText || "").slice(0, 6000)}`;
}

const PROMPT_BUILDERS = {
  "resume-feedback": resumeFeedbackPrompt,
  "match-tips": matchTipsPrompt,
  "learning-suggestions": learningSuggestionsPrompt,
  "profile-suggestions": profileSuggestionsPrompt,
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const payload = verifyAuth(req);
  if (!payload) return res.status(401).json({ error: "Not authenticated" });

  const { type } = req.query;
  const buildPrompt = PROMPT_BUILDERS[type];
  if (!buildPrompt) return res.status(404).json({ error: "Unknown AI action" });

  if (type === "learning-suggestions" && !String((req.body || {}).role || "").trim()) {
    return res.status(400).json({ ok: false, error: "Missing role" });
  }

  res.status(200).json(await callClaude(buildPrompt(req.body)));
};