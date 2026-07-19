async function callClaude(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      error: "AI coaching isn't configured on this deployment. Add ANTHROPIC_API_KEY in Vercel's environment variables to enable it.",
    };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    clearTimeout(timer);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errText.slice(0, 200)}`);
    }
    const data = await response.json();
    const text = (data.content || []).map((b) => b.text || "").join("\n").trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
    return { ok: true, data: JSON.parse(cleaned) };
  } catch (e) {
    clearTimeout(timer);
    return {
      ok: false,
      error: e.name === "AbortError" ? "The AI coach timed out." : "AI coaching is temporarily unavailable.",
    };
  }
}

module.exports = { callClaude };
