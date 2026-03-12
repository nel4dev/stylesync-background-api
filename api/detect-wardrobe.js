export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY environment variable.",
      });
    }

    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64.",
      });
    }

    const safeMimeType = mimeType || "image/jpeg";
    const dataUrl = `data:${safeMimeType};base64,${String(imageBase64).replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    )}`;

    const prompt = `
You are a wardrobe-analysis assistant for a fashion app.

Analyze ONLY the clothing item in the image.
Ignore the background completely.
If the image has transparent background, focus only on the visible garment.
Do not describe the model, person, hands, floor, wall, hanger, or lighting.
Pick the actual dominant garment color, not "neutral" unless the item itself is truly beige/taupe/tan/cream-neutral.

Return ONLY valid JSON with this exact shape:
{
  "suggestedCategory": "top" | "bottom" | "dress" | "shoes" | "jacket" | "accessory",
  "suggestedColor": string,
  "suggestedStyleNote": string,
  "confidenceLabel": string,
  "reasons": string[],
  "alternativeCategories": string[]
}

Rules:
- suggestedCategory must be one of: top, bottom, dress, shoes, jacket, accessory
- suggestedColor should be a simple clothing color like:
  black, white, cream, grey, blue, navy, light blue, green, olive, red, burgundy, pink, brown, beige, tan, purple, yellow, orange
- suggestedStyleNote should be short and fashion-focused, like:
  "casual cotton t-shirt", "blue denim jeans", "minimal white sneakers"
- confidenceLabel should be one of:
  "High confidence", "Medium confidence", "Low confidence"
- reasons should be 2 to 4 short bullet-style reasons
- alternativeCategories should contain 1 to 3 options from the allowed category list
- If it is clearly a t-shirt, choose "top"
- If it is clearly jeans or trousers, choose "bottom"
- If it is clearly outerwear, choose "jacket"
- If it is clearly footwear, choose "shoes"
- Do not output markdown
- Do not output explanation text outside JSON
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
              {
                type: "input_image",
                image_url: dataUrl,
                detail: "high",
              },
            ],
          },
        ],
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

    const outputText =
      data.output_text ||
      data.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text ||
      "";

    if (!outputText) {
      return res.status(500).json({
        error: "No analysis text returned from OpenAI.",
        details: data,
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(outputText);
    } catch (parseError) {
      return res.status(500).json({
        error: "OpenAI returned invalid JSON.",
        details: outputText,
      });
    }

    const allowedCategories = [
      "top",
      "bottom",
      "dress",
      "shoes",
      "jacket",
      "accessory",
    ];

    const normalizedCategory = allowedCategories.includes(parsed?.suggestedCategory)
      ? parsed.suggestedCategory
      : "top";

    const normalizedAlternatives = Array.isArray(parsed?.alternativeCategories)
      ? parsed.alternativeCategories.filter((item) =>
          allowedCategories.includes(item)
        ).slice(0, 3)
      : [];

    return res.status(200).json({
      suggestedCategory: normalizedCategory,
      suggestedColor: parsed?.suggestedColor || "neutral",
      suggestedStyleNote: parsed?.suggestedStyleNote || "",
      confidenceLabel: parsed?.confidenceLabel || "Medium confidence",
      reasons: Array.isArray(parsed?.reasons)
        ? parsed.reasons.slice(0, 4)
        : ["The garment shape and visible details were analyzed."],
      alternativeCategories:
        normalizedAlternatives.length > 0 ? normalizedAlternatives : ["top"],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error",
    });
  }
}
