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

function normalizeValue(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeCategory(category = "") {
  const value = normalizeValue(category);

  if (ALLOWED_CATEGORIES.includes(value)) {
    return value;
  }

  const categoryMap = {
    blouse: "top",
    shirt: "top",
    tshirt: "top",
    "t-shirt": "top",
    tee: "top",
    sweater: "top",
    knit: "top",
    hoodie: "top",
    tank: "top",
    cami: "top",
    bodysuit: "top",

    pants: "bottom",
    trousers: "bottom",
    trouser: "bottom",
    jeans: "bottom",
    jean: "bottom",
    skirt: "bottom",
    shorts: "bottom",
    leggings: "bottom",
    legging: "bottom",

    blazer: "jacket",
    coat: "jacket",
    cardigan: "jacket",
    trench: "jacket",
    outerwear: "jacket",

    boot: "shoes",
    boots: "shoes",
    heel: "shoes",
    heels: "shoes",
    sneaker: "shoes",
    sneakers: "shoes",
    sandal: "shoes",
    sandals: "shoes",
    loafer: "shoes",
    loafers: "shoes",
    flat: "shoes",
    flats: "shoes",

    handbag: "accessory",
    bag: "accessory",
    purse: "accessory",
    jewelry: "accessory",
    jewellery: "accessory",
    necklace: "accessory",
    bracelet: "accessory",
    ring: "accessory",
    rings: "accessory",
    scarf: "accessory",
    hat: "accessory",
    sunglasses: "accessory",
  };

  return categoryMap[value] || "top";
}

function normalizeColor(color = "") {
  const value = normalizeValue(color);

  if (ALLOWED_COLORS.includes(value)) {
    return value;
  }

  if (
    value.includes("blue") ||
    value.includes("navy") ||
    value.includes("sky") ||
    value.includes("baby blue") ||
    value.includes("light blue") ||
    value.includes("dark blue") ||
    value.includes("denim")
  ) {
    return "blue";
  }

  if (
    value.includes("green") ||
    value.includes("olive") ||
    value.includes("sage") ||
    value.includes("emerald")
  ) {
    return "green";
  }

  if (
    value.includes("red") ||
    value.includes("burgundy") ||
    value.includes("maroon") ||
    value.includes("wine")
  ) {
    return "red";
  }

  if (
    value.includes("pink") ||
    value.includes("blush") ||
    value.includes("rose")
  ) {
    return "pink";
  }

  if (
    value.includes("purple") ||
    value.includes("lavender") ||
    value.includes("lilac") ||
    value.includes("violet")
  ) {
    return "purple";
  }

  if (
    value.includes("brown") ||
    value.includes("tan") ||
    value.includes("camel") ||
    value.includes("taupe") ||
    value.includes("chocolate")
  ) {
    return "brown";
  }

  if (
    value.includes("grey") ||
    value.includes("gray") ||
    value.includes("silver")
  ) {
    return "grey";
  }

  if (
    value.includes("white") ||
    value.includes("off white") ||
    value.includes("off-white")
  ) {
    return "white";
  }

  if (
    value.includes("cream") ||
    value.includes("beige") ||
    value.includes("ivory")
  ) {
    return "cream";
  }

  if (value.includes("black")) {
    return "black";
  }

  if (
    value.includes("neutral") ||
    value.includes("khaki") ||
    value.includes("stone")
  ) {
    return "neutral";
  }

  return "neutral";
}

function normalizeConfidenceLabel(label = "") {
  const value = normalizeValue(label);

  if (value.includes("high")) return "High confidence";
  if (value.includes("medium")) return "Medium confidence";
  return "Low confidence";
}

function normalizeReasons(reasons) {
  if (!Array.isArray(reasons)) {
    return [
      "AI vision analyzed the garment directly from the cleaned image.",
      "You can still edit the result before saving.",
    ];
  }

  const cleaned = reasons
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 3);

  if (cleaned.length > 0) {
    return cleaned;
  }

  return [
    "AI vision analyzed the garment directly from the cleaned image.",
    "You can still edit the result before saving.",
  ];
}

