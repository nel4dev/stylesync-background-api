const ALLOWED_CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "shoes",
  "jacket",
  "accessory",
];

const ALLOWED_COLORS = [
  "neutral",
  "black",
  "white",
  "cream",
  "blue",
  "green",
  "red",
  "pink",
  "brown",
  "purple",
  "grey",
];

function normalizeCategory(value = "") {
  const normalized = String(value || "").trim().toLowerCase();

  if (ALLOWED_CATEGORIES.includes(normalized)) {
    return normalized;
  }

  if (
    ["shirt", "tshirt", "t-shirt", "tee", "blouse", "top", "sweater"].includes(
      normalized
    )
  ) {
    return "top";
  }

  if (
    ["pants", "trousers", "jeans", "skirt", "shorts", "bottom"].includes(
      normalized
    )
  ) {
    return "bottom";
  }

  if (["coat", "blazer", "hoodie", "cardigan", "jacket"].includes(normalized)) {
    return "jacket";
  }

  if (["heels", "boots", "sandals", "sneakers", "shoes"].includes(normalized)) {
    return "shoes";
  }

  if (["bag", "hat", "belt", "jewelry", "jewellery", "accessory"].includes(normalized)) {
    return "accessory";
  }

  return "top";
}

function normalizeColor(value = "") {
  const normalized = String(value || "").trim().toLowerCase();

  if (ALLOWED_COLORS.includes(normalized)) {
    return normalized;
  }

  if (normalized.includes("navy")) return "blue";
  if (normalized.includes("light blue")) return "blue";
  if (normalized.includes("sky blue")) return "blue";
  if (normalized.includes("dark blue")) return "blue";
  if (normalized.includes("blue")) return "blue";

  if (normalized.includes("gray")) return "grey";
  if (normalized.includes("grey")) return "grey";

  if (normalized.includes("beige")) return "cream";
  if (normalized.includes("ivory")) return "cream";
  if (normalized.includes("off-white")) return "cream";
  if (normalized.includes("off white")) return "cream";
  if (normalized.includes("cream")) return "cream";

  if (normalized.includes("black")) return "black";
  if (normalized.includes("white")) return "white";
  if (normalized.includes("green")) return "green";
  if (normalized.includes("red")) return "red";
  if (normalized.includes("pink")) return "pink";
  if (normalized.includes("brown")) return "brown";
  if (normalized.includes("purple")) return "purple";

  return "neutral";
}

function normalizeAlternatives(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeCategory(item))
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .slice(0, 3);
}

function extractTextFromResponsesApi(data) {
  if (!data) return "";

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (Array.isArray(data.output)) {
    const parts = [];

    for (const item of data.output) {
      if (!item || !Array.isArray(item.content)) continue;

      for (const contentItem of item.content) {
        if (
          contentItem &&
          contentItem.type === "output_text" &&
          typeof contentItem.text === "string"
        ) {
          parts.push(contentItem.text);
        }
      }
    }

    if (parts.length > 0) {
      return parts.join("\n").trim();
    }
  }

  return "";
}

function extractJsonObject(text = "") {
  const trimmed = String(text || "").trim();

  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {}

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  const possibleJson = trimmed.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(possibleJson);
  } catch {
    return null;
  }
}

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

    const { imageBase64, mimeType, fileName } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64." });
    }

    const safeMimeType =
      typeof mimeType === "string" && mimeType.trim()
        ? mimeType
        : "image/jpeg";

    const prompt = `
You are a fashion wardrobe detector.

Analyze the clothing item in this image.
Focus on the MAIN garment only.
Ignore the background as much as possible.
Ignore shadows, floor, wall, skin, hangers, hands, and lighting casts.
If the item is blue, return blue, not neutral.

Return ONLY valid JSON with this exact shape:
{
  "suggestedCategory": "top",
  "suggestedColor": "blue",
  "suggestedStyleNote": "blue casual t-shirt",
  "confidenceLabel": "High confidence",
  "reasons": [
    "reason 1",
    "reason 2"
  ],
  "alternativeCategories": ["top", "jacket"]
}

Rules:
- suggestedCategory must be one of: top, bottom, dress, shoes, jacket, accessory
- suggestedColor must be one of: neutral, black, white, cream, blue, green, red, pink, brown, purple, grey
- alternativeCategories must contain only allowed categories
- confidenceLabel should be one of: High confidence, Medium confidence, Low confidence
- Return JSON only. No markdown. No explanation outside JSON.
`;

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
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
                image_url: `data:${safeMimeType};base64,${imageBase64}`,
              },
            ],
          },
        ],
        max_output_tokens: 500,
      }),
    });

    const rawOpenAiText = await openAiResponse.text();

    if (!openAiResponse.ok) {
      return res.status(500).json({
        error: "OpenAI request failed",
        details: rawOpenAiText,
      });
    }

    let openAiData = null;

    try {
      openAiData = JSON.parse(rawOpenAiText);
    } catch {
      return res.status(500).json({
        error: "Could not parse OpenAI response JSON",
        details: rawOpenAiText,
      });
    }

    const outputText = extractTextFromResponsesApi(openAiData);

    if (!outputText) {
      return res.status(500).json({
        error: "OpenAI returned no output",
        details: openAiData,
      });
    }

    const parsed = extractJsonObject(outputText);

    if (!parsed) {
      return res.status(500).json({
        error: "OpenAI did not return valid JSON",
        details: outputText,
      });
    }

    const suggestedCategory = normalizeCategory(parsed.suggestedCategory);
    const suggestedColor = normalizeColor(parsed.suggestedColor);
    const suggestedStyleNote =
      typeof parsed.suggestedStyleNote === "string"
        ? parsed.suggestedStyleNote.trim()
        : "";

    const confidenceLabel =
      typeof parsed.confidenceLabel === "string" &&
      parsed.confidenceLabel.trim()
        ? parsed.confidenceLabel.trim()
        : "Medium confidence";

    const reasons =
      Array.isArray(parsed.reasons) && parsed.reasons.length > 0
        ? parsed.reasons.map((item) => String(item))
        : [
            `Detected category: ${suggestedCategory}`,
            `Detected color: ${suggestedColor}`,
          ];

    const alternativeCategories = normalizeAlternatives(
      parsed.alternativeCategories
    );

    return res.status(200).json({
      suggestedCategory,
      suggestedColor,
      suggestedStyleNote,
      confidenceLabel,
      reasons,
      alternativeCategories:
        alternativeCategories.length > 0
          ? alternativeCategories
          : ["top", "jacket"],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error",
    });
  }
}
