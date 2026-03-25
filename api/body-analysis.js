const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}

function extractOutputText(apiResponse) {
  if (typeof apiResponse?.output_text === "string" && apiResponse.output_text) {
    return apiResponse.output_text;
  }

  if (!Array.isArray(apiResponse?.output)) return "";

  for (const item of apiResponse.output) {
    if (!Array.isArray(item?.content)) continue;

    for (const contentItem of item.content) {
      if (typeof contentItem?.text === "string" && contentItem.text.trim()) {
        return contentItem.text;
      }
    }
  }

  return "";
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJsonObject(text) {
  if (!text) return null;

  const direct = safeJsonParse(text);
  if (direct) return direct;

  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const parsed = safeJsonParse(fencedMatch[1]);
    if (parsed) return parsed;
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return safeJsonParse(text.slice(firstBrace, lastBrace + 1));
  }

  return null;
}

function ensureArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  try {
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { imageBase64, gender } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const prompt = `
You are a professional body-shape and fashion styling AI.

Analyze this full-body image for clothing fit and styling purposes.

Important rules:
- The person is wearing fitted clothing such as gym wear or swimwear.
- Focus on visible body proportions and clothing fit logic only.
- Do not mention nudity or sensitive commentary.
- Do not estimate age, ethnicity, health, or attractiveness.
- Keep the answer useful for fashion styling.
- Use the provided gender context if available: ${String(gender || "").trim() || "not provided"}.
- If the image is unclear, still return your best styling-oriented estimate and say so briefly in "raw".

Return ONLY valid JSON in this exact shape:
{
  "bodyType": "string",
  "proportions": ["string"],
  "keyFitIssues": ["string"],
  "bestClothing": ["string"],
  "stylingAdvice": ["string"],
  "shoppingFocus": ["string"],
  "raw": "string"
}

What each field means:
- bodyType: likely body shape, for example pear, apple, hourglass, rectangle, inverted triangle, oval, balanced shape
- proportions: visible proportion observations such as long legs, long torso, balanced proportions, broader shoulders, defined waist
- keyFitIssues: practical fit notes that matter for styling
- bestClothing: the types of clothing that will usually flatter this shape
- stylingAdvice: short practical styling advice
- shoppingFocus: the best categories or fit directions to shop for next
- raw: a short 1 to 3 sentence stylist summary
`.trim();

    const openAiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
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
  image_url: `data:image/jpeg;base64,${imageBase64}`,
}
            ],
          },
        ],
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return res.status(500).json({
        error: data?.error?.message || "OpenAI body analysis request failed",
      });
    }

    const outputText = extractOutputText(data);
    const parsed = extractJsonObject(outputText);

    if (!parsed) {
      return res.status(200).json({
        bodyType: "",
        proportions: [],
        keyFitIssues: [],
        bestClothing: [],
        stylingAdvice: [],
        shoppingFocus: [],
        raw: outputText || "No structured analysis returned.",
      });
    }

    return res.status(200).json({
      bodyType: String(parsed.bodyType || "").trim(),
      proportions: ensureArray(parsed.proportions),
      keyFitIssues: ensureArray(parsed.keyFitIssues),
      bestClothing: ensureArray(parsed.bestClothing),
      stylingAdvice: ensureArray(parsed.stylingAdvice),
      shoppingFocus: ensureArray(parsed.shoppingFocus),
      raw: String(parsed.raw || "").trim(),
    });
  } catch (error) {
    console.error("AI body analysis error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
