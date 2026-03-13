const DAILY_LIMIT = 10;

const requestStore = new Map();

function getUserId(req) {
  const userId =
    req.headers["x-user-id"] ||
    req.body?.userId ||
    "anonymous";

  return String(userId).trim();
}

function isRateLimited(userId) {
  const today = new Date().toISOString().slice(0, 10);

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = getUserId(req);

  if (isRateLimited(userId)) {
    return res.status(429).json({
      error: "Daily limit reached",
      message: "Free plan allows 10 AI detections per day."
    });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY environment variable."
      });
    }

    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64." });
    }

    const safeMimeType = mimeType || "image/jpeg";

    const prompt = `
You are a fashion wardrobe detector.

Analyze the clothing item in this image.

Ignore the background completely.

Return ONLY valid JSON:

{
  "suggestedCategory":"top|bottom|dress|shoes|jacket|accessory",
  "suggestedColor":"neutral|black|white|cream|blue|green|red|pink|brown|purple|grey",
  "suggestedStyleNote":"short clothing description",
  "confidenceLabel":"High confidence|Medium confidence|Low confidence",
  "reasons":["reason1","reason2"],
  "alternativeCategories":["top","jacket"]
}

Important:
- Ignore the background completely.
- Focus only on the clothing item.
- If the item is navy, sky blue, denim blue, or any shade of blue, return "blue".
- Do not return markdown.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              {
                type: "input_image",
                image_url: `data:${safeMimeType};base64,${imageBase64}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI request failed",
        details: JSON.stringify(data, null, 2)
      });
    }

    if (!data.output_text) {
      return res.status(500).json({
        error: "OpenAI returned no output"
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(data.output_text);
    } catch {
      return res.status(500).json({
        error: "Invalid JSON returned by OpenAI",
        details: data.output_text
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error"
    });
  }
}
