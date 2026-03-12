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

function normalizeColor(value = "") {
  const normalized = String(value || "").trim().toLowerCase();

  if (!normalized) return "neutral";

  if (ALLOWED_COLORS.includes(normalized)) {
    return normalized;
  }

  if (
    normalized.includes("blue") ||
    normalized.includes("navy") ||
    normalized.includes("sky") ||
    normalized.includes("baby blue") ||
    normalized.includes("powder blue") ||
    normalized.includes("denim")
  ) {
    return "blue";
  }

  if (
    normalized.includes("green") ||
    normalized.includes("olive") ||
    normalized.includes("sage") ||
    normalized.includes("mint")
  ) {
    return "green";
  }

  if (
    normalized.includes("red") ||
    normalized.includes("burgundy") ||
    normalized.includes("maroon") ||
    normalized.includes("wine")
  ) {
    return "red";
  }

  if (
    normalized.includes("pink") ||
    normalized.includes("rose") ||
    normalized.includes("blush")
  ) {
    return "pink";
  }

  if (
    normalized.includes("purple") ||
    normalized.includes("lavender") ||
    normalized.includes("lilac") ||
    normalized.includes("violet")
  ) {
    return "purple";
  }

  if (
    normalized.includes("brown") ||
    normalized.includes("tan") ||
    normalized.includes("camel") ||
    normalized.includes("mocha")
  ) {
    return "brown";
  }

  if (
    normalized.includes("grey") ||
    normalized.includes("gray") ||
    normalized.includes("charcoal")
  ) {
    return "grey";
  }

  if (normalized.includes("white")) {
    return "white";
  }

  if (
    normalized.includes("cream") ||
    normalized.includes("ivory") ||
    normalized.includes("off white") ||
    normalized.includes("off-white")
  ) {
    return "cream";
  }

  if (normalized.includes("black")) {
    return "black";
  }

  if (
    normalized.includes("neutral") ||
    normalized.includes("beige") ||
    normalized.includes("stone") ||
    normalized.includes("taupe")
  ) {
    return "neutral";
  }

  return "neutral";
}

function normalizeCategory(value = "") {
  const normalized = String(value || "").trim().toLowerCase();

  if (ALLOWED_CATEGORIES.includes(normalized)) {
    return normalized;
  }

  if (
    normalized.includes("shirt") ||
    normalized.includes("top") ||
    normalized.includes("t-shirt") ||
    normalized.includes("tshirt") ||
    normalized.includes("blouse")
  ) {
    return "top";
  }

  if (
    normalized.includes("pant") ||
    normalized.includes("trouser") ||
    normalized.includes("jean") ||
    normalized.includes("bottom") ||
    normalized.includes("skirt")
  ) {
    return "bottom";
  }

  if (normalized.includes("dress")) {
    return "dress";
  }

  if (
    normalized.includes("shoe") ||
    normalized.includes("sneaker") ||
    normalized.includes("boot") ||
    normalized.includes("heel")
  ) {
    return "shoes";
  }

  if (
    normalized.includes("jacket") ||
    normalized.includes("coat") ||
    normalized.includes("blazer") ||
    normalized.includes("hoodie")
  ) {
    return "jacket";
  }

  if (
    normalized.includes("bag") ||
    normalized.includes("belt") ||
    normalized.includes("hat") ||
    normalized.includes("accessory")
  ) {
    return "accessory";
  }

  return "top";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing OPENAI_API_KEY environment variable",
      });
    }

    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64",
      });
    }

    const safeMime = mimeType || "image/jpeg";

    const imageUrl = `data:${safeMime};base64,${String(imageBase64).replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    )}`;

    const prompt = `
You are a wardrobe AI assistant.

Analyze the clothing item in the image.

Ignore the background completely.
Focus only on the garment itself.

Return JSON ONLY with this format:

{
"suggestedCategory": "top | bottom | dress | shoes | jacket | accessory",
"suggestedColor": "neutral | black | white | cream | blue | green | red | pink | brown | purple | grey",
"suggestedStyleNote": "short fashion description",
"confidenceLabel": "High confidence | Medium confidence | Low confidence",
"reasons": ["reason 1", "reason 2"],
"alternativeCategories": ["top"]
}

Important color rule:
If the item is navy, sky blue, baby blue, denim, powder blue or any blue shade → return "blue".
`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
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
                  image_url: imageUrl,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await openaiResponse.json();

    const outputText =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "";

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
        error: "Invalid JSON returned by OpenAI",
        details: outputText,
      });
    }

    return res.status(200).json({
      suggestedCategory: normalizeCategory(parsed.suggestedCategory),
      suggestedColor: normalizeColor(parsed.suggestedColor),
      suggestedStyleNote: parsed.suggestedStyleNote || "",
      confidenceLabel: parsed.confidenceLabel || "Medium confidence",
      reasons: parsed.reasons || [],
      alternativeCategories: parsed.alternativeCategories || ["top"],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error",
    });
  }
}
