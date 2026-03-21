const OPENAI_API_URL = "https://api.openai.com/v1/responses";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { imageBase64, gender } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    const response = await fetch(OPENAI_API_URL, {
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
                text: `
You are a professional fashion stylist AI.

Analyze this full body image.

Return:
- bodyType
- proportions
- keyFitIssues
- bestClothing
- stylingAdvice

IMPORTANT:
User is wearing fitted clothing (gym/swimwear).
Focus on real proportions.

Respond ONLY as JSON.
                `,
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

    const data = await response.json();

    const output = data?.output?.[0]?.content?.[0]?.text;

    let parsed;

    try {
      parsed = JSON.parse(output);
    } catch {
      parsed = { raw: output };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("AI body analysis error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
