// AI caller with two supported providers, tried in this order:
//   1. Anthropic Claude  -- if ANTHROPIC_API_KEY is set (paid, higher quality)
//   2. Google Gemini     -- if GEMINI_API_KEY is set (FREE tier available at
//      https://aistudio.google.com -- no credit card needed)
// If neither is set, AI features politely explain how to enable them for free.
// The rest of the app never needs to know which provider answered.

function stripFences(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
}

async function callAnthropic(prompt, signal) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    signal,
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText.slice(0, 200)}`);
  }
  const data = await response.json();
  return (data.content || []).map((b) => b.text || "").join("\n").trim();
}

async function callGemini(prompt, signal) {
  // "gemini-flash-latest" is Google's auto-updating alias for their current
  // Flash model -- using it means model retirements never break this app.
  // If a specific model is pinned via GEMINI_MODEL, try that first.
  const candidates = process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL, "gemini-flash-latest"]
    : ["gemini-flash-latest", "gemini-3.5-flash", "gemini-3.1-flash-lite"];

  let lastErr = null;
  for (const model of candidates) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      const parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
      return parts.map((p) => p.text || "").join("\n").trim();
    }
    const errText = await response.text();
    if (response.status === 429) {
      throw Object.assign(new Error("rate-limited"), { isRateLimit: true });
    }
    lastErr = new Error(`Gemini API error (${response.status}) on ${model}: ${errText.slice(0, 160)}`);
    // Only fall through to the next candidate for model-not-found errors.
    if (response.status !== 404) throw lastErr;
  }
  throw lastErr || new Error("Gemini call failed");
}

async function callClaude(prompt) {
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasAnthropic && !hasGemini) {
    return {
      ok: false,
      error:
        "AI features aren't configured yet. You can enable them for FREE: get a Gemini API key at aistudio.google.com (no credit card needed), then add it as GEMINI_API_KEY in Vercel's environment variables and redeploy.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const text = hasAnthropic
      ? await callAnthropic(prompt, controller.signal)
      : await callGemini(prompt, controller.signal);
    clearTimeout(timer);
    return { ok: true, data: JSON.parse(stripFences(text)) };
  } catch (e) {
    clearTimeout(timer);
    if (e.isRateLimit) {
      return { ok: false, error: "The free AI tier is briefly rate-limited -- wait a minute and try again." };
    }
    const detail = (e.message || "").slice(0, 160);
    return {
      ok: false,
      error: e.name === "AbortError"
        ? "The AI coach timed out."
        : "AI request failed" + (detail ? ": " + detail : ". Check the API key in Vercel and redeploy."),
    };
  }
}

module.exports = { callClaude };
