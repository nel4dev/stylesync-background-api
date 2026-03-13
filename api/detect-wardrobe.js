const DAILY_LIMIT = 10;
const requestStore = new Map();

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

function normalizeCategory(value = "") {
  const normalized = normalizeValue(value);
  return ALLOWED_CATEGORIES.includes(normalized) ? normalized : "top";
}

function normalizeColor(value = "") {
  const normalized = normalizeValue(value);
  return ALLOWED_COLORS.includes(normalized) ? normalized : "neutral";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function getUserId(req, bodyUserId) {
  return (
    bodyUserId ||
    req.headers["x-user-id"] ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "free-user"
  );
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isRateLimited(userId) {
  const today = getTodayKey();
  const entry = requestStore.get(userId);

  if (!entry || entry.date !== today) {
    requestStore.set(userId, { count: 1, date: today });
    return false;
  }

  if (entry.count >= DAILY_LIMIT) {
    return true;
  }

  entry.count += 1;
  return false;
}

function getRemainingRequests(userId) {
  const today = getTodayKey();
  const entry = requestStore.get(userId);

  if (!entry || entry.date !== today) {
    return DAILY_LIMIT;
  }

  return Math.max(0, DAILY_LIMIT - entry.count);
}

function extractTextFromResponse(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (Array.isArray(data?.output)) {
    for (const item of data.output) {
      if (!Array.isArray(item?.content)) continue;

      for (const contentItem of item.content) {
        if (
          contentItem?.type === "output_text" &&
          typeof contentItem?.text === "string" &&
          contentItem.text.trim()
        ) {
          return contentItem.text.trim();
        }
      }
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
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY environment variable.",
      });
    }

    const {
      imageBase64,
      mimeType,
      userId: bodyUserId,
      fileName,
      imageWidth,
      imageHeight,
      profile,
    } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64." });
    }

    const userId = String(getUserId(req, bodyUserId));

    if (isRateLimited(userId)) {
      return res.status(429).json({
        error: "Daily detection limit reached.",
        limit: DAILY_LIMIT,
        remaining: 0,
      });
    }

    const safeMimeType = mimeType || "image/jpeg";
    const dataUrl = `data:${safeMimeType};base64,${imageBase64}`;

    const prompt = `
You are a fashion wardrobe detection assistant.

Your job:
1. Look only at the clothing item in the image.
2. Ignore the background completely.
3. Ignore shadows, floor, wall, hands, mannequin, hanger, and surrounding objects.
4. Detect the SINGLE main wardrobe item.
5. Return valid JSON only.

Allowed categories:
${JSON.stringify(ALLOWED_CATEGORIES)}

Allowed colors:
${JSON.stringify(ALLOWED_COLORS)}

Rules for color:
- Pick the dominant visible color of the clothing item itself.
- Do not default to "neutral" unless the item is truly beige/taupe/tan/off-white/muted neutral.
- If the item is clearly blue, return "blue".
- If the item is clearly black, return "black".
- If the item is clearly white, return "white".
- If the item is clearly cream/off-white, return "cream".
- If uncertain between two colors, choose the closest visible dominant color.

Rules for category:
- "top" for shirts, blouses, sweaters, t-shirts, tanks
- "bottom" for pants, jeans, skirts, shorts
- "dress" for dresses
- "shoes" for footwear
- "jacket" for jackets, blazers, coats, outer layers
- "accessory" for bags, hats, belts, scarves, jewelry

Style note:
- Keep it short and practical
- Example: "blue casual t-shirt"
- Example: "black ankle boots"
- Example: "cream structured blazer"

Confidence label:
- Use one of: "High confidence", "Medium confidence", "Low confidence"

Return exactly this JSON shape:
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

Extra context:
fileName: ${JSON.stringify(fileName || "")}
imageWidth: ${Number(imageWidth || 0)}
imageHeight: ${Number(imageHeight || 0)}
profile: ${JSON.stringify(profile || null)}
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
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
                image_url: dataUrl,
                detail: "high",
              },
            ],
          },
        ],
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI request failed",
        details: rawText,
      });
    }

    let openaiData;

    try {
      openaiData = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        error: "Invalid JSON returned from OpenAI.",
        details: rawText,
      });
    }

    const outputText = extractTextFromResponse(openaiData);

    if (!outputText) {
      return res.status(500).json({
        error: "OpenAI returned no output",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(outputText);
    } catch {
      return res.status(500).json({
        error: "OpenAI returned non-JSON output",
        details: outputText,
      });
    }

    const finalResult = {
      suggestedCategory: normalizeCategory(parsed?.suggestedCategory),
      suggestedColor: normalizeColor(parsed?.suggestedColor),
      suggestedStyleNote: String(parsed?.suggestedStyleNote || ""),
      confidenceLabel: String(parsed?.confidenceLabel || "Medium confidence"),
      reasons: normalizeStringArray(parsed?.reasons).slice(0, 4),
      alternativeCategories: normalizeStringArray(parsed?.alternativeCategories)
        .map((item) => normalizeCategory(item))
        .filter((item, index, arr) => arr.indexOf(item) === index)
        .slice(0, 3),
      remaining: getRemainingRequests(userId),
      limit: DAILY_LIMIT,
    };

    return res.status(200).json(finalResult);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error",
    });
  }
}
