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

function normalizeString(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function normalizeUndertone(value) {
  const text = String(value || "").trim().toLowerCase();

  if (text.includes("warm")) return "warm";
  if (text.includes("cool")) return "cool";
  if (text.includes("neutral")) return "neutral";

  return "neutral";
}

function normalizeContrastLevel(value) {
  const text = String(value || "").trim().toLowerCase();

  if (text.includes("high")) return "high";
  if (text.includes("low")) return "low";
  if (text.includes("medium")) return "medium";

  return "medium";
}

function normalizeSeason(value) {
  const text = String(value || "").trim();
  return text || "Balanced";
}

function normalizeColors(value, fallback = []) {
  const arr = ensureArray(value)
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  if (arr.length > 0) {
    return [...new Set(arr)].slice(0, 8);
  }

  return fallback;
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

    const { imageBase64, gender, country } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const prompt = `
You are a professional AI color analysis assistant for a fashion styling app.

Analyze this selfie only for personal color analysis and styling harmony.

Important rules:
- Focus only on visible styling-related color traits.
- Use the face, skin, hair, and eyes to estimate a practical seasonal color palette.
- Assume the user uploaded a clear selfie for color analysis.
- If lighting is imperfect, still return your best estimate and mention that briefly in styleSummary.
- Do not mention attractiveness, ethnicity, health, or age.
- Do not give medical advice.
- Use the provided gender context if available: ${normalizeString(gender, "not provided")}.
- Use the provided country context if available: ${normalizeString(country, "not provided")}.

Return ONLY valid JSON in this exact shape:
{
  "season": "Soft Autumn",
  "undertone": "warm",
  "contrastLevel": "medium",
  "skinTone": "medium",
  "hairColor": "dark brown",
  "eyeColor": "brown",
  "bestColors": ["olive", "camel", "warm beige", "terracotta", "soft teal"],
  "avoidColors": ["icy grey", "stark white", "neon pink"],
  "neutrals": ["cream", "warm taupe", "soft brown"],
  "metals": ["gold", "bronze"],
  "makeupHints": ["peach blush", "warm nude lip"],
  "styleSummary": "Soft, warm, muted tones will harmonize best with your coloring."
}

Field guidance:
- season: likely seasonal palette such as Light Spring, Warm Spring, Soft Autumn, Deep Autumn, Cool Summer, Soft Summer, Clear Winter, Deep Winter
- undertone: warm, cool, or neutral
- contrastLevel: low, medium, or high
- skinTone: short styling description only
- hairColor: short styling description only
- eyeColor: short styling description only
- bestColors: most flattering clothing colors
- avoidColors: colors that are usually less flattering
- neutrals: best neutral wardrobe colors
- metals: best jewelry metal tones
- makeupHints: short optional beauty color hints
- styleSummary: a short 1 to 3 sentence styling summary
`.trim();

    const openAiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_COLOR_MODEL || "gpt-4.1",
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
                image_base64: imageBase64,
              },
            ],
          },
        ],
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return res.status(500).json({
        error: data?.error?.message || "OpenAI color analysis request failed",
      });
    }

    const outputText = extractOutputText(data);
    const parsed = extractJsonObject(outputText);

    if (!parsed) {
      return res.status(200).json({
        season: "Balanced",
        undertone: "neutral",
        contrastLevel: "medium",
        skinTone: "",
        hairColor: "",
        eyeColor: "",
        bestColors: [],
        avoidColors: [],
        neutrals: [],
        metals: [],
        makeupHints: [],
        styleSummary: outputText || "No structured color analysis returned.",
      });
    }

    return res.status(200).json({
      season: normalizeSeason(parsed.season),
      undertone: normalizeUndertone(parsed.undertone),
      contrastLevel: normalizeContrastLevel(parsed.contrastLevel),
      skinTone: normalizeString(parsed.skinTone),
      hairColor: normalizeString(parsed.hairColor),
      eyeColor: normalizeString(parsed.eyeColor),
      bestColors: normalizeColors(parsed.bestColors, [
        "cream",
        "taupe",
        "soft blue",
      ]),
      avoidColors: normalizeColors(parsed.avoidColors),
      neutrals: normalizeColors(parsed.neutrals, ["cream", "taupe", "brown"]),
      metals: normalizeColors(parsed.metals, ["gold", "silver"]),
      makeupHints: normalizeColors(parsed.makeupHints),
      styleSummary: normalizeString(
        parsed.styleSummary,
        "These tones appear to work best for your overall coloring."
      ),
    });
  } catch (error) {
    console.error("AI color analysis error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
