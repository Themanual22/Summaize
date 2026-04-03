export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, mode } = req.body;

  // Validate input
  if (!text || text.length < 30) {
    return res.status(400).json({ error: "Text too short" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not found in environment");
    return res.status(500).json({ error: "API key not configured" });
  }

  const modePrompts = {
    concise: "Summarize the following text in 3–5 sharp, punchy bullet points. Cut every unnecessary word. Focus only on the core ideas.",
    detailed: "Write a structured summary: a one-paragraph overview followed by 5–8 bullet points covering key arguments, findings, and conclusions.",
    executive: "Write a 3-sentence executive summary. Plain language. Every word counts. Format: [Context] → [Key Finding] → [Implication].",
  };

  try {
    console.log(`[Summarize] Mode: ${mode}, Text length: ${text.length}`);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [{ role: "user", content: `${modePrompts[mode] || modePrompts.concise}\n\n---\n\n${text}` }],
      }),
    });

    const responseText = await response.text();
    console.log(`[Summarize] Status: ${response.status}, Response: ${responseText}`);

    if (!response.ok) {
      console.error(`[Summarize] Anthropic API error:`, responseText);
      return res.status(response.status).json({
        error: "Anthropic API error",
        status: response.status,
        detail: responseText,
      });
    }

    const data = JSON.parse(responseText);
    console.log(`[Summarize] Success:`, data);

    return res.status(200).json({ summary: data.content?.[0]?.text || "No summary returned." });
  } catch (err) {
    console.error("[Summarize] Exception:", err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
}