function normalizeAlternativeCategories(categories, primaryCategory) {
  const raw = Array.isArray(categories) ? categories : [];

  const cleaned = raw
    .map((item) => normalizeCategory(item))
    .filter((item) => item !== primaryCategory);

  const unique = [...new Set(cleaned)];

  if (unique.length > 0) {
    return unique.slice(0, 3);
  }

  return ALLOWED_CATEGORIES.filter((item) => item !== primaryCategory).slice(0, 3);
}

function normalizeStyleNote(styleNote = "", category = "top", color = "neutral") {
  const cleaned = String(styleNote || "").trim();

  if (cleaned) {
    return cleaned.slice(0, 60);
  }

  if (color && color !== "neutral") {
    return `${color} ${category}`;
  }

  return category;
}

function extractAssistantText(data) {
  const messageContent = data?.choices?.[0]?.message?.content;

  if (typeof messageContent === "string") {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    const textPart = messageContent.find((part) => typeof part?.text === "string");
    if (textPart?.text) {
      return textPart.text;
    }
  }

  return "";
}

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

    const safeMimeType = mimeType || "image/jpeg";
    const cleanBase64 = String(imageBase64).replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    );

    const imageDataUrl = `data:${safeMimeType};base64,${cleanBase64}`;
    const stylePreference = String(profile?.stylePreference || "").trim();
    const occasion = String(profile?.occasion || "").trim();

    const developerPrompt = `
You are a fashion wardrobe tagging assistant for a styling app.

You will analyze ONE cleaned clothing image with the background already removed.

Your most important task is to identify the DOMINANT GARMENT COLOR from the actual visible garment pixels.

Rules:
- The background has already been removed, so focus only on the garment.
- Do NOT default to "neutral" unless the garment color is genuinely unclear.
- If the item is visibly blue in any shade, return a blue-family value such as "blue", "navy", "light blue", or "denim blue".
- If the item is visibly black, white, cream, green, red, pink, brown, purple, or grey, return that family.
- Base the color on what is most visually dominant on the garment itself.
- Category must be one of: top, bottom, dress, shoes, jacket, accessory.
- Keep style note short and fashion-friendly.

Return ONLY valid JSON in this exact shape:
{
  "suggestedCategory": "top",
  "suggestedColor": "blue",
  "suggestedStyleNote": "casual cotton t-shirt",
  "confidenceLabel": "High confidence",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "alternativeCategories": ["dress", "jacket", "accessory"]
}
`;

    const userPrompt = `
User style context:
- stylePreference: ${stylePreference || "not provided"}
- occasion: ${occasion || "not provided"}

Analyze this cleaned clothing image carefully.
Focus especially on the dominant visible garment color.
`;

    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer ${apiKey}\`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "developer",
              content: developerPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: userPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageDataUrl,
                    detail: "high",
                  },
                },
              ],
            },
          ],
          max_completion_tokens: 400,
        }),
      }
    );

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return res.status(500).json({
        error: "OpenAI request failed",
        details: errorText,
      });
    }

    const data = await openAiResponse.json();
    const rawText = extractAssistantText(data);

    if (!rawText) {
      return res.status(500).json({
        error: "OpenAI returned no content.",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse OpenAI JSON response.",
        details: parseError?.message || "Unknown JSON parse error",
        rawText,
      });
    }

    const suggestedCategory = normalizeCategory(parsed?.suggestedCategory);
    const suggestedColor = normalizeColor(parsed?.suggestedColor);
    const suggestedStyleNote = normalizeStyleNote(
      parsed?.suggestedStyleNote,
      suggestedCategory,
      suggestedColor
    );
    const confidenceLabel = normalizeConfidenceLabel(parsed?.confidenceLabel);
    const reasons = normalizeReasons(parsed?.reasons);
    const alternativeCategories = normalizeAlternativeCategories(
      parsed?.alternativeCategories,
      suggestedCategory
    );

    return res.status(200).json({
      suggestedCategory,
      suggestedColor,
      suggestedStyleNote,
      confidenceLabel,
      reasons,
      alternativeCategories,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error",
    });
  }
}
