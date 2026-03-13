const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 1000;

/**
 * Local fallback only.
 * This is useful during local development if KV is not configured.
 * On real Vercel production deployments, you should configure KV so limits persist.
 */
const memoryStore = global.__stylesyncDetectionStore || new Map();
global.__stylesyncDetectionStore = memoryStore;

const VALID_CATEGORIES = [
  "top",
  "bottom",
  "dress",
  "shoes",
  "jacket",
  "accessory",
];

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getSecondsUntilNextUtcMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + 1);
  next.setUTCHours(0, 0, 0, 0);

  return Math.max(60, Math.floor((next.getTime() - now.getTime()) / 1000));
}

function normalizeUserId(userId) {
  return String(userId || "").trim();
}

function getProUserIds() {
  return String(process.env.PRO_USER_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getUserPlan(userId) {
  const proUserIds = getProUserIds();

  if (proUserIds.includes(userId)) {
    return "pro";
  }

  return "free";
}

function getPlanLimit(plan) {
  if (plan === "pro") {
    return PRO_DAILY_LIMIT;
  }

  return FREE_DAILY_LIMIT;
}

function getUsageKey(userId, dateKey) {
  return `wardrobe-detect:${userId}:${dateKey}`;
}

async function getKvClient() {
  try {
    const mod = await import("@vercel/kv");
    return mod.kv || mod.default || null;
  } catch (error) {
    return null;
  }
}

async function getUsageCount(userId, dateKey) {
  const key = getUsageKey(userId, dateKey);
  const kv = await getKvClient();

  if (kv) {
    const value = await kv.get(key);
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const value = memoryStore.get(key);
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function setUsageCount(userId, dateKey, count) {
  const key = getUsageKey(userId, dateKey);
  const secondsUntilReset = getSecondsUntilNextUtcMidnight();
  const kv = await getKvClient();

  if (kv) {
    await kv.set(key, count, { ex: secondsUntilReset });
    return;
  }

  memoryStore.set(key, count);
}

async function incrementUsageCount(userId, dateKey) {
  const current = await getUsageCount(userId, dateKey);
  const next = current + 1;
  await setUsageCount(userId, dateKey, next);
  return next;
}

function normalizeCategory(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (VALID_CATEGORIES.includes(normalized)) {
    return normalized;
  }

  if (
    normalized.includes("shirt") ||
    normalized.includes("tee") ||
    normalized.includes("blouse") ||
    normalized.includes("sweater") ||
    normalized.includes("knit") ||
    normalized.includes("tank")
  ) {
    return "top";
  }

  if (
    normalized.includes("pants") ||
    normalized.includes("trouser") ||
    normalized.includes("jean") ||
    normalized.includes("skirt") ||
    normalized.includes("short")
  ) {
    return "bottom";
  }

  if (normalized.includes("dress")) {
    return "dress";
  }

  if (
    normalized.includes("shoe") ||
    normalized.includes("boot") ||
    normalized.includes("sneaker") ||
    normalized.includes("heel") ||
    normalized.includes("loafer") ||
    normalized.includes("sandal")
  ) {
    return "shoes";
  }

  if (
    normalized.includes("jacket") ||
    normalized.includes("coat") ||
    normalized.includes("blazer") ||
    normalized.includes("cardigan") ||
    normalized.includes("outerwear")
  ) {
    return "jacket";
  }

  if (
    normalized.includes("bag") ||
    normalized.includes("belt") ||
    normalized.includes("hat") ||
    normalized.includes("scarf") ||
    normalized.includes("jewelry") ||
    normalized.includes("accessory")
  ) {
    return "accessory";
  }

  return "top";
}

function normalizeAlternativeCategories(value, mainCategory) {
  if (!Array.isArray(value)) {
    return [];
  }

  const cleaned = value
    .map((item) => normalizeCategory(item))
    .filter((item) => item && item !== mainCategory);

  return [...new Set(cleaned)].slice(0, 3);
}

function normalizeReasons(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function normalizeConfidenceLabel(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "Medium confidence";
  }

  return normalized;
}

function normalizeColor(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "neutral";
  }

  return normalized;
}

function normalizeStyleNote(value) {
  return String(value || "").trim();
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
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
    const sliced = text.slice(firstBrace, lastBrace + 1);
    const parsed = safeJsonParse(sliced);
    if (parsed) return parsed;
  }

  return null;
}

function extractOutputText(apiResponse) {
  if (typeof apiResponse?.output_text === "string" && apiResponse.output_text) {
    return apiResponse.output_text;
  }

  if (!Array.isArray(apiResponse?.output)) {
    return "";
  }

  for (const item of apiResponse.output) {
    if (!Array.isArray(item?.content)) continue;

    for (const contentItem of item.content) {
      if (typeof contentItem?.text === "string" && contentItem.text) {
        return contentItem.text;
      }
    }
  }

  return "";
}

function buildImageInput({ imageUrl, imageBase64, imageDataUrl, mimeType }) {
  if (imageDataUrl && String(imageDataUrl).startsWith("data:")) {
    return String(imageDataUrl);
  }

  if (imageBase64) {
    const cleanBase64 = String(imageBase64).replace(/^data:[^;]+;base64,/, "");
    const resolvedMimeType = mimeType || "image/jpeg";
    return `data:${resolvedMimeType};base64,${cleanBase64}`;
  }

  if (imageUrl) {
    return String(imageUrl);
  }

  return "";
}

async function callOpenAiWardrobeDetection({
  imageInput,
  fileName,
  profile,
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  const profileText = profile
    ? JSON.stringify(profile, null, 2)
    : "{}";

  const systemPrompt = `
You are a fashion wardrobe detector for a clothing app called StyleSync.

Your job:
- Look at ONE wardrobe item image.
- Identify the most likely clothing category.
- Suggest the main visible color.
- Write a short practical style note.
- Provide a confidence label.
- Provide short reasons.
- Provide a few alternative categories only if they are realistic.

You must classify the item into exactly one of these categories:
top, bottom, dress, shoes, jacket, accessory

Rules:
- Return JSON only.
- Do not wrap JSON in markdown.
- Keep reasons short and practical.
- Keep style note short, helpful, and natural.
- If uncertain, still choose the closest category from the allowed list.
`.trim();

  const userPrompt = `
App user profile:
${profileText}

Image file name:
${fileName || "unknown"}

Please analyze this single wardrobe item and return exactly this JSON shape:

{
  "suggestedCategory": "top",
  "suggestedColor": "blue",
  "suggestedStyleNote": "soft casual knit top",
  "confidenceLabel": "High confidence",
  "reasons": ["reason 1", "reason 2"],
  "alternativeCategories": ["jacket", "dress"]
}
`.trim();

  const requestBody = {
    model: process.env.OPENAI_WARDROBE_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: systemPrompt,
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: userPrompt,
          },
          {
            type: "input_image",
            image_url: imageInput,
          },
        ],
      },
    ],
  };

  const openAiResponse = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await openAiResponse.json();

  if (!openAiResponse.ok) {
    const message =
      data?.error?.message ||
      "OpenAI wardrobe detection request failed.";

    throw new Error(message);
  }

  const rawText = extractOutputText(data);
  const parsed = extractJsonObject(rawText);

  if (!parsed) {
    throw new Error("OpenAI returned an unexpected response format.");
  }

  const suggestedCategory = normalizeCategory(parsed.suggestedCategory);
  const alternativeCategories = normalizeAlternativeCategories(
    parsed.alternativeCategories,
    suggestedCategory
  );

  return {
    suggestedCategory,
    suggestedColor: normalizeColor(parsed.suggestedColor),
    suggestedStyleNote: normalizeStyleNote(parsed.suggestedStyleNote),
    confidenceLabel: normalizeConfidenceLabel(parsed.confidenceLabel),
    reasons: normalizeReasons(parsed.reasons),
    alternativeCategories,
  };
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const {
      userId,
      imageUrl,
      imageBase64,
      imageDataUrl,
      mimeType,
      fileName,
      profile,
    } = req.body || {};

    const normalizedUserId = normalizeUserId(userId);

    if (!normalizedUserId) {
      return res.status(400).json({
        error: "Missing required field: userId",
        code: "MISSING_USER_ID",
      });
    }

    const imageInput = buildImageInput({
      imageUrl,
      imageBase64,
      imageDataUrl,
      mimeType,
    });

    if (!imageInput) {
      return res.status(400).json({
        error:
          "Missing image data. Provide imageUrl, imageBase64, or imageDataUrl.",
        code: "MISSING_IMAGE",
      });
    }

    const todayKey = getTodayKey();
    const plan = getUserPlan(normalizedUserId);
    const limit = getPlanLimit(plan);

    const currentCount = await getUsageCount(normalizedUserId, todayKey);

    if (currentCount >= limit) {
      return res.status(429).json({
        error: "Daily wardrobe detection limit reached.",
        code: "DAILY_LIMIT_REACHED",
        upgradeRequired: plan === "free",
        remaining: 0,
        limit,
        plan,
        resetDate: todayKey,
      });
    }

    const detection = await callOpenAiWardrobeDetection({
      imageInput,
      fileName,
      profile,
    });

    const newCount = await incrementUsageCount(normalizedUserId, todayKey);
    const remaining = Math.max(0, limit - newCount);

    return res.status(200).json({
      ...detection,
      remaining,
      limit,
      plan,
      upgradeRequired: false,
    });
  } catch (error) {
    console.error("detect-wardrobe error:", error);

    return res.status(500).json({
      error: error?.message || "Wardrobe detection failed.",
      code: "WARDROBE_DETECTION_FAILED",
    });
  }
};
