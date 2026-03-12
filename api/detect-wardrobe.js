export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Missing OPENAI_API_KEY environment variable." });
    }

    const { imageBase64, mimeType, profile } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64." });
    }

    const prompt = `
You are an AI fashion vision system.

Analyze the clothing item in the image carefully.

Look at the actual pixels and determine:

1. Clothing category
2. Dominant color
3. Secondary color if visible
4. Short style description

Rules:
- Base color must come from the visible garment
- Do not guess based on style
- Focus only on the clothing item

Return ONLY JSON:

{
  "suggestedCategory": "top | bottom | dress | shoes | jacket | accessory",
  "suggestedColor": "dominant color",
  "secondaryColor": "optional secondary color or null",
  "suggestedStyleNote": "short style description",
  "confidenceLabel": "High confidence | Medium confidence | Low confidence",
  "reasons": ["short visual reasons"],
  "alternativeCategories": []
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(500).json({
        error: "OpenAI request failed",
        details: errorText,
      });
    }

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error",
    });
  }
}
