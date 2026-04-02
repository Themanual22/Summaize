export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, mode } = req.body;
  if (!text || text.length < 30) {
    return res.status(400).json({ error: "Text too short" });
  }

  const modePrompts = {
    concise:
      "Summarize the following text in 3–5 sharp, punchy bullet points. Cut every unnecessary word. Focus only on the core ideas.",
    detailed:
      "Write a structured summary: a one-paragraph overview followed by 5–8 bullet points covering key arguments, findings, and conclusions.",
    executive:
      "Write a 3-sentence executive summary. Plain language. Every word counts. Format: [Context] → [Key Finding] → [Implication].",
  };

  const prompt = modePrompts[mode] || modePrompts.concise;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: `${prompt}\n\n---\n\n${text}` }],
      }),
    });

    if (!response.ok) throw new Error("Anthropic API error");
    const data = await response.json();
    const summary = data.content?.[0]?.text || "No summary returned.";
    return res.status(200).json({ summary });
  } catch (err) {
    return res.status(500).json({ error: "Summarization failed" });
  }
}